import { Router } from 'express';
import {
  getPlatformAdminDashboard,
  listPlatformTenants,
  suspendTenant,
  activateTenant,
  deleteTenant,
  getPlatformPlans,
  createPlatformPlan,
  getPlatformAuditLogs,
} from '../controllers/platformAdmin.controller';
import { getCRMTemplates, provisionTenantCRM } from '../controllers/provisioning.controller';
import { authenticateJwt } from '../middleware/auth';
import { requirePlatformOwner } from '../middleware/rbac';

const router = Router();

// Protect ALL Platform Admin Routes with Platform Owner Guard
router.use(authenticateJwt, requirePlatformOwner);

// Dashboard
router.get('/dashboard', getPlatformAdminDashboard);

// Tenant Management
router.get('/tenants', listPlatformTenants);
router.post('/tenants', provisionTenantCRM);
router.post('/tenants/:id/suspend', suspendTenant);
router.post('/tenants/:id/activate', activateTenant);
router.delete('/tenants/:id', deleteTenant);

// SaaS Plans Management
router.get('/plans', getPlatformPlans);
router.post('/plans', createPlatformPlan);

// CRM Templates Management
router.get('/templates', getCRMTemplates);

// Audit Logs
router.get('/audit-logs', getPlatformAuditLogs);

export default router;
