import { requestLogger } from './middleware/requestLogger';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

const app = express();

// Security & Parsing Middleware
app.use(requestLogger);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: config.corsOrigin || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Tenant-Slug', 'X-API-Key', 'x-tenant-id', 'x-tenant-slug', 'x-api-key'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api', apiRateLimiter);

import { getHealthStatus } from './controllers/health.controller';

// Mount API Routes
app.use('/api', routes);

// Root Health Check Endpoint
app.get('/health', getHealthStatus);

// Handle SPA routes matching local folder names to avoid directory 301 redirects
app.get(['/services', '/services/'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Serve Frontend Static Assets
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir, { index: false, redirect: false }));
app.use('/assets', express.static(path.join(rootDir, 'assets')));

// Intercept nested asset requests and serve static JS/CSS assets cleanly
app.use((req, res, next) => {
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    const filename = path.basename(req.path);
    const assetPath = path.join(rootDir, 'assets', filename);
    if (fs.existsSync(assetPath)) {
      res.type(req.path.endsWith('.js') ? 'application/javascript' : 'text/css');
      return res.sendFile(assetPath);
    }
  }
  if (req.path.includes('/assets/')) {
    const assetSubPath = req.path.substring(req.path.indexOf('/assets/'));
    const fullAssetPath = path.join(rootDir, assetSubPath);
    if (fs.existsSync(fullAssetPath)) {
      return res.sendFile(fullAssetPath);
    }
  }
  next();
});

// Dedicated routes for Nexus360 Landing Page, CRM, Auth, & Menus
app.get([
  '/',
  '/home',
  '/landing',
  '/login',
  '/register',
  '/menus',
  '/menus/*',
  '/menu',
  '/menu/*',
  '/nexus',
  '/nexus/*',
  '/app',
  '/app/*'
], (_req, res) => {
  const nexusFile = path.join(rootDir, 'nexus360.html');
  if (fs.existsSync(nexusFile)) {
    return res.sendFile(nexusFile);
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Catch-all route to serve SPA frontend for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Never return index.html for static file extension requests (.js, .css, .jpg, .png, etc.)
  if (/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.path)) {
    return res.status(404).send('Asset not found');
  }
  // If nexus360.html exists, serve it as primary or fallback to index.html
  const nexusFile = path.join(rootDir, 'nexus360.html');
  if (fs.existsSync(nexusFile)) {
    return res.sendFile(nexusFile);
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Global Error Handler
app.use(errorHandler);

// Start Server
if (require.main === module) {
  const host = process.env.HOST || '0.0.0.0';
  const primaryServer = app.listen(config.port, host, () => {
    console.log(`==================================================`);
    console.log(`  Empire CRM Multi-Tenant SaaS Server Running      `);
    console.log(`  URL: http://${host}:${config.port}              `);
    console.log(`  Environment: ${config.nodeEnv}                 `);
    console.log(`==================================================`);
  });

  primaryServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${config.port} is already in use.`);
    } else {
      console.error(`[ERROR] Primary server error:`, err);
    }
  });

  if (config.port !== 3000) {
    const secondaryServer = app.listen(3000, host, () => {
      console.log(`  Also Listening on URL: http://${host}:3000`);
    });
    secondaryServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`  (Port 3000 already in use, primary server active on port ${config.port})`);
      } else {
        console.error(`  (Secondary server error on port 3000: ${err.message})`);
      }
    });
  }
}

export default app;
