import { Router } from 'express';
import completeAuthRoutes from './completeAuth.routes';
import adminRoutes from './admin.routes';
import tenantAdminRoutes from './tenantAdmin.routes';
import { platformLogin } from '../controllers/platform.controller';
import { getLeads, createLead, getCustomers, createCustomer } from '../controllers/v1Crm.controller';
import { getTenantReports } from '../controllers/v1Reports.controller';
import { getProjects, createProject, createProjectTask, createProjectMilestone } from '../controllers/projects.controller';
import { getServiceRecords, createServiceRecord } from '../controllers/services.controller';
import { getSalesTargets, createSalesTarget } from '../controllers/targets.controller';
import { getCampaigns, createCampaign } from '../controllers/campaigns.controller';
import { getTenantForms, createCustomForm, getPublicFormBySlug, submitPublicForm } from '../controllers/forms.controller';
import { getAttendance, clockIn, clockOut, getLeaveRequests, createLeaveRequest } from '../controllers/hrms.controller';
import { getCallLogs, createCallLog } from '../controllers/calls.controller';
import { getChatMessages, sendChatMessage } from '../controllers/chat.controller';
import { globalUnifiedSearch } from '../controllers/search.controller';
import { getCRMTemplates, provisionTenantCRM } from '../controllers/provisioning.controller';
import { submitPublicLead } from '../controllers/publicLeads.controller';
import { getTenantModules, createOrEnableModule, updateModuleStatus, deleteModule } from '../controllers/modules.controller';
import {
  createCustomModule,
  getCustomRecords,
  createCustomRecord,
  updateCustomRecord,
  deleteCustomRecord,
  getCustomViews,
  createCustomView,
  getDashboardConfig,
  updateDashboardConfig,
} from '../controllers/customModules.controller';
import { listCustomFields, createCustomField, updateCustomField, deleteCustomField } from '../controllers/customFields.controller';
import { getTenantPipelines, createPipeline, updatePipeline, deletePipeline, createPipelineStage, updatePipelineStage, deletePipelineStage } from '../controllers/pipeline.controller';
import { getAutomations, createAutomation, updateAutomation, deleteAutomation, testAutomationRule } from '../controllers/automations.controller';

import { resolveTenant } from '../middleware/tenant';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin, requireTenantAdmin } from '../middleware/rbac';
import { checkSubscriptionLimit } from '../middleware/subscriptionGuard';
import { checkFeatureAccess, checkUsageLimit } from '../middleware/featureGuard';
import { loginRateLimiter } from '../middleware/rateLimiter';

import { listInvitations, inviteEmployee, resendInvitation, removeEmployeeOrInvitation, acceptInvitation } from '../controllers/invitations.controller';

// Nexus360 Unified Verticals & Intelligence Controllers
import { getUnifiedLeads, createUnifiedLead, updateUnifiedLead, getLeadDetails, checkDuplicateLead, mergeLeads, importLeadsCSV, exportLeadsCSV } from '../controllers/unifiedLeads.controller';
import { getCustomer360, listCustomers } from '../controllers/customer360.controller';
import { listDocuments, createDocument, deleteDocument } from '../controllers/documents.controller';
import { listCommunications, sendCommunication, getCommunicationProviderStatus } from '../controllers/communications.controller';
import { getTasks, createTask, updateTask, deleteTask, getCalendarEvents } from '../controllers/tasks.controller';
import { getAnalyticsOverview } from '../controllers/analytics.controller';
import { getAuditLogs } from '../controllers/audit.controller';
import { getLoanApplications, createLoanApplication, updateLoanApplication, attachLoanDocument, calculateLoanEMI } from '../controllers/loans.controller';
import { getProjects as getREProjects, createProject as createREProject, getPropertyUnits, createPropertyUnit, updatePropertyUnitStatus, getSiteVisits, scheduleSiteVisit, updateSiteVisit, getBookings, createBooking } from '../controllers/realEstate.controller';
import { getSocialConversations, sendSocialReply, convertSocialToLead } from '../controllers/socialMedia.controller';
import { calculateLeadScore, generateLeadSummary, generateFollowUpMessage, getSalesInsights, askAIAssistant, getLeadRecommendation, getAIProviderStatus } from '../controllers/ai.controller';
import { getIndustryPresets, applyIndustryPreset, getActiveBlueprint } from '../controllers/crmBuilder.controller';
import { getWorkflowRules, createWorkflowRule, toggleWorkflowRule, getWorkflowLogs, testTrigger } from '../controllers/automationWorkflow.controller';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, createNotification } from '../controllers/notifications.controller';
import { getEntityTimeline } from '../controllers/timeline.controller';

const router = Router();

// ==========================================
// 1. Level 1: Platform Admin APIs (/api/v1/admin/*)
// ==========================================
router.use('/admin', adminRoutes);

// Platform Owner Auth
router.post('/platform/auth/login', loginRateLimiter, platformLogin);

// ==========================================
// 2. Level 2: Tenant Workspace Admin APIs (/api/v1/tenant/*)
// ==========================================
router.get('/tenant/invitations', authenticateJwt, listInvitations);
router.post('/tenant/invitations', authenticateJwt, inviteEmployee);
router.post('/tenant/invitations/:id/resend', authenticateJwt, resendInvitation);
router.delete('/tenant/invitations/:id', authenticateJwt, removeEmployeeOrInvitation);
router.delete('/tenant/users/:id', authenticateJwt, removeEmployeeOrInvitation);
router.use('/tenant', tenantAdminRoutes);

// ==========================================
// 3. User Authentication Endpoints (/api/v1/auth/*)
// ==========================================
router.use('/auth', completeAuthRoutes);

// Public CRM Builder & Provisioning Endpoints
router.get('/templates', getCRMTemplates);
router.post('/provision', provisionTenantCRM);
router.post('/public/invitations/accept', acceptInvitation);

// Public Lead Capture Endpoints (No Session Required)
router.get('/forms/public/:slug', getPublicFormBySlug);
router.post('/forms/public/:slug/submit', submitPublicForm);
router.get('/public/forms/:formKey', getPublicFormBySlug);
router.post('/public/forms/:formKey/submit', submitPublicForm);
router.post('/public/leads', submitPublicLead);

// ==========================================
// 4. Protected Tenant Workspace Builder & CRM Routes
// ==========================================
router.use(resolveTenant);

// CRM BUILDER APIs
// Modules
router.get('/modules', authenticateJwt, getTenantModules);
router.post('/modules', authenticateJwt, requireTenantAdmin, createOrEnableModule);
router.post('/modules/custom', authenticateJwt, requireTenantAdmin, createCustomModule);
router.patch('/modules/:id', authenticateJwt, requireTenantAdmin, updateModuleStatus);
router.delete('/modules/:id', authenticateJwt, requireTenantAdmin, deleteModule);

// Dynamic Custom Records
router.get('/records/:moduleKey', authenticateJwt, getCustomRecords);
router.post('/records/:moduleKey', authenticateJwt, createCustomRecord);
router.patch('/records/:moduleKey/:id', authenticateJwt, updateCustomRecord);
router.delete('/records/:moduleKey/:id', authenticateJwt, deleteCustomRecord);

// Custom Views
router.get('/views/:moduleKey', authenticateJwt, getCustomViews);
router.post('/views/:moduleKey', authenticateJwt, createCustomView);

// Dashboard Layout Configuration
router.get('/dashboard/config', authenticateJwt, getDashboardConfig);
router.post('/dashboard/config', authenticateJwt, updateDashboardConfig);

// Custom Fields
router.get('/custom-fields', authenticateJwt, listCustomFields);
router.post('/custom-fields', authenticateJwt, requireTenantAdmin, checkSubscriptionLimit('CUSTOM_FIELD'), createCustomField);
router.patch('/custom-fields/:id', authenticateJwt, requireTenantAdmin, updateCustomField);
router.delete('/custom-fields/:id', authenticateJwt, requireTenantAdmin, deleteCustomField);

// Pipelines & Stages
router.get('/pipelines', authenticateJwt, getTenantPipelines);
router.post('/pipelines', authenticateJwt, requireTenantAdmin, checkSubscriptionLimit('PIPELINE'), createPipeline);
router.patch('/pipelines/:id', authenticateJwt, requireTenantAdmin, updatePipeline);
router.delete('/pipelines/:id', authenticateJwt, requireTenantAdmin, deletePipeline);
router.post('/pipelines/:id/stages', authenticateJwt, requireTenantAdmin, createPipelineStage);
router.patch('/pipeline-stages/:id', authenticateJwt, requireTenantAdmin, updatePipelineStage);
router.delete('/pipeline-stages/:id', authenticateJwt, requireTenantAdmin, deletePipelineStage);

// Automations
router.get('/automations', authenticateJwt, getAutomations);
router.post('/automations', authenticateJwt, requireTenantAdmin, checkSubscriptionLimit('AUTOMATION'), createAutomation);
router.patch('/automations/:id', authenticateJwt, requireTenantAdmin, updateAutomation);
router.delete('/automations/:id', authenticateJwt, requireTenantAdmin, deleteAutomation);
router.post('/automations/:id/test', authenticateJwt, requireTenantAdmin, testAutomationRule);

// CRM Core Data
router.get('/leads', authenticateJwt, checkFeatureAccess('LEADS'), getLeads);
router.post('/leads', authenticateJwt, checkFeatureAccess('LEADS'), checkSubscriptionLimit('LEAD'), checkUsageLimit('LEAD'), createLead);
router.get('/customers', authenticateJwt, checkFeatureAccess('CUSTOMERS'), getCustomers);
router.post('/customers', authenticateJwt, checkFeatureAccess('CUSTOMERS'), checkSubscriptionLimit('CUSTOMER'), checkUsageLimit('CUSTOMER'), createCustomer);

// Projects & Milestones
router.get('/projects', authenticateJwt, checkFeatureAccess('PROJECTS'), getProjects);
router.post('/projects', authenticateJwt, checkFeatureAccess('PROJECTS'), createProject);
router.post('/projects/:id/tasks', authenticateJwt, checkFeatureAccess('PROJECTS'), createProjectTask);
router.post('/projects/:id/milestones', authenticateJwt, checkFeatureAccess('PROJECTS'), createProjectMilestone);

// Service Support Tickets
router.get('/services', authenticateJwt, checkFeatureAccess('SERVICES'), getServiceRecords);
router.post('/services', authenticateJwt, checkFeatureAccess('SERVICES'), createServiceRecord);

// Sales Targets
router.get('/targets', authenticateJwt, checkFeatureAccess('TARGETS'), getSalesTargets);
router.post('/targets', authenticateJwt, requireAdmin, checkFeatureAccess('TARGETS'), createSalesTarget);

// Marketing Campaigns
router.get('/campaigns', authenticateJwt, checkFeatureAccess('CAMPAIGNS'), getCampaigns);
router.post('/campaigns', authenticateJwt, checkFeatureAccess('CAMPAIGNS'), createCampaign);

// Form Builder
router.get('/forms', authenticateJwt, getTenantForms);
router.post('/forms', authenticateJwt, requireAdmin, createCustomForm);

// HRMS & Attendance
router.get('/hrms/attendance', authenticateJwt, checkFeatureAccess('HRMS'), getAttendance);
router.post('/hrms/attendance/check-in', authenticateJwt, checkFeatureAccess('HRMS'), clockIn);
router.post('/hrms/attendance/check-out', authenticateJwt, checkFeatureAccess('HRMS'), clockOut);
router.get('/hrms/leaves', authenticateJwt, checkFeatureAccess('HRMS'), getLeaveRequests);
router.post('/hrms/leaves', authenticateJwt, checkFeatureAccess('HRMS'), createLeaveRequest);

// Call Analyzer
router.get('/calls', authenticateJwt, checkFeatureAccess('CALLS'), getCallLogs);
router.post('/calls', authenticateJwt, createCallLog);

// Staff Live Chat
router.get('/chat', authenticateJwt, checkFeatureAccess('CHAT'), getChatMessages);
router.post('/chat', authenticateJwt, sendChatMessage);

// Global Unified Search
router.get('/search', authenticateJwt, globalUnifiedSearch);

// Reports
router.get('/reports', authenticateJwt, getTenantReports);

// ==========================================
// 5. NEXUS360 UNIFIED CRM VERTICALS & AI SUITE
// ==========================================

// A. Unified Common Lead System
router.get('/unified-leads', authenticateJwt, getUnifiedLeads);
router.post('/unified-leads', authenticateJwt, createUnifiedLead);
router.post('/unified-leads/check-duplicate', authenticateJwt, checkDuplicateLead);
router.post('/unified-leads/merge', authenticateJwt, mergeLeads);
router.post('/unified-leads/import-csv', authenticateJwt, importLeadsCSV);
router.get('/unified-leads/export-csv', authenticateJwt, exportLeadsCSV);
router.get('/unified-leads/:id', authenticateJwt, getLeadDetails);
router.patch('/unified-leads/:id', authenticateJwt, updateUnifiedLead);

// B. Customer 360 View
router.get('/customer360', authenticateJwt, listCustomers);
  router.get('/customer-360', authenticateJwt, listCustomers);
  router.get('/customer-360/:id', authenticateJwt, getCustomer360);
router.get('/customer360/:id', authenticateJwt, getCustomer360);

// C. Loan CRM (DSA Sathi Suite)
router.get('/loans', authenticateJwt, getLoanApplications);
router.post('/loans', authenticateJwt, createLoanApplication);
router.patch('/loans/:id', authenticateJwt, updateLoanApplication);
router.post('/loans/:id/documents', authenticateJwt, attachLoanDocument);
router.post('/loans/calculate-emi', calculateLoanEMI);

// D. Real Estate & Plot CRM
router.get('/real-estate/projects', authenticateJwt, getREProjects);
router.post('/real-estate/projects', authenticateJwt, createREProject);
router.get('/real-estate/units', authenticateJwt, getPropertyUnits);
router.post('/real-estate/units', authenticateJwt, createPropertyUnit);
router.patch('/real-estate/units/:id/status', authenticateJwt, updatePropertyUnitStatus);
router.get('/real-estate/site-visits', authenticateJwt, getSiteVisits);
router.post('/real-estate/site-visits', authenticateJwt, scheduleSiteVisit);
router.patch('/real-estate/site-visits/:id', authenticateJwt, updateSiteVisit);
router.get('/real-estate/bookings', authenticateJwt, getBookings);
router.post('/real-estate/bookings', authenticateJwt, createBooking);

// E. Social Media Omnichannel Inbox
router.get(['/social/conversations', '/social/threads'], authenticateJwt, getSocialConversations);
router.post('/social/conversations/:id/reply', authenticateJwt, sendSocialReply);
router.post('/social/conversations/:id/convert-to-lead', authenticateJwt, convertSocialToLead);

// F. Unified Document Management
router.get('/documents', authenticateJwt, listDocuments);
router.post('/documents', authenticateJwt, createDocument);
router.delete('/documents/:id', authenticateJwt, deleteDocument);

// G. Multi-Channel Communication Center
router.get(['/communications', '/communications/logs'], authenticateJwt, listCommunications);
router.post('/communications/send', authenticateJwt, sendCommunication);
router.get(['/communications/provider-status', '/communications/providers/status'], authenticateJwt, getCommunicationProviderStatus);

// H. Tasks & Calendar Management
router.get('/tasks', authenticateJwt, getTasks);
router.get('/tasks/summary', authenticateJwt, getTasks);
router.post('/tasks', authenticateJwt, createTask);
router.patch('/tasks/:id', authenticateJwt, updateTask);
router.delete('/tasks/:id', authenticateJwt, deleteTask);
router.get(['/calendar/events', '/tasks/calendar/events'], authenticateJwt, getCalendarEvents);

// I. Multi-Dimensional Analytics & Real AI Insights
router.get('/analytics/overview', authenticateJwt, getAnalyticsOverview);

// J. Admin Audit Logs
router.get('/audit-logs', authenticateJwt, getAuditLogs);
router.get('/audit/logs', authenticateJwt, getAuditLogs);

// Additional CRM Route Aliases
router.get('/contacts', authenticateJwt, getCustomers);
router.get('/deals', authenticateJwt, getTenantPipelines);
router.get('/users', authenticateJwt, listInvitations);

// K. AI Intelligence Engine
router.post('/ai/lead-score/:leadId', authenticateJwt, calculateLeadScore);
router.post('/ai/lead-summary/:leadId', authenticateJwt, generateLeadSummary);
router.post('/ai/generate-followup/:leadId', authenticateJwt, generateFollowUpMessage);
router.get('/ai/sales-insights', authenticateJwt, getSalesInsights);
router.post('/ai/assistant', authenticateJwt, askAIAssistant);
router.get('/ai/lead-recommendation/:leadId', authenticateJwt, getLeadRecommendation);
router.get('/ai/provider-status', authenticateJwt, getAIProviderStatus);

// L. Custom CRM Builder
router.get('/crm-builder/presets', authenticateJwt, getIndustryPresets);
router.get(['/crm-builder/active-blueprint', '/crm-builder/status'], authenticateJwt, getActiveBlueprint);
router.post('/crm-builder/apply-preset', authenticateJwt, applyIndustryPreset);

// M. Automation & Workflow Engine
router.get(['/workflow/rules', '/automations/rules'], authenticateJwt, getWorkflowRules);
router.post('/workflow/rules', authenticateJwt, createWorkflowRule);
router.post('/workflow/rules/:id/toggle', authenticateJwt, toggleWorkflowRule);
router.get('/workflow/logs', authenticateJwt, getWorkflowLogs);
router.post('/workflow/test-trigger', authenticateJwt, testTrigger);

// N. Unified Notification Center
router.get('/notifications', authenticateJwt, getNotifications);
router.patch('/notifications/:id/read', authenticateJwt, markNotificationAsRead);
router.post('/notifications/mark-all-read', authenticateJwt, markAllNotificationsAsRead);
router.post('/notifications', authenticateJwt, createNotification);

// O. Unified Activity Timeline
router.get('/timeline/:entityType/:entityId', authenticateJwt, getEntityTimeline);

export default router;
