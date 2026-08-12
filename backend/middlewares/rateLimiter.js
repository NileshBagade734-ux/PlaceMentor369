import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints (/api/auth/login & /api/auth/register).
 * Window: 15 minutes, Max requests: 10 per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "⚠️ Too many authentication attempts from this IP. Please try again after 15 minutes.",
    errorCode: "TOO_MANY_REQUESTS"
  }
});

/**
 * General API rate limiter for standard routes.
 * Window: 15 minutes, Max requests: 100 per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "⚠️ Rate limit exceeded. You have made too many requests in a short period.",
    errorCode: "TOO_MANY_REQUESTS"
  }
});

/**
 * Strict rate limiter for file upload routes (/api/student/upload-resume).
 * Window: 1 hour, Max requests: 5 uploads per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "⚠️ Upload limit reached. Maximum 5 resume uploads per hour allowed.",
    errorCode: "UPLOAD_LIMIT_EXCEEDED"
  }
});

/**
 * Rate limiter for AI analysis and ATS evaluation endpoints.
 * Window: 15 minutes, Max requests: 15 per IP
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "⚠️ AI service rate limit reached. Please wait a few minutes before trying again.",
    errorCode: "AI_RATE_LIMIT_EXCEEDED"
  }
});
