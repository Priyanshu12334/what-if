import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true, unique: true },
  explanation: { type: String, default: '' },
  options: [{ text: { type: String, required: true } }],
  communityVotes: { type: [Number], default: undefined },
  generatedAt: { type: Date, default: null }
});

export default mongoose.model('Question', questionSchema);
