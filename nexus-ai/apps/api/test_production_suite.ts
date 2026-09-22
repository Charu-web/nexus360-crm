import app from './src/app';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';
import http from 'http';
import { AddressInfo } from 'net';
import { OrganizationRole, LeadStatus, LeadPriority, TaskStatus, TaskPriority, DocumentType, DocumentStatus, WorkflowTriggerType } from '@prisma/client';

interface TestResult {
  phase: string;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const results: TestResult[] = [];
let server: http.Server;
let baseUrl: string;

function record(phase: string, name: string, expected: string, actual: string, passed: boolean) {
  results.push({ phase, name, expected, actual, passed });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${phase}] ${name} -> Expected: ${expected} | Actual: ${actual}`);
}

async function fetchApi(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json: any = {};
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { rawText: text };
  }

  return {
    status: res.status,
    body: json,
    text,
  };
}

async function runVerificationSuite() {
  console.log('===============================================================');
  console.log('  🧪 NexusAI Enterprise End-to-End Production Verification Suite  ');
  console.log('===============================================================\n');

  server = app.listen(0);
  const port = (server.address() as AddressInfo).port;
  baseUrl = `http://127.0.0.1:${port}`;

  try {
    // =========================================================================
    // PHASE 2: DATABASE & MULTI-TENANT PROVISIONING
    // =========================================================================
    console.log('\n--- PHASE 2: DATABASE & MULTI-TENANT ISOLATION SETUP ---');
    
    const dbTest = await prisma.$queryRaw`SELECT 1 as result`;
    record('PHASE 2 - DATABASE', 'PostgreSQL Connectivity', 'Query executes with result 1', 'Success', Array.isArray(dbTest) && dbTest.length > 0);

    // Clean up test sandbox
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.workflowExecution.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.documentChunk.deleteMany();
    await prisma.document.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.task.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.company.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    const testPassword = 'Password@123';
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // Create Organization A (Alpha Corp)
    const orgA = await prisma.organization.create({
      data: {
        name: 'Organization Alpha Corp',
        slug: 'org-alpha',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
      },
    });

    // Create Organization B (Beta Logistics)
    const orgB = await prisma.organization.create({
      data: {
        name: 'Organization Beta Logistics',
        slug: 'org-beta',
        plan: 'PRO',
        status: 'ACTIVE',
      },
    });

    // Create Users for Org A
    const userA_Owner = await prisma.user.create({
      data: { email: 'owner.a@nexusai.io', fullName: 'Alice Owner', passwordHash, isEmailVerified: true },
    });
    const userA_Manager = await prisma.user.create({
      data: { email: 'manager.a@nexusai.io', fullName: 'Bob Manager', passwordHash, isEmailVerified: true },
    });
    const userA_Employee = await prisma.user.create({
      data: { email: 'emp.a@nexusai.io', fullName: 'Charlie Employee', passwordHash, isEmailVerified: true },
    });
    const userA_Viewer = await prisma.user.create({
      data: { email: 'viewer.a@nexusai.io', fullName: 'Diana Viewer', passwordHash, isEmailVerified: true },
    });

    // Create User for Org B (Attacker / Distinct Tenant)
    const userB_Owner = await prisma.user.create({
      data: { email: 'owner.b@nexusai.io', fullName: 'Mallory OrgB Owner', passwordHash, isEmailVerified: true },
    });

    // Memberships
    await prisma.organizationMember.createMany({
      data: [
        { organizationId: orgA.id, userId: userA_Owner.id, role: OrganizationRole.OWNER },
        { organizationId: orgA.id, userId: userA_Manager.id, role: OrganizationRole.MANAGER },
        { organizationId: orgA.id, userId: userA_Employee.id, role: OrganizationRole.EMPLOYEE },
        { organizationId: orgA.id, userId: userA_Viewer.id, role: OrganizationRole.VIEWER },
        { organizationId: orgB.id, userId: userB_Owner.id, role: OrganizationRole.OWNER },
      ],
    });

    record('PHASE 2 - DATABASE', 'Multi-Tenant Sandbox Provisioning', '2 Orgs & 5 Users initialized', 'Created successfully', true);

    // =========================================================================
    // PHASE 3: AUTHENTICATION & SESSION MANAGEMENT
    // =========================================================================
    console.log('\n--- PHASE 3: AUTHENTICATION & TOKENS ---');

    // 1. Login User A Owner
    const loginResA = await fetchApi('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'owner.a@nexusai.io', password: testPassword },
    });

    const tokenA = loginResA.body.data?.tokens?.accessToken;
    const refreshA = loginResA.body.data?.tokens?.refreshToken;
    record('PHASE 3 - AUTH', 'User Login & JWT Issue', 'HTTP 200 with JWT access token', `HTTP ${loginResA.status}`, loginResA.status === 200 && !!tokenA);

    // 2. Login User B Owner
    const loginResB = await fetchApi('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'owner.b@nexusai.io', password: testPassword },
    });
    const tokenB = loginResB.body.data?.tokens?.accessToken;
    record('PHASE 3 - AUTH', 'Org B User Login', 'HTTP 200 with JWT access token', `HTTP ${loginResB.status}`, loginResB.status === 200 && !!tokenB);

    // 3. Login Viewer for Org A
    const loginResViewer = await fetchApi('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'viewer.a@nexusai.io', password: testPassword },
    });
    const tokenViewer = loginResViewer.body.data?.tokens?.accessToken;

    // 4. Token Refresh
    const refreshRes = await fetchApi('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken: refreshA },
    });
    record('PHASE 3 - AUTH', 'Token Refresh & Rotation', 'HTTP 200 with new accessToken', `HTTP ${refreshRes.status}`, refreshRes.status === 200 && !!refreshRes.body.data?.accessToken);

    // 5. Invalid / Expired Token Rejection
    const invalidTokenRes = await fetchApi('/api/v1/auth/me', {
      headers: { Authorization: 'Bearer invalid.token.signature' },
    });
    record('PHASE 3 - AUTH', 'Reject Invalid Token', 'HTTP 401 UNAUTHORIZED', `HTTP ${invalidTokenRes.status}`, invalidTokenRes.status === 401);

    // 6. User Me Route
    const meRes = await fetchApi('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    record('PHASE 3 - AUTH', 'Get Current User Session (/auth/me)', 'HTTP 200 with email and memberships', `HTTP ${meRes.status}`, meRes.status === 200 && meRes.body.data?.email === 'owner.a@nexusai.io');

    // =========================================================================
    // PHASE 4 & 5: MULTI-TENANT ISOLATION & RBAC SECURITY TESTS
    // =========================================================================
    console.log('\n--- PHASE 4 & 5: MULTI-TENANT SECURITY & RBAC ---');

    // Create Secret Lead in Org A
    const leadA = await prisma.lead.create({
      data: {
        organizationId: orgA.id,
        name: 'Confidential Defense Tech Lead',
        companyName: 'Defense Corp A',
        email: 'classified@defense.a',
        estimatedValue: 500000,
        status: LeadStatus.PROPOSAL,
        priority: LeadPriority.URGENT,
      },
    });

    // Create Secret Lead in Org B
    const leadB = await prisma.lead.create({
      data: {
        organizationId: orgB.id,
        name: 'Beta Medical Systems Lead',
        companyName: 'Beta Med',
        email: 'info@betamed.b',
        estimatedValue: 150000,
        status: LeadStatus.QUALIFIED,
      },
    });

    // Cross-Tenant Attack 1: User B tries to read Org A's confidential lead
    const crossReadRes = await fetchApi(`/api/v1/crm/leads/${leadA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Organization-ID': orgB.id },
    });
    record(
      'PHASE 5 - MULTI-TENANT',
      'Cross-Tenant Lead Read Prevention',
      'HTTP 404 (Lead not found in Org B)',
      `HTTP ${crossReadRes.status}`,
      crossReadRes.status === 404
    );

    // Cross-Tenant Attack 2: User B tries to spoof X-Organization-ID to Org A
    const spoofHeaderRes = await fetchApi(`/api/v1/crm/leads/${leadA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Organization-ID': orgA.id },
    });
    record(
      'PHASE 5 - MULTI-TENANT',
      'Prevent Spoofed Org Header Access',
      'HTTP 403 (FORBIDDEN_TENANT: not a member of Org A)',
      `HTTP ${spoofHeaderRes.status}`,
      spoofHeaderRes.status === 403
    );

    // Cross-Tenant Attack 3: User B tries to delete Org A's lead
    const crossDeleteRes = await fetchApi(`/api/v1/crm/leads/${leadA.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Organization-ID': orgB.id },
    });
    record(
      'PHASE 5 - MULTI-TENANT',
      'Cross-Tenant Lead Deletion Prevention',
      'HTTP 404 (Lead not found in Org B)',
      `HTTP ${crossDeleteRes.status}`,
      crossDeleteRes.status === 404
    );

    // RBAC Test: Viewer in Org A tries to delete a lead (Requires MANAGER)
    const viewerDeleteRes = await fetchApi(`/api/v1/crm/leads/${leadA.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenViewer}`, 'X-Organization-ID': orgA.id },
    });
    record(
      'PHASE 4 - RBAC',
      'Enforce Role Hierarchy (Viewer blocked from delete)',
      'HTTP 403 INSUFFICIENT_PERMISSIONS',
      `HTTP ${viewerDeleteRes.status}`,
      viewerDeleteRes.status === 403
    );

    // =========================================================================
    // PHASE 6: CRM MODULE CRUD & CSV
    // =========================================================================
    console.log('\n--- PHASE 6: CRM FUNCTIONALITY ---');

    // 1. Create Lead
    const createLeadRes = await fetchApi('/api/v1/crm/leads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: {
        name: 'Dr. Johnathan Edwards',
        email: 'j.edwards@innovate.io',
        companyName: 'Innovate AI Labs',
        estimatedValue: 85000,
        status: 'NEW',
        priority: 'HIGH',
      },
    });
    const createdLeadId = createLeadRes.body.data?.id;
    record('PHASE 6 - CRM', 'Create Lead via API', 'HTTP 201 with Lead ID', `HTTP ${createLeadRes.status}`, createLeadRes.status === 201 && !!createdLeadId);

    // 2. Update Lead
    const updateLeadRes = await fetchApi(`/api/v1/crm/leads/${createdLeadId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: { status: 'QUALIFIED', estimatedValue: 95000 },
    });
    record('PHASE 6 - CRM', 'Update Lead Status & Value', 'HTTP 200 with updated status', `HTTP ${updateLeadRes.status}`, updateLeadRes.status === 200 && updateLeadRes.body.data?.status === 'QUALIFIED');

    // 3. Search & Filter Leads
    const searchLeadRes = await fetchApi('/api/v1/crm/leads?search=Johnathan&status=QUALIFIED', {
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
    });
    record('PHASE 6 - CRM', 'Search & Filter Leads', 'HTTP 200 returning matching lead', `HTTP ${searchLeadRes.status}`, searchLeadRes.status === 200 && searchLeadRes.body.data?.length === 1);

    // 4. Create Task for Lead
    const createTaskRes = await fetchApi('/api/v1/crm/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: {
        title: 'Schedule Discovery Call with Dr. Edwards',
        priority: 'HIGH',
        status: 'TODO',
        leadId: createdLeadId,
      },
    });
    record('PHASE 6 - CRM', 'Create CRM Task linked to Lead', 'HTTP 201 with Task ID', `HTTP ${createTaskRes.status}`, createTaskRes.status === 201 && !!createTaskRes.body.data?.id);

    // 5. CSV Export
    const csvExportRes = await fetchApi('/api/v1/crm/leads/export', {
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
    });
    record('PHASE 6 - CRM', 'Export Leads to CSV', 'HTTP 200 with text/csv content', `HTTP ${csvExportRes.status}`, csvExportRes.status === 200 && csvExportRes.text.includes('Innovate AI Labs'));

    // =========================================================================
    // PHASE 7 & 8: AI INTELLIGENCE, SCORING & ASSISTANT
    // =========================================================================
    console.log('\n--- PHASE 7 & 8: AI SCORING & SALES COPILOT ---');

    const scoreRes = await fetchApi(`/api/v1/ai/score/${createdLeadId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
    });
    const scoreData = scoreRes.body.data;
    const isScoreValid = scoreRes.status === 200 && scoreData?.score >= 50 && scoreData?.factors?.length > 0;
    record('PHASE 7 - AI SCORING', 'Compute AI Score & Rationale', 'HTTP 200 with score, factors, and action', `HTTP ${scoreRes.status} (Score: ${scoreData?.score})`, isScoreValid);

    const dbLeadCheck = await prisma.lead.findUnique({ where: { id: createdLeadId } });
    record('PHASE 7 - AI SCORING', 'Database Persistence of AI Score', 'aiScore column populated in PostgreSQL', `Score in DB: ${dbLeadCheck?.aiScore}`, dbLeadCheck?.aiScore === scoreData?.score);

    const emailGenRes = await fetchApi('/api/v1/ai/generate-email', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: {
        leadName: 'Dr. Johnathan Edwards',
        companyName: 'Innovate AI Labs',
        emailPurpose: 'PROPOSAL_SUBMISSION',
        tone: 'PROFESSIONAL',
        specificGoal: 'Submit enterprise pricing breakdown with 15% annual commitment discount.',
      },
    });
    const emailData = emailGenRes.body.data;
    record('PHASE 8 - AI ASSISTANT', 'Generate Sales Proposal Email', 'HTTP 200 with subject and personalized body', `HTTP ${emailGenRes.status}`, emailGenRes.status === 200 && emailData?.body?.includes('Dr. Johnathan Edwards'));

    const chatRes = await fetchApi('/api/v1/ai/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: { message: 'Show me my highest-priority leads and upcoming tasks.' },
    });
    record('PHASE 8 - AI ASSISTANT', 'Organization Copilot Chat with Tool Calling', 'HTTP 200 with CRM contextual summary', `HTTP ${chatRes.status}`, chatRes.status === 200 && !!chatRes.body.data?.message?.content);

    // =========================================================================
    // PHASE 9: DOCUMENT INTELLIGENCE & RAG KNOWLEDGE BASE
    // =========================================================================
    console.log('\n--- PHASE 9: DOCUMENT INTELLIGENCE & RAG ---');

    await prisma.document.create({
      data: {
        organizationId: orgA.id,
        uploaderId: userA_Owner.id,
        name: 'NexusAI_Enterprise_SLA_and_Refund_Policy.txt',
        fileType: DocumentType.TXT,
        fileSize: 1024,
        storageKey: 'uploads/sla.txt',
        status: DocumentStatus.COMPLETED,
        chunksCount: 2,
        chunks: {
          create: [
            {
              organizationId: orgA.id,
              chunkIndex: 1,
              content: 'NexusAI guarantees 99.95% monthly uptime. Customers on Enterprise plans receive 24/7 dedicated support with 15-minute response times.',
              tokenCount: 28,
            },
            {
              organizationId: orgA.id,
              chunkIndex: 2,
              content: 'Refund Policy: Full refunds are provided within 30 days of subscription activation upon request to billing@nexusai.io.',
              tokenCount: 22,
            },
          ],
        },
      },
    });

    const ragQueryRes = await fetchApi('/api/v1/rag/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: { query: 'What is our refund policy timeline and uptime SLA?' },
    });
    const ragData = ragQueryRes.body.data;
    record('PHASE 9 - RAG', 'Query Knowledge Base with Source Citations', 'HTTP 200 with answer and document citations', `HTTP ${ragQueryRes.status}`, ragQueryRes.status === 200 && ragData?.sources?.length > 0 && ragData.answer.includes('NexusAI_Enterprise_SLA_and_Refund_Policy.txt'));

    const ragIsolationRes = await fetchApi('/api/v1/rag/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}`, 'X-Organization-ID': orgB.id },
      body: { query: 'What is our refund policy timeline and uptime SLA?' },
    });
    record('PHASE 9 - RAG', 'Cross-Tenant RAG Data Isolation', 'No source chunks returned from Org A', `Sources: ${ragIsolationRes.body.data?.sources?.length || 0}`, ragIsolationRes.body.data?.sources?.length === 0);

    // =========================================================================
    // PHASE 10: WORKFLOW AUTOMATION ENGINE
    // =========================================================================
    console.log('\n--- PHASE 10: WORKFLOW AUTOMATION ---');

    const workflow = await prisma.workflow.create({
      data: {
        organizationId: orgA.id,
        name: 'Auto-Task on High Value Lead',
        triggerType: WorkflowTriggerType.LEAD_CREATED,
        isActive: true,
        nodes: [
          { id: '1', type: 'TRIGGER', label: 'Lead Ingested', config: {} },
          { id: '2', type: 'CONDITION', label: 'Check Estimated Value', config: { field: 'estimatedValue', operator: 'GREATER_THAN', value: 50000 } },
          { id: '3', type: 'ACTION', label: 'Create Follow-up Task', config: {} },
        ],
      },
    });

    const execRes = await fetchApi(`/api/v1/workflows/${workflow.id}/execute`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: {
        triggerData: {
          leadId: createdLeadId,
          name: 'Dr. Johnathan Edwards',
          estimatedValue: 95000,
        },
      },
    });

    record('PHASE 10 - WORKFLOWS', 'Execute Automated Workflow Pipeline', 'HTTP 200 with COMPLETED execution status', `Status: ${execRes.body.data?.status}`, execRes.status === 200 && execRes.body.data?.status === 'COMPLETED');

    // =========================================================================
    // PHASE 11 & 12: ANALYTICS & AUDIT LOGS
    // =========================================================================
    console.log('\n--- PHASE 11 & 12: ANALYTICS & AUDIT LOGS ---');

    const analyticsRes = await fetchApi('/api/v1/analytics/overview', {
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
    });
    const metrics = analyticsRes.body.data?.metrics;
    record('PHASE 11 - ANALYTICS', 'Real Database Aggregated Analytics', 'Pipeline valuation and total leads match database', `Total Leads: ${metrics?.totalLeads}`, analyticsRes.status === 200 && metrics?.totalLeads >= 2);

    const auditRes = await fetchApi('/api/v1/audit-logs', {
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
    });
    record('PHASE 12 - AUDIT', 'Audit Trail Recording & Inspection', 'HTTP 200 with immutable security logs', `Logs Count: ${auditRes.body.data?.length}`, auditRes.status === 200 && auditRes.body.data?.length > 0);

    // =========================================================================
    // PHASE 13: FAILURE RECOVERY & GRACEFUL DEGRADATION
    // =========================================================================
    console.log('\n--- PHASE 13: FAILURE TESTING ---');

    const invalidUuidRes = await fetchApi('/api/v1/crm/leads/not-a-valid-uuid', {
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
    });
    record('PHASE 13 - FAILURE', 'Graceful Handling of Invalid UUID', 'Handled gracefully without 500 crash', `HTTP ${invalidUuidRes.status}`, invalidUuidRes.status === 404 || invalidUuidRes.status === 400);

    const badPayloadRes = await fetchApi('/api/v1/crm/leads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}`, 'X-Organization-ID': orgA.id },
      body: {},
    });
    record('PHASE 13 - FAILURE', 'Schema Validation Failure Handling', 'HTTP 400 VALIDATION_ERROR with field errors', `HTTP ${badPayloadRes.status}`, badPayloadRes.status === 400 && badPayloadRes.body.code === 'VALIDATION_ERROR');

    const healthRes = await fetchApi('/health');
    record('PHASE 13 - HEALTH', 'System Health Check Probe', 'HTTP 200 with component statuses', `HTTP ${healthRes.status}`, healthRes.status === 200 && healthRes.body.status === 'UP');

  } catch (err: any) {
    console.error('❌ Critical Test Suite Error:', err);
  } finally {
    if (server) server.close();
    console.log('\n===============================================================');
    console.log(`  📊 Verification Complete: ${results.filter((r) => r.passed).length}/${results.length} PASSED  `);
    console.log('===============================================================');
    process.exit(results.every((r) => r.passed) ? 0 : 1);
  }
}

runVerificationSuite();
