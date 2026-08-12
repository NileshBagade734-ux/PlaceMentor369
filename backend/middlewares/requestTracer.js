import { crypto } from "crypto";

/**
 * Express middleware that generates or propagates an X-Request-ID
 * for HTTP request tracing across async service calls.
 */
export const requestTracer = (req, res, next) => {
  const incomingId = req.headers["x-request-id"];
  const requestId = incomingId || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  next();
};
