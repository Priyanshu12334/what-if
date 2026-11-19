import mongoose from 'mongoose';

const askUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateKey: { type: String, required: true },
  count: { type: Number, default: 0, min: 0, required: true }
});

askUsageSchema.index({ user: 1, dateKey: 1 }, { unique: true });

export default mongoose.model('AskUsage', askUsageSchema);
