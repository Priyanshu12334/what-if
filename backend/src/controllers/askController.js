import { askWhatIf } from '../services/llm.js';
import Answer from '../models/Answer.js';
import AskUsage from '../models/AskUsage.js';

export const DAILY_LIMIT = 10;

const getDateKey = (date = new Date()) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const ensureUsage = async (user, dateKey) => {
  let usage = await AskUsage.findOne({ user, dateKey }).select('count').lean();
  if (usage) return usage;

  const start = new Date(`${dateKey}T00:00:00+05:30`);
  const count = await Answer.countDocuments({
    user,
    question: null,
    createdAt: { $gte: start, $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) }
  });

  try {
    return await AskUsage.create({ user, dateKey, count });
  } catch (err) {
    if (err.code !== 11000) throw err;
    usage = await AskUsage.findOne({ user, dateKey }).select('count').lean();
    if (!usage) throw err;
    return usage;
  }
};

const getRemaining = async (user, dateKey) => {
  const usage = await ensureUsage(user, dateKey);
  return Math.max(0, DAILY_LIMIT - (usage?.count || 0));
};

const reserveSlot = async (user, dateKey) => {
  await ensureUsage(user, dateKey);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await AskUsage.findOneAndUpdate(
        { user, dateKey, count: { $lt: DAILY_LIMIT } },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    } catch (err) {
      if (err.code !== 11000) throw err;
      if (attempt === 0) continue;
      const usage = await AskUsage.findOne({ user, dateKey }).select('count').lean();
      if (!usage || usage.count >= DAILY_LIMIT) return null;
      throw err;
    }
  }
  return null;
};

const refundSlot = async (user, dateKey) => {
  const usage = await AskUsage.findOneAndUpdate(
    { user, dateKey, count: { $gt: 0 } },
    { $inc: { count: -1 } },
    { new: true }
  );
  return Math.max(0, DAILY_LIMIT - (usage?.count || 0));
};

export const getAskLimit = async (req, res) => {
  try {
    const usage = await AskUsage.findOne({ user: req.user.id, dateKey: getDateKey() })
      .select('count')
      .lean();
    const remaining = Math.max(0, DAILY_LIMIT - (usage?.count || 0));
    res.json({ remaining, limit: DAILY_LIMIT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const pruneHistory = async (userId) => {
  const filter = { user: userId, question: null };
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await Answer.deleteMany({ ...filter, createdAt: { $lt: cutoff } });
  const excess = await Answer.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(20)
    .select('_id')
    .lean();
  if (excess.length) {
    await Answer.deleteMany({ ...filter, _id: { $in: excess.map(({ _id }) => _id) } });
  }
};

export const ask = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const trimmed = prompt.trim();

    if (trimmed.length > 200) {
      return res.status(400).json({ error: 'Prompt must be 200 characters or less' });
    }

    const userId = req.user.id;
    const dateKey = getDateKey();
    const reservation = await reserveSlot(userId, dateKey);
    if (!reservation) {
      return res.status(429).json({
        code: 'DAILY_LIMIT',
        remaining: 0,
        message: 'Daily limit reached. Come back tomorrow.'
      });
    }

    let aiReply;
    try {
      aiReply = await askWhatIf(trimmed);
    } catch (err) {
      const remaining = await refundSlot(userId, dateKey);
      const retryAfterSeconds = Number(err.retryAfterSeconds);
      return res.status(503).json({
        code: 'AI_BUSY',
        remaining,
        retryAfterSeconds: Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0 ? retryAfterSeconds : 30,
        message: 'The AI is busy right now. Please try again in a minute.'
      });
    }

    const savedReply = JSON.stringify({
      whatMightHappen: aiReply.whatMightHappen
    });
    const createdAt = new Date();
    const saved = await Answer.create({
      user: userId,
      prompt: trimmed,
      aiReply: savedReply,
      createdAt,
      expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    });
    await pruneHistory(userId);

    const remaining = await getRemaining(userId, dateKey);
    res.status(201).json({ aiReply, answer: saved, remaining });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    await pruneHistory(req.user.id);
    const history = await Answer.find({
      user: req.user.id,
      question: null
    }).sort({ createdAt: -1, _id: -1 }).limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteHistoryEntry = async (req, res) => {
  try {
    const deleted = await Answer.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
      question: null
    });
    if (!deleted) return res.status(404).json({ message: 'History entry not found.' });
    res.json({ message: 'History entry deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await Answer.deleteMany({ user: req.user.id, question: null });
    res.json({ message: 'History cleared.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
