// src/scripts/test_phase4_production_features.ts
import { PrismaClient } from '@prisma/client';
import { checkDuplicateLead, mergeLeads, importLeadsCSV, exportLeadsCSV, getLeadDetails } from '../controllers/unifiedLeads.controller';
import { getCustomer360, listCustomers } from '../controllers/customer360.controller';
import { listDocuments, createDocument, deleteDocument } from '../controllers/documents.controller';
import { listCommunications, sendCommunication, getCommunicationProviderStatus } from '../controllers/communications.controller';
import { getTasks, createTask, updateTask, deleteTask, getCalendarEvents } from '../controllers/tasks.controller';
import { getAnalyticsOverview } from '../controllers/analytics.controller';
import { getAuditLogs } from '../controllers/audit.controller';

const prisma = new PrismaClient();

async function runPhase4Tests() {
  console.log('================================================================');
  console.log('NEXUS360 PHASE 4: PRODUCTION FEATURES VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log('  ✓ [PASS] ' + name);
      passed++;
    } else {
      console.error('  ✗ [FAIL] ' + name + (details ? ' - ' + details : ''));
      failed++;
    }
  }

  const tenant = await prisma.tenant.findFirst({ where: { slug: 'empire-crm' } });
  if (!tenant) throw new Error('Tenant not found');
  const tenantId = tenant.id;

  const adminUser = await prisma.user.findFirst({ where: { tenantId } });

  // 1. ADVANCED LEAD MANAGEMENT & DETAILS
  console.log('TEST SUITE 1: Advanced Lead Management & Full Relation Details');
  const existingLead = await prisma.lead.findFirst({ where: { tenantId } });
  assert('Existing lead present for detail testing', Boolean(existingLead));

  let leadDetailData: any = null;
  const mockReqLead: any = { tenantId, params: { id: existingLead!.id } };
  const mockResLead: any = {
    json: (d: any) => { leadDetailData = d; return mockResLead; },
    status: (s: number) => mockResLead
  };
  await getLeadDetails(mockReqLead, mockResLead);
  assert('getLeadDetails returned success', Boolean(leadDetailData?.success));
  assert('getLeadDetails includes activities array', Array.isArray(leadDetailData?.lead?.activities));
  assert('getLeadDetails includes tasks array', Array.isArray(leadDetailData?.lead?.tasks));
  assert('getLeadDetails includes documents array', Array.isArray(leadDetailData?.lead?.documents));
  assert('getLeadDetails includes deals array', Array.isArray(leadDetailData?.lead?.deals));

  // 2. DUPLICATE DETECTION & MERGE
  console.log('\nTEST SUITE 2: Lead Duplicate Detection & Merge Engine');
  let dupResult: any = null;
  const mockReqDup: any = { tenantId, body: { phone: existingLead!.phone } };
  const mockResDup: any = {
    json: (d: any) => { dupResult = d; return mockResDup; },
    status: (s: number) => mockResDup
  };
  await checkDuplicateLead(mockReqDup, mockResDup);
  assert('Duplicate detection identified existing phone', dupResult?.isDuplicate === true);

  // Create temporary duplicate to test merge
  const tempLead = await prisma.lead.create({
    data: {
      tenantId,
      leadId: 'NX-LD-TEMP-' + Date.now().toString().slice(-4),
      customerName: existingLead!.customerName + ' (Duplicate)',
      phone: existingLead!.phone,
      email: 'temp_' + Date.now() + '@example.com',
      status: 'New',
      industry: 'GENERAL'
    }
  });

  // Attach a task to temp lead
  await prisma.task.create({
    data: {
      tenantId,
      title: 'Review merged lead documentation',
      dueDate: new Date(Date.now() + 86400000),
      assignedToId: adminUser!.id,
      leadId: tempLead.id
    }
  });

  let mergeResult: any = null;
  const mockReqMerge: any = { tenantId, user: adminUser, body: { sourceLeadId: tempLead.id, targetLeadId: existingLead!.id } };
  const mockResMerge: any = {
    json: (d: any) => { mergeResult = d; return mockResMerge; },
    status: (s: number) => mockResMerge
  };
  await mergeLeads(mockReqMerge, mockResMerge);
  assert('mergeLeads successfully merged records', mergeResult?.success === true);

  const deletedSource = await prisma.lead.findUnique({ where: { id: tempLead.id } });
  assert('Source duplicate lead was deleted after merge', deletedSource === null);

  // 3. CSV IMPORT & EXPORT
  console.log('\nTEST SUITE 3: CSV Lead Import & Export Engine');
  const importRows = [
    { customerName: 'CSV Inbound Client 1', phone: '+91 9111122221', email: 'csv1@client.org', amount: 3500000, industry: 'REAL_ESTATE' },
    { customerName: 'CSV Inbound Client 2', phone: '+91 9111122222', email: 'csv2@client.org', amount: 5000000, industry: 'LOAN' },
    { customerName: 'Duplicate Inbound Client', phone: existingLead!.phone, email: 'dup@client.org', amount: 1000000 }
  ];

  let importResult: any = null;
  const mockReqImport: any = { tenantId, body: { rows: importRows, deduplicateBy: 'phone' } };
  const mockResImport: any = {
    json: (d: any) => { importResult = d; return mockResImport; },
    status: (s: number) => mockResImport
  };
  await importLeadsCSV(mockReqImport, mockResImport);
  assert('importLeadsCSV imported valid non-duplicate leads', importResult?.importedCount === 2);
  assert('importLeadsCSV intercepted duplicate lead', importResult?.duplicateCount === 1);

  let exportedCsv: string = '';
  const mockResExport: any = {
    setHeader: () => {},
    send: (c: string) => { exportedCsv = c; return mockResExport; },
    status: () => mockResExport
  };
  await exportLeadsCSV({ tenantId } as any, mockResExport);
  assert('exportLeadsCSV generated valid CSV content', exportedCsv.includes('Lead ID,Customer Name,Phone'));

  // 4. CUSTOMER 360 VIEW
  console.log('\nTEST SUITE 4: Customer 360 Relational Lifecycle View');
  let cust360Data: any = null;
  const mockReqCust: any = { tenantId, params: { id: existingLead!.id } };
  const mockResCust: any = {
    json: (d: any) => { cust360Data = d; return mockResCust; },
    status: () => mockResCust
  };
  await getCustomer360(mockReqCust, mockResCust);
  assert('Customer 360 profile resolved', Boolean(cust360Data?.success));
  assert('Customer 360 aggregates customer or lead profile', Boolean(cust360Data?.customer?.name));
  assert('Customer 360 calculated Lifetime Value', typeof cust360Data?.customer?.lifetimeValue === 'number');

  // 5. COMMUNICATION CENTER
  console.log('\nTEST SUITE 5: Centralized Multi-Channel Communication Center');
  let commStatus: any = null;
  await getCommunicationProviderStatus({ tenantId } as any, { json: (d: any) => { commStatus = d; } } as any);
  assert('Communication provider status reported', Boolean(commStatus?.providers?.whatsapp));

  let sentMsg: any = null;
  const mockReqMsg: any = {
    tenantId,
    user: adminUser,
    body: { channel: 'WHATSAPP', recipient: '+91 9876543210', content: 'Your loan file is currently being reviewed.', leadId: existingLead!.id }
  };
  await sendCommunication(mockReqMsg, { status: () => ({ json: (d: any) => { sentMsg = d; } }) } as any);
  assert('Communication message dispatched via WhatsApp', sentMsg?.success === true);
  assert('Communication message delivery status recorded', sentMsg?.data?.status === 'DELIVERED');

  // 6. UNIFIED DOCUMENT MANAGEMENT
  console.log('\nTEST SUITE 6: Unified Document Management & RBAC Vault');
  let newDoc: any = null;
  const mockReqDoc: any = {
    tenantId,
    user: adminUser,
    body: {
      title: 'Salary Slips & Form 16',
      fileName: 'salary_slips_2026.pdf',
      fileType: 'pdf',
      fileSize: 2048576,
      entityType: 'Lead',
      entityId: existingLead!.id
    }
  };
  await createDocument(mockReqDoc, { status: () => ({ json: (d: any) => { newDoc = d; } }) } as any);
  assert('Document created with entity linkage', newDoc?.success === true);

  let docList: any = null;
  await listDocuments({ tenantId, query: { entityId: existingLead!.id } } as any, { json: (d: any) => { docList = d; } } as any);
  assert('listDocuments retrieved uploaded document', (docList?.documents?.length || 0) > 0);

  // 7. TASK & CALENDAR MANAGEMENT
  console.log('\nTEST SUITE 7: Task Lifecycle & CRM Unified Calendar');
  let createdTask: any = null;
  const mockReqTask: any = {
    tenantId,
    user: adminUser,
    body: {
      title: 'Follow-up on sanction letter signature',
      dueDate: new Date(Date.now() + 3600000 * 2).toISOString(),
      priority: 'High',
      leadId: existingLead!.id
    }
  };
  await createTask(mockReqTask, { status: () => ({ json: (d: any) => { createdTask = d; } }) } as any);
  assert('Task created successfully', createdTask?.success === true);

  let taskList: any = null;
  await getTasks({ tenantId, query: {} } as any, { json: (d: any) => { taskList = d; } } as any);
  assert('getTasks returned task list with category stats', typeof taskList?.stats?.todayCount === 'number');

  let calEvents: any = null;
  await getCalendarEvents({ tenantId, query: {} } as any, { json: (d: any) => { calEvents = d; } } as any);
  assert('getCalendarEvents aggregated multi-source calendar events', Array.isArray(calEvents?.events) && calEvents.events.length > 0);

  // 8. ADVANCED ANALYTICS & AI INSIGHTS
  console.log('\nTEST SUITE 8: Real 5-Dimensional Analytics & Verified AI Insights');
  let analyticsData: any = null;
  await getAnalyticsOverview({ tenantId } as any, { json: (d: any) => { analyticsData = d; } } as any);
  assert('Analytics endpoint returned success', analyticsData?.success === true);
  assert('Lead Analytics section calculated', typeof analyticsData?.data?.leadAnalytics?.totalLeads === 'number');
  assert('Sales Analytics section calculated', typeof analyticsData?.data?.salesAnalytics?.pipelineValue === 'number');
  assert('Real Estate Analytics section calculated', typeof analyticsData?.data?.realEstateAnalytics?.totalUnits === 'number');
  assert('Loan Analytics section calculated', typeof analyticsData?.data?.loanAnalytics?.totalApplications === 'number');
  assert('Real AI Insights generated from database', Array.isArray(analyticsData?.data?.aiInsights?.promisingLeads));

  // 9. ADMIN AUDIT LOGS
  console.log('\nTEST SUITE 9: Admin Audit Trail Tracking');
  let auditData: any = null;
  await getAuditLogs({ tenantId, query: {} } as any, { json: (d: any) => { auditData = d; } } as any);
  assert('getAuditLogs returned tenant audit records', Array.isArray(auditData?.logs) && auditData.logs.length > 0);

  // Clean up created test leads from import
  await prisma.lead.deleteMany({
    where: { tenantId, phone: { in: ['+91 9111122221', '+91 9111122222'] } }
  });

  console.log('\n================================================================');
  console.log('PHASE 4 TEST SUMMARY: ' + passed + ' PASSED | ' + failed + ' FAILED');
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase4Tests()
  .catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
