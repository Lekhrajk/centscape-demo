import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

// In-memory store for rate limiting (in production, use Redis)
// const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const createRateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
    message: {
      error: 'Too many requests from this IP, please try again after a minute',
      retryAfter: 60,
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests from this IP, please try again after a minute',
        retryAfter: 60,
      });
    },
    keyGenerator: (req: Request) => {
      // Use IP address as the key
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
  });
};
