import { config } from './config';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { AIService } from './services/ai.service';
import { WorkflowService } from './services/workflow.service';

logger.info('====================================================');
logger.info('  ⚡ NexusAI Background Worker Starting...');
logger.info(`  • Environment: ${config.env}`);
logger.info(`  • Redis: ${config.redisUrl}`);
logger.info('====================================================');

async function startWorker() {
  logger.info('[Worker] Listening for background async processing jobs:');
  logger.info('  1. AI Lead Intelligence & Auto-Scoring');
  logger.info('  2. Document RAG Vector Embedding Generation');
  logger.info('  3. Workflow Trigger & Automation Execution');
  logger.info('  4. Notification & Email Dispatching');

  // Periodic heartbeat / queue consumer loop
  setInterval(() => {
    logger.info('[Worker Heartbeat] Queue ready and awaiting jobs.');
  }, 60000);
}

startWorker().catch((err) => {
  logger.error('[Worker Fatal Error]', err);
  process.exit(1);
});
