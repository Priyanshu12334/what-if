import express from 'express';
import { register, login } from '../controllers/authController.js';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/register', registerRateLimiter, register);
router.post('/login', loginRateLimiter, login);

export default router;
