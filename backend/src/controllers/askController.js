import { askWhatIf } from '../services/llm.js';
import Answer from '../models/Answer.js';

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

    let trimmed = prompt.trim();
    if (!/^what\s+if\b/i.test(trimmed)) {
      trimmed = `What if ${trimmed}`;
    }

    if (trimmed.length > 200) {
      return res.status(400).json({ error: 'Prompt must be 200 characters or less' });
    }

    const aiReply = await askWhatIf(trimmed);
    const savedReply = JSON.stringify({
      whatMightHappen: aiReply.whatMightHappen,
      funFact: aiReply.funFact
    });
    const createdAt = new Date();
    const saved = await Answer.create({
      user: req.user.id,
      prompt: trimmed,
      aiReply: savedReply,
      createdAt,
      expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    });
    await pruneHistory(req.user.id);

    res.status(201).json({ aiReply, answer: saved });
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
