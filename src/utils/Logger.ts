/**
 * Production-safe logger - replaces console.log with conditional logging
 * Only logs in development, silences in production to prevent data leaks
 */

const IS_DEV = import.meta.env.MODE === 'development' || import.meta.env.DEV;

export const Logger = {
  log: (...args: unknown[]) => {
    if (IS_DEV) console.log(...args);
  },

  warn: (...args: unknown[]) => {
    if (IS_DEV) console.warn(...args);
  },

  error: (...args: unknown[]) => {
    // Always log errors, but sanitize in production
    if (IS_DEV) {
      console.error(...args);
    } else {
      console.error('[Error occurred - check monitoring service]');
    }
  },

  debug: (...args: unknown[]) => {
    if (IS_DEV) console.debug(...args);
  },

  info: (...args: unknown[]) => {
    if (IS_DEV) console.info(...args);
  }
};
