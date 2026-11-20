import Question from '../models/Question.js';
import Vote from '../models/Vote.js';
import { generateDaily } from '../services/llm.js';

const generations = new Map();

const dateKey = (date) => date.toISOString().slice(0, 10);

const createSeededRandom = (date) => {
  let seed = 2166136261;
  for (let index = 0; index < date.length; index += 1) {
    seed = Math.imul(seed ^ date.charCodeAt(index), 16777619) >>> 0;
  }
  return () => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const createCommunityVotes = (date) => {
  const random = createSeededRandom(date);
  const total = 55 + Math.floor(random() * 296);
  const weights = Array.from({ length: 4 }, () => random() + 0.1);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const counts = weights.map((weight) => Math.floor((weight / weightTotal) * total));
  const remainder = total - counts.reduce((sum, count) => sum + count, 0);
  const order = weights
    .map((weight, index) => ({ index, fraction: (weight / weightTotal) * total - counts[index] }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; index < remainder; index += 1) counts[order[index].index] += 1;
  return counts;
};

const getPercentages = (counts) => {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (!total) return counts.map(() => 0);
  const exact = counts.map((count) => (count / total) * 100);
  const percentages = exact.map(Math.floor);
  const remaining = 100 - percentages.reduce((sum, percentage) => sum + percentage, 0);
  const order = exact
    .map((percentage, index) => ({ index, fraction: percentage - percentages[index] }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; index < remaining; index += 1) percentages[order[index].index] += 1;
  return percentages;
};

const ensureCommunityVotes = async (question) => {
  if (question.communityVotes?.length === 4) return question;
  const communityVotes = createCommunityVotes(question.date);
  const updated = await Question.findOneAndUpdate(
    { _id: question._id, communityVotes: { $exists: false } },
    { $set: { communityVotes } },
    { new: true }
  );
  return updated || Question.findById(question._id);
};

const getQuestionOfTheDay = async () => {
  const today = new Date();
  const date = dateKey(today);
  const existing = await Question.findOne({ date });
  if (existing) return existing;

  const templates = await Question.find({ date: { $gte: '2000-01-01', $lte: '2000-01-30' } }).sort({ date: 1 });
  if (!templates.length) return null;
  const dayOfYear = Math.floor(
    (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) -
      Date.UTC(today.getUTCFullYear(), 0, 0)) / 86400000
  );
  const text = templates[dayOfYear % templates.length].text;
  try {
    return await Question.findOneAndUpdate(
      { date },
      { $setOnInsert: { date, text } },
      { new: true, upsert: true }
    );
  } catch (error) {
    if (error.code === 11000) return Question.findOne({ date });
    throw error;
  }
};

const ensureGenerated = async (question) => {
  if (question.explanation && question.options?.length === 4) return question;
  const id = question._id.toString();
  if (!generations.has(id)) {
    generations.set(id, (async () => {
      const current = await Question.findById(id);
      if (current.explanation && current.options?.length === 4) return current;
      const generated = await generateDaily(current.text);
      if (generated.fallback) {
        return { ...current.toObject(), options: generated.options.map((text) => ({ text })), explanation: '' };
      }
      current.options = generated.options;
      current.explanation = generated.explanation;
      current.generatedAt = new Date();
      await current.save();
      return current;
    })());
  }
  try {
    return await generations.get(id);
  } finally {
    generations.delete(id);
  }
};

const getStreak = async (userId) => {
  const votes = await Vote.find({ user: userId }).select('createdAt');
  const voteDays = new Set(votes.map(({ createdAt }) => dateKey(createdAt)));
  const today = new Date();
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (!voteDays.has(dateKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (voteDays.has(dateKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
};

const getPayload = async (question, userId) => {
  question = await ensureGenerated(question);
  const vote = await Vote.findOne({ user: userId, question: question._id });
  const actualCounts = await Vote.aggregate([
    { $match: { question: question._id } },
    { $group: { _id: '$optionIndex', count: { $sum: 1 } } }
  ]);
  const actualCountByOption = new Map(actualCounts.map(({ _id, count }) => [_id, count]));
  const actualVotes = question.options.map((_, index) => actualCountByOption.get(index) || 0);
  const simulatedVotes = question.communityVotes;
  const combinedVotes = simulatedVotes.map((count, index) => count + actualVotes[index]);
  const percentages = getPercentages(combinedVotes);
  const payload = {
    question: question.text,
    options: question.options.map(({ text }) => ({ text })),
    myVote: vote?.optionIndex ?? null,
    streak: await getStreak(userId),
    results: {
      options: question.options.map(({ text }, index) => ({
        text,
        votes: combinedVotes[index],
        percentage: percentages[index]
      })),
      totalVotes: combinedVotes.reduce((sum, count) => sum + count, 0)
    }
  };

  if (vote) {
    payload.explanation = question.explanation;
  }
  return payload;
};

export const getDailyQuestion = async (req, res) => {
  try {
    const question = await getQuestionOfTheDay();
    if (!question) return res.status(404).json({ message: 'No question found.' });
    res.json(await getPayload(await ensureCommunityVotes(question), req.user.id));
  } catch (error) {
    console.error(error.message, error.stack, error.groqResponseBody);
    res.status(500).json({ message: "Could not load today's question." });
  }
};

export const submitDailyVote = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    if (optionIndex !== null && (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3)) {
      return res.status(400).json({ message: 'Choose a valid option.' });
    }
    const question = await getQuestionOfTheDay();
    if (!question) return res.status(404).json({ message: 'No question found.' });
    const generated = await ensureGenerated(await ensureCommunityVotes(question));
    if (optionIndex !== null && optionIndex >= generated.options.length) {
      return res.status(400).json({ message: 'Choose a valid option.' });
    }
    const filter = { user: req.user.id, question: generated._id };
    let existing = await Vote.findOne(filter);
    if (optionIndex === null) {
      if (existing) await Vote.deleteOne({ _id: existing._id });
    } else if (existing) {
      existing.optionIndex = optionIndex;
      await existing.save();
    } else {
      try {
        await Vote.create({ ...filter, optionIndex });
      } catch (error) {
        if (error.code !== 11000) throw error;
        existing = await Vote.findOneAndUpdate(filter, { $set: { optionIndex } }, { new: true });
      }
    }
    res.status(existing || optionIndex === null ? 200 : 201).json(await getPayload(generated, req.user.id));
  } catch (error) {
    console.error(error.message, error.stack, error.groqResponseBody);
    res.status(500).json({ message: 'Could not save your vote.' });
  }
};
