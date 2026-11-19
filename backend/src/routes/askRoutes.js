import express from 'express';
import { ask, getAskLimit, getHistory, deleteHistoryEntry, clearHistory } from '../controllers/askController.js';
import auth from '../middleware/auth.js';
import { askBurstRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', auth, askBurstRateLimiter, ask);
router.get('/limit', auth, getAskLimit);
router.get('/history', auth, getHistory);
router.delete('/history', auth, clearHistory);
router.delete('/history/:id', auth, deleteHistoryEntry);

export default router;
