/**
 * Lightweight JSON logger with support for levels, timestamps, correlation IDs,
 * and structured metadata formatting.
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = process.env.LOG_LEVEL || "info";

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    level: level.toUpperCase(),
    message,
    requestId: meta.requestId || undefined,
    ...meta
  });
}

export const logger = {
  error: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.error) {
      console.error(formatLog("error", message, meta));
    }
  },
  warn: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.warn) {
      console.warn(formatLog("warn", message, meta));
    }
  },
  info: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.info) {
      console.log(formatLog("info", message, meta));
    }
  },
  debug: (message, meta = {}) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.debug) {
      console.debug(formatLog("debug", message, meta));
    }
  }
};
