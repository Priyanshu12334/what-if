import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

dotenv.config();

const questions = [
  'What if the moon vanished tonight?',
  "What if sleep wasn't needed?",
  'What if we could talk to animals?',
  'What if gravity worked half as hard?',
  'What if the internet went dark for a day?',
  'What if humans lived 300 years?',
  "What if money didn't exist?",
  'What if you could pause time?',
  'What if dinosaurs never died?',
  'What if the Earth stopped spinning?',
  'What if everyone could read minds?',
  'What if we all spoke one language?',
  'What if plants could walk?',
  'What if the sun never set?',
  'What if memory could be uploaded?',
  'What if cars could fly?',
  'What if oceans disappeared?',
  'What if we had no phones?',
  'What if you forgot yesterday?',
  'What if robots did all the jobs?',
  'What if we found aliens tomorrow?',
  'What if everyone told the truth?',
  'What if night lasted a week?',
  'What if we could breathe underwater?',
  'What if electricity stopped working?',
  'What if time moved backwards?',
  'What if humans could photosynthesize?',
  'What if you could see in the dark?',
  'What if the sky turned green?',
  'What if every book disappeared?'
];

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured');
    await mongoose.connect(process.env.MONGO_URI);
    await Question.deleteMany({});
    const baseDate = new Date('2000-01-01T00:00:00.000Z');
    const documents = await Question.insertMany(questions.map((text, index) => {
      const date = new Date(baseDate);
      date.setUTCDate(date.getUTCDate() + index);
      return { text, date: date.toISOString().slice(0, 10) };
    }));
    await Answer.deleteMany({
      question: { $ne: null, $nin: documents.map(({ _id }) => _id) }
    });
    await mongoose.disconnect();
  } catch (error) {
    await mongoose.disconnect().catch(() => {});
    process.exitCode = 1;
  }
};

seed();
