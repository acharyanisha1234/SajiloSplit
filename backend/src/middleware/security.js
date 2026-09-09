import rateLimit from 'express-rate-limit';

/**
 * Recursively strips MongoDB query operators ($ and .) to prevent Object Injection attacks.
 */
export const sanitizeData = (data) => {
  if (data instanceof Object) {
    for (const key in data) {
      if (key.startsWith('$') || key.includes('.')) {
        delete data[key];
      } else {
        sanitizeData(data[key]);
      }
    }
  }
  return data;
};

/**
 * Middleware wrapper to sanitize req.body, req.query, and req.params.
 */
export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeData(req.body);
  if (req.query) sanitizeData(req.query);
  if (req.params) sanitizeData(req.params);
  next();
};

/**
 * Rate Limiter configuration for sensitive financial & authentication endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many login/auth requests. Please try again after 15 minutes.'
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 API requests per minute
  standardHeaders: true,
  legacyHeaders: false
});