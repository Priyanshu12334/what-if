import express from 'express';
import { ask, getHistory, deleteHistoryEntry, clearHistory } from '../controllers/askController.js';
import auth from '../middleware/auth.js';
import { askRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', auth, askRateLimiter, ask);
router.get('/history', auth, getHistory);
router.delete('/history', auth, clearHistory);
router.delete('/history/:id', auth, deleteHistoryEntry);

export default router;
