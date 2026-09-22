import app from './app';
import { config } from './config';
import { logger } from './lib/logger';

const server = app.listen(config.port, () => {
  logger.info(`====================================================`);
  logger.info(`  🚀 NexusAI Enterprise Backend API Service Running  `);
  logger.info(`  Port:        ${config.port}                        `);
  logger.info(`  Environment: ${config.env}                         `);
  logger.info(`  Base URL:    http://localhost:${config.port}/api/v1 `);
  logger.info(`====================================================`);
});

const handleShutdown = (signal: string) => {
  logger.info(`[Process] Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('[Process] HTTP server closed gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
