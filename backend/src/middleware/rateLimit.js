import rateLimit from 'express-rate-limit';

const authRateLimit = () => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many failed attempts. Please try again in 15 minutes.' }
});

export const loginRateLimiter = authRateLimit();
export const registerRateLimiter = authRateLimit();

export const askRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Daily limit reached. Try again tomorrow.' },
  standardHeaders: true,
  legacyHeaders: false
});
