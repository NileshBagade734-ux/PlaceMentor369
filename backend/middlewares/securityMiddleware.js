/**
 * Security headers middleware — manually sets essential HTTP security headers
 * equivalent to Helmet.js protection.
 */
export const setSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS Filtering in legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // HTTP Strict Transport Security (HSTS)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Remove Express powered-by header for obfuscation
  res.removeHeader("X-Powered-By");

  next();
};

/**
 * Sanitize NoSQL MongoDB Injection attempts in req.body and req.query.
 * Recursively strips keys starting with '$' or containing '.'
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const cleanObj = {};
    for (const key of Object.keys(obj)) {
      // Ignore keys starting with $ or containing dots (common NoSQL injection operators like $gt, $ne, $where)
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      cleanObj[key] = sanitize(obj[key]);
    }
    return cleanObj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
