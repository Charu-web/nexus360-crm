import { Router } from 'express';
import v1Routes from './v1.routes';
import adminAuthRoutes from './adminAuth.routes';
import adminDashboardRoutes from './adminDashboard.routes';
import adminUsersRoutes from './adminUsers.routes';
import adminCrmRoutes from './adminCrm.routes';
import adminReportsRoutes from './adminReports.routes';
import adminAuditRoutes from './adminAudit.routes';
import adminSettingsRoutes from './adminSettings.routes';
import publicAuthRoutes from './publicAuth.routes';
import { getPublicFormBySlug, submitPublicForm } from '../controllers/forms.controller';
import { getHealthStatus } from '../controllers/health.controller';
import { getMetaOAuthUrl, handleMetaOAuthCallback, verifyMetaWebhook, handleMetaWebhookEvent } from '../controllers/socialMedia.controller';
import { resolveTenant } from '../middleware/tenant';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// 0. API Health Check Endpoint (/api/health)
router.get('/health', getHealthStatus);

// Social Media Omnichannel Integrations & Webhooks (/api/integrations/*)
router.get('/integrations/meta/oauth-url', resolveTenant, getMetaOAuthUrl);
router.get('/integrations/meta/callback', handleMetaOAuthCallback);
router.get('/integrations/meta/webhook', verifyMetaWebhook);
router.post('/integrations/meta/webhook', handleMetaWebhookEvent);

// 1. Version 1 Multi-Tenant & CRM Builder API Routes (/api/v1/*)
router.use('/v1', v1Routes);

// 2. Public API Routes (/api/public/*)
router.get('/public/forms/:formKey', getPublicFormBySlug);
router.post('/public/forms/:formKey/submit', submitPublicForm);

// 3. Authentication Routes (/api/auth/* and /api/admin/auth/*)
router.use('/admin/auth', adminAuthRoutes);
router.use('/auth', publicAuthRoutes);

// 4. Backward Compatible Protected Admin Routes (/api/admin/*)
router.use('/admin/dashboard', authenticateJwt, resolveTenant, adminDashboardRoutes);
router.use('/admin/users', authenticateJwt, resolveTenant, adminUsersRoutes);
router.use('/admin/reports', authenticateJwt, resolveTenant, adminReportsRoutes);
router.use('/admin/audit-logs', authenticateJwt, resolveTenant, adminAuditRoutes);
router.use('/admin/settings', authenticateJwt, resolveTenant, adminSettingsRoutes);
router.use('/admin', authenticateJwt, resolveTenant, adminCrmRoutes);

// 5. API 404 Catch-All Handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

export default router;
