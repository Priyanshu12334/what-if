import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  prompt: { type: String, required: true },
  aiReply: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null }
});

answerSchema.index(
  { user: 1, question: 1 },
  { unique: true, partialFilterExpression: { question: { $exists: true, $type: 'objectId' } } }
);
answerSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Answer', answerSchema);
