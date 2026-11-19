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

export const askBurstRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.user.id,
  message: { code: 'TOO_FAST', message: 'Too many requests. Please wait a few seconds.' },
  standardHeaders: true,
  legacyHeaders: false
});
