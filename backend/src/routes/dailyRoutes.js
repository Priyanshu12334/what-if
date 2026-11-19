import express from 'express';
import { getDailyQuestion, submitDailyVote } from '../controllers/dailyController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getDailyQuestion);
router.post('/vote', auth, submitDailyVote);

export default router;
