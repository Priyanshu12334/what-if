import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../src/models/Question.js';
import Answer from '../src/models/Answer.js';

dotenv.config();

const cleanupAnswers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured');
    }
    await mongoose.connect(process.env.MONGO_URI);

    const todayStr = new Date().toISOString().split('T')[0];
    let todayQuestion = await Question.findOne({ date: todayStr });
    if (!todayQuestion) {
      todayQuestion = await Question.findOne().sort({ date: -1 });
    }

    if (todayQuestion) {
      await Answer.deleteMany({
        $or: [{ question: null }, { question: { $exists: false } }],
        prompt: todayQuestion.text
      });
    }

    const dailyAnswers = await Answer.find({ question: { $ne: null, $exists: true } }).sort({ createdAt: 1 });
    const seen = new Set();
    const duplicateIds = [];

    for (const ans of dailyAnswers) {
      const key = `${ans.user.toString()}_${ans.question.toString()}`;
      if (seen.has(key)) {
        duplicateIds.push(ans._id);
      } else {
        seen.add(key);
      }
    }

    if (duplicateIds.length > 0) {
      await Answer.deleteMany({ _id: { $in: duplicateIds } });
    }

    await Answer.syncIndexes();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

cleanupAnswers();
