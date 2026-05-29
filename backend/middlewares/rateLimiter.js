import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints (/api/auth/login & /api/auth/register).
 *
 * - Window : 15 minutes
 * - Max requests per IP : 10   (per window)
 * - Temporary block     : After 10 attempts the IP receives 429 until the window resets.
 *
 * This mitigates brute-force, credential-stuffing, and mass-registration attacks
 * without affecting normal user behaviour.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // limit each IP to 10 requests per window
  standardHeaders: true,     // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders: false,      // Disable the `X-RateLimit-*` headers

  message: {
    message:
      "⚠️ Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});
