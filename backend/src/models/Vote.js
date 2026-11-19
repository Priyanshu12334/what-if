import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  optionIndex: { type: Number, required: true, min: 0, max: 3 },
  createdAt: { type: Date, default: Date.now }
});

voteSchema.index({ user: 1, question: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);
