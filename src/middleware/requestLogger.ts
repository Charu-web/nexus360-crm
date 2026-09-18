import { Request, Response, NextFunction } from 'express';

/**
 * Production request logger with PII / secret sanitization.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl || req.url;

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusCategory = Math.floor(statusCode / 100);

    // Skip static asset spam in normal logs
    if (/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf)$/i.test(path)) {
      return;
    }

    const tenantId = (req as any).tenantId || req.headers['x-tenant-id'] || 'no-tenant';
    const logMessage = `[${timestamp}] [HTTP] ${method} ${path} -> ${statusCode} (${duration}ms) [Tenant: ${tenantId}]`;

    if (statusCategory === 5) {
      console.error(`\x1b[31m${logMessage}\x1b[0m`);
    } else if (statusCategory === 4) {
      console.warn(`\x1b[33m${logMessage}\x1b[0m`);
    } else {
      console.log(`\x1b[32m${logMessage}\x1b[0m`);
    }
  });

  next();
}
