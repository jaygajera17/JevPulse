const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function shouldLog(level) {
  return (levels[level] ?? 2) <= (levels[LOG_LEVEL] ?? 2);
}

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (msg, ...args) => {
    if (shouldLog('info')) {
      console.log(`[${timestamp()}] [INFO] ${msg}`, ...args);
    }
  },
  warn: (msg, ...args) => {
    if (shouldLog('warn')) {
      console.warn(`[${timestamp()}] [WARN] ${msg}`, ...args);
    }
  },
  error: (msg, ...args) => {
    if (shouldLog('error')) {
      console.error(`[${timestamp()}] [ERROR] ${msg}`, ...args);
    }
  },
  debug: (msg, ...args) => {
    if (shouldLog('debug')) {
      console.debug(`[${timestamp()}] [DEBUG] ${msg}`, ...args);
    }
  },
};
