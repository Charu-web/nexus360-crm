import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const multer = require('multer');

// Middlewares
import { authenticateJwt } from '../middleware/auth';
import { resolveTenant } from '../middleware/tenant';
import { requireAdmin, requireManager } from '../middleware/rbac';
import { authRateLimiter, aiRateLimiter } from '../middleware/rateLimiter';

// Controllers
import * as authController from '../controllers/auth.controller';
import * as orgController from '../controllers/org.controller';
import * as crmController from '../controllers/crm.controller';
import * as aiController from '../controllers/ai.controller';
import * as docController from '../controllers/document.controller';
import * as workflowController from '../controllers/workflow.controller';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// Multer storage setup for document uploads
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}
const upload = multer({
  dest: config.uploadDir,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});

// ==========================================
// 1. PUBLIC HEALTH CHECK
// ==========================================
router.get('/health', analyticsController.getHealth);

// ==========================================
// 2. AUTHENTICATION & SESSION ROUTES
// ==========================================
router.post('/auth/register', authRateLimiter, authController.register);
router.post('/auth/login', authRateLimiter, authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticateJwt, authController.getMe);

// ==========================================
// 3. MULTI-TENANT & TEAM MANAGEMENT ROUTES
// ==========================================
router.get('/orgs/current', authenticateJwt, resolveTenant, orgController.getOrgDetails);
router.get('/orgs/members', authenticateJwt, resolveTenant, orgController.listMembers);
router.post('/orgs/invite', authenticateJwt, resolveTenant, requireAdmin, orgController.inviteMember);
router.patch('/orgs/members/:userId/role', authenticateJwt, resolveTenant, requireAdmin, orgController.updateMemberRole);
router.delete('/orgs/members/:userId', authenticateJwt, resolveTenant, requireAdmin, orgController.removeMember);

// ==========================================
// 4. CRM ROUTES (LEADS, COMPANIES, TASKS, CSV)
// ==========================================
router.get('/crm/leads', authenticateJwt, resolveTenant, crmController.listLeads);
router.post('/crm/leads', authenticateJwt, resolveTenant, crmController.createLead);
router.get('/crm/leads/export', authenticateJwt, resolveTenant, crmController.exportLeads);
router.post('/crm/leads/import', authenticateJwt, resolveTenant, requireManager, crmController.importLeads);
router.get('/crm/leads/:id', authenticateJwt, resolveTenant, crmController.getLead);
router.patch('/crm/leads/:id', authenticateJwt, resolveTenant, crmController.updateLead);
router.delete('/crm/leads/:id', authenticateJwt, resolveTenant, requireManager, crmController.deleteLead);

router.get('/crm/companies', authenticateJwt, resolveTenant, crmController.listCompanies);
router.post('/crm/companies', authenticateJwt, resolveTenant, crmController.createCompany);

router.get('/crm/tasks', authenticateJwt, resolveTenant, crmController.listTasks);
router.post('/crm/tasks', authenticateJwt, resolveTenant, crmController.createTask);
router.patch('/crm/tasks/:id', authenticateJwt, resolveTenant, crmController.updateTask);

// ==========================================
// 5. AI INTELLIGENCE & SALES COPILOT ROUTES
// ==========================================
router.post('/ai/score/:leadId', authenticateJwt, resolveTenant, aiRateLimiter, aiController.scoreLead);
router.post('/ai/generate-email', authenticateJwt, resolveTenant, aiRateLimiter, aiController.generateEmail);
router.post('/ai/chat', authenticateJwt, resolveTenant, aiRateLimiter, aiController.chatAssistant);

// ==========================================
// 6. DOCUMENT INTELLIGENCE & RAG KNOWLEDGE BASE
// ==========================================
router.get('/documents', authenticateJwt, resolveTenant, docController.listDocuments);
router.post('/documents/upload', authenticateJwt, resolveTenant, upload.single('file'), docController.uploadDocument);
router.get('/documents/:id', authenticateJwt, resolveTenant, docController.getDocument);
router.delete('/documents/:id', authenticateJwt, resolveTenant, requireManager, docController.deleteDocument);
router.post('/rag/query', authenticateJwt, resolveTenant, aiRateLimiter, docController.queryRAG);

// ==========================================
// 7. AI WORKFLOW AUTOMATION ROUTES
// ==========================================
router.get('/workflows', authenticateJwt, resolveTenant, workflowController.listWorkflows);
router.post('/workflows', authenticateJwt, resolveTenant, requireAdmin, workflowController.createWorkflow);
router.get('/workflows/:id', authenticateJwt, resolveTenant, workflowController.getWorkflow);
router.patch('/workflows/:id', authenticateJwt, resolveTenant, requireAdmin, workflowController.updateWorkflow);
router.delete('/workflows/:id', authenticateJwt, resolveTenant, requireAdmin, workflowController.deleteWorkflow);
router.post('/workflows/:id/execute', authenticateJwt, resolveTenant, workflowController.executeWorkflowManual);

// ==========================================
// 8. ANALYTICS, AUDIT LOGS & NOTIFICATIONS
// ==========================================
router.get('/analytics/overview', authenticateJwt, resolveTenant, analyticsController.getAnalyticsOverview);
router.get('/audit-logs', authenticateJwt, resolveTenant, requireAdmin, analyticsController.listAuditLogs);
router.get('/notifications', authenticateJwt, resolveTenant, analyticsController.listNotifications);
router.patch('/notifications/:id/read', authenticateJwt, resolveTenant, analyticsController.markNotificationRead);

export default router;
