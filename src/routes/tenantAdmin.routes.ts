import { Router } from 'express';
import {
  getTenantSettings,
  updateTenantSettings,
  updateTenantBranding,
  getTenantStaff,
  createTenantStaff,
  getTenantRoles,
  createTenantRole,
  getTenantUsageMetrics,
  getTenantSubscriptionDetails,
  getTenantAuditLogs,
} from '../controllers/tenantAdmin.controller';
import {
  getApiKeys,
  generateApiKey,
  revokeApiKey,
  rotateApiKey,
  deleteApiKey,
} from '../controllers/apiKeys.controller';
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs,
} from '../controllers/webhooks.controller';
import {
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
} from '../controllers/integrations.controller';
import { resolveTenant } from '../middleware/tenant';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { checkUsageLimit } from '../middleware/featureGuard';

const router = Router();

// Protect ALL Tenant Admin Routes with Workspace Auth + Tenant Resolution + Admin Guard
router.use(authenticateJwt, resolveTenant, requireAdmin);

// Workspace Settings & Branding
router.get('/settings', getTenantSettings);
router.patch('/settings', updateTenantSettings);
router.put('/settings', updateTenantSettings);
router.patch('/branding', updateTenantBranding);

// Staff / Users Management
router.get('/staff', getTenantStaff);
router.post('/staff', checkUsageLimit('USER'), createTenantStaff);
router.get('/users', getTenantStaff);
router.post('/users', checkUsageLimit('USER'), createTenantStaff);

// Roles & Permissions
router.get('/roles', getTenantRoles);
router.post('/roles', createTenantRole);

// API Keys
router.get('/api-keys', getApiKeys);
router.post('/api-keys', generateApiKey);
router.post('/api-keys/:id/revoke', revokeApiKey);
router.post('/api-keys/:id/rotate', rotateApiKey);
router.delete('/api-keys/:id', deleteApiKey);

// Webhooks
router.get('/webhooks', getWebhooks);
router.post('/webhooks', createWebhook);
router.patch('/webhooks/:id', updateWebhook);
router.delete('/webhooks/:id', deleteWebhook);
router.get('/webhooks/:id/logs', getWebhookLogs);

// Integrations
router.get('/integrations', getIntegrations);
router.post('/integrations/:provider/connect', connectIntegration);
router.post('/integrations/:provider/disconnect', disconnectIntegration);

// Subscription & Live Usage Metrics
router.get('/subscription', getTenantSubscriptionDetails);
router.get('/usage', getTenantUsageMetrics);

// Audit Logs
router.get('/audit-logs', getTenantAuditLogs);

export default router;
