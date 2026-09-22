import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app = express();

// Security & Header hardening
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.corsOrigin.includes(origin) || config.corsOrigin.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev origins gracefully
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-ID', 'X-Request-ID'],
  })
);

// Body Parsers & Request Logger
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Global API rate limiting
app.use('/api', apiRateLimiter);

// Master Routes
app.use('/api/v1', routes);

// Root health probe
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', service: 'NexusAI API Gateway', timestamp: new Date().toISOString() });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
