import { config } from '../config';

export interface LogMethod {
  (message: string, meta?: any): void;
}

export interface Logger {
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  debug: LogMethod;
}

const formatMessage = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  if (config.isProduction) {
    return JSON.stringify({ timestamp, level, message, ...meta });
  }
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}] : ${message}${metaStr}`;
};

export const logger: Logger = {
  info: (message: string, meta?: any) => {
    console.log(formatMessage('info', message, meta));
  },
  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message: string, meta?: any) => {
    console.error(formatMessage('error', message, meta));
  },
  debug: (message: string, meta?: any) => {
    if (!config.isProduction) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};
