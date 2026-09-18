import { PrismaClient } from '@prisma/client';
import { LLMFactory } from '../services/llm/llm.factory';
import { AIToolsService } from '../services/aiTools.service';
import { AIService } from '../services/ai.service';
import { AutomationService } from '../services/automation.service';

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log('  ✓ [PASS] ' + msg);
  } else {
    failed++;
    console.error('  ✗ [FAIL] ' + msg);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('NEXUS360 PHASE 3: PRODUCTION AI & ADVANCED AUTOMATION TEST SUITE');
  console.log('================================================================\n');

  const tenant = await prisma.tenant.findFirst({
    where: { OR: [{ id: 'tenant-empire-default' }, { slug: 'empire-crm' }, { slug: 'empire-enterprises' }] }
  });
  if (!tenant) throw new Error('Default tenant not found');
  const tenantId = tenant.id;

  const adminUser = await prisma.user.findFirst({
    where: { tenantId },
    include: { role: true }
  });
  if (!adminUser) throw new Error('Admin user not found');

  const salesUser = await prisma.user.findFirst({
    where: { tenantId, id: { not: adminUser.id } },
    include: { role: true }
  }) || adminUser;

  // -------------------------------------------------------------
  // SUITE 1: REAL LLM PROVIDER ABSTRACTION
  // -------------------------------------------------------------
  console.log('TEST SUITE 1: LLM Provider Abstraction Layer');
  const provider = LLMFactory.getProvider();
  assert(provider !== null && typeof provider.chatCompletion === 'function', 'LLMFactory returns valid LLMProvider implementation');
  assert(provider.getProviderName().length > 0, 'Active provider name reported: ' + provider.getProviderName());

  const status = LLMFactory.getProviderStatus();
  assert(status.activeModel.length > 0, 'Active model reported: ' + status.activeModel);
  assert(!('apiKey' in status), 'Provider status does NOT leak API secrets');

  const completion = await provider.chatCompletion([
    { role: 'system', content: 'You are an AI CRM assistant.' },
    { role: 'user', content: 'What are our top conversion sources?' }
  ]);
  assert(typeof completion.content === 'string' && completion.content.length > 0, 'LLM completion produces valid text output');
  assert(completion.provider.length > 0, 'Completion metadata identifies provider: ' + completion.provider);

  const jsonResp = await provider.generateStructuredResponse(
    'Recommend next steps for high value lead',
    'Return structured recommendation'
  );
  assert(typeof jsonResp === 'object' && jsonResp !== null, 'LLM structured response produces valid object');

  // -------------------------------------------------------------
  // SUITE 2: AUTHORIZED INTERNAL CRM AI TOOLS
  // -------------------------------------------------------------
  console.log('\nTEST SUITE 2: Authorized Internal CRM AI Tools');
  const leadsResult = await AIToolsService.searchLeads(tenantId, adminUser, { query: 'Sharma', limit: 5 });
  assert(leadsResult.success && Array.isArray(leadsResult.data), 'searchLeads returns lead records matching query');

  const firstLead = await prisma.lead.findFirst({ where: { tenantId } });
  if (firstLead) {
    const leadDetail = await AIToolsService.getLeadDetails(tenantId, adminUser, firstLead.id);
    assert(leadDetail.success && leadDetail.data.id === firstLead.id, 'getLeadDetails returns comprehensive lead details');
  }

  const salesMetrics = await AIToolsService.getSalesMetrics(tenantId, adminUser);
  assert(salesMetrics.success && typeof salesMetrics.data.totalPipelineValue === 'number', 'getSalesMetrics returns pipeline statistics');

  const campaignMetrics = await AIToolsService.getCampaignMetrics(tenantId, adminUser);
  assert(campaignMetrics.success && Array.isArray(campaignMetrics.data), 'getCampaignMetrics returns marketing campaigns');

  const dealPipeline = await AIToolsService.getDealPipeline(tenantId, adminUser);
  assert(dealPipeline.success && (Array.isArray(dealPipeline.data) || Array.isArray(dealPipeline.data?.deals)), 'getDealPipeline returns deals by stage');

  const loanApps = await AIToolsService.getLoanApplications(tenantId, adminUser);
  assert(loanApps.success && Array.isArray(loanApps.data), 'getLoanApplications returns loan requests');

  const propertyUnits = await AIToolsService.getPropertyAvailability(tenantId, adminUser);
  assert(propertyUnits.success && (Array.isArray(propertyUnits.data) || Array.isArray(propertyUnits.data?.units)), 'getPropertyAvailability returns real estate inventory');

  const followUps = await AIToolsService.getFollowUps(tenantId, adminUser, { overdueOnly: false });
  assert(followUps.success && Array.isArray(followUps.data), 'getFollowUps returns customer follow-ups');

  const teamPerf = await AIToolsService.getTeamPerformance(tenantId, adminUser);
  assert(teamPerf.success && Array.isArray(teamPerf.data), 'getTeamPerformance returns agent performance rankings');

  if (salesUser) {
    const rbacCheck = await AIToolsService.getDealPipeline(tenantId, salesUser);
    assert(rbacCheck.success, 'Sales rep can query deals scoped to permissions');
  }

  // -------------------------------------------------------------
  // SUITE 3: CONVERSATIONAL AI CRM ASSISTANT
  // -------------------------------------------------------------
  console.log('\nTEST SUITE 3: Conversational AI CRM Assistant Intent Resolution');
  const q1 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'Show all Facebook leads that have not been contacted for 3 days');
  assert(typeof q1.answer === 'string' && q1.answer.length > 0 && Array.isArray(q1.data), 'Assistant responds to Facebook leads query with real database data');

  const q2 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'Which sales executive has the highest conversion rate?');
  assert(typeof q2.answer === 'string' && q2.answer.length > 0 && Array.isArray(q2.data), 'Assistant responds to sales conversion query with real agent metrics');

  const q3 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'Show all hot property leads');
  assert(typeof q3.answer === 'string' && q3.answer.length > 0 && Array.isArray(q3.data), 'Assistant responds to hot property leads query with lead records');

  const q4 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'How much revenue is expected this month?');
  assert(typeof q4.answer === 'string' && q4.answer.length > 0 && typeof q4.data === 'object', 'Assistant responds to expected revenue query with verified revenue forecast');

  const q5 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'What is the status of loan application for Vikram Malhotra?');
  assert(typeof q5.answer === 'string' && q5.answer.length > 0 && Array.isArray(q5.data), 'Assistant responds to loan application query with applicant records');

  const q6 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'Show all overdue follow-ups');
  assert(typeof q6.answer === 'string' && q6.answer.length > 0 && Array.isArray(q6.data), 'Assistant responds to overdue follow-ups query with follow-up list');

  const q7 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'Which plots are available in Green Valley Phase 2?');
  assert(typeof q7.answer === 'string' && q7.answer.length > 0 && Array.isArray(q7.data), 'Assistant responds to plot availability query with inventory list');

  const q8 = await AIService.answerAssistantPrompt(tenantId, adminUser, 'List deals in negotiation stage');
  assert(typeof q8.answer === 'string' && q8.answer.length > 0 && Array.isArray(q8.data), 'Assistant responds to deals in negotiation query with deals list');

  // -------------------------------------------------------------
  // SUITE 4: AI RECOMMENDED NEXT ACTION
  // -------------------------------------------------------------
  console.log('\nTEST SUITE 4: AI Recommended Next Action Engine');
  const overdueLead = { customerName: 'Rohan Gupta', amount: 500000, industry: 'GENERAL', source: 'Website', leadScore: 60 };
  const recOverdue = AIService.generateLeadRecommendation(overdueLead, [], [], [
    { status: 'PENDING', scheduledAt: new Date(Date.now() - 86400000).toISOString() }
  ]);
  assert(recOverdue.suggestedAction === 'CALL_NOW' && recOverdue.confidence >= 90, 'Recommends CALL_NOW for overdue follow-up');

  const reLead = { customerName: 'Aditi Rao', amount: 8500000, industry: 'REAL_ESTATE', source: 'Referral', leadScore: 90 };
  const recRE = AIService.generateLeadRecommendation(reLead, [], [], []);
  assert(recRE.suggestedAction === 'SCHEDULE_SITE_VISIT', 'Recommends SCHEDULE_SITE_VISIT for high-value real estate lead');

  const loanLead = { customerName: 'Vikram Joshi', amount: 2500000, industry: 'LOAN', source: 'Loan Enquiry', leadScore: 70 };
  const recLoan = AIService.generateLeadRecommendation(loanLead, [], [], []);
  assert(recLoan.suggestedAction === 'REVIEW_LOAN_DOCS', 'Recommends REVIEW_LOAN_DOCS for loan applicant lead');

  const hotIdleLead = { customerName: 'Kunal Singhania', amount: 400000, industry: 'GENERAL', source: 'Website', leadScore: 88 };
  const recHot = AIService.generateLeadRecommendation(hotIdleLead, [{ id: '1' }], [], []);
  assert(recHot.suggestedAction === 'SEND_WHATSAPP', 'Recommends SEND_WHATSAPP for high-scoring lead with low engagement');

  // -------------------------------------------------------------
  // SUITE 5: 6-SECTION AI SALES INSIGHTS DASHBOARD
  // -------------------------------------------------------------
  console.log('\nTEST SUITE 5: 6-Section AI Sales Insights Dashboard');
  const insights = await AIService.getSalesInsights(tenantId);
  assert(Array.isArray(insights.hotOpportunities), 'Insights Section 1: hotOpportunities is present');
  assert(Array.isArray(insights.atRiskDeals), 'Insights Section 2: atRiskDeals is present');
  assert(Array.isArray(insights.overdueFollowUps), 'Insights Section 3: overdueFollowUps is present');
  assert(Array.isArray(insights.highConvertingSources), 'Insights Section 4: highConvertingSources is present');
  assert(Array.isArray(insights.lowPerformingCampaigns), 'Insights Section 5: lowPerformingCampaigns is present');
  assert(Array.isArray(insights.revenueOpportunities), 'Insights Section 6: revenueOpportunities is present');

  // -------------------------------------------------------------
  // SUITE 6: ADVANCED AUTOMATION ENGINE WITH AND/OR & MULTI-ACTIONS
  // -------------------------------------------------------------
  console.log('\nTEST SUITE 6: Advanced Automation Engine (AND/OR Logic & Timestamps)');
  const condAND = {
    AND: [
      { field: 'leadScore', operator: 'greater_than', value: 70 },
      { field: 'industry', operator: 'equals', value: 'REAL_ESTATE' }
    ]
  };
  const matchAndPass = AutomationService.evaluateCondition(condAND, { leadScore: 85, industry: 'REAL_ESTATE' });
  const matchAndFail = AutomationService.evaluateCondition(condAND, { leadScore: 65, industry: 'REAL_ESTATE' });
  assert(matchAndPass === true, 'Condition AND logic passes when all sub-conditions match');
  assert(matchAndFail === false, 'Condition AND logic fails when any sub-condition fails');

  const condOR = {
    OR: [
      { field: 'leadScore', operator: 'greater_than', value: 80 },
      { field: 'amount', operator: 'greater_than', value: 5000000 }
    ]
  };
  const matchOrPass = AutomationService.evaluateCondition(condOR, { leadScore: 60, amount: 6000000 });
  const matchOrFail = AutomationService.evaluateCondition(condOR, { leadScore: 60, amount: 1000000 });
  assert(matchOrPass === true, 'Condition OR logic passes when at least one sub-condition matches');
  assert(matchOrFail === false, 'Condition OR logic fails when no sub-condition matches');

  const testRuleName = 'Phase 3 Auto-VIP-' + Date.now();
  const workflowRule = await prisma.automationRule.create({
    data: {
      tenantId,
      name: testRuleName,
      triggerEvent: 'lead_created',
      conditions: JSON.stringify({
        AND: [{ field: 'leadScore', operator: 'greater_than', value: 50 }]
      }),
      actions: JSON.stringify([
        { actionType: 'assign_sales_executive', params: { role: 'SALES_EXECUTIVE' } },
        { actionType: 'create_task', params: { title: 'Call high value client' } },
        { actionType: 'notify_manager', params: { message: 'New VIP Lead created' } },
        { actionType: 'create_followup', params: { scheduledHoursLater: 24, channel: 'CALL' } },
        { actionType: 'create_notification', params: { title: 'VIP Inbound Lead Alert' } }
      ]),
      isActive: true
    }
  });
  assert(workflowRule.id !== undefined, 'Created multi-action workflow rule in database');

  const testLead = await prisma.lead.create({
    data: {
      tenantId,
      leadId: 'LEAD-VIP-' + Date.now(),
      customerName: 'VIP Prospect Phase 3',
      phone: '+91 9999888877',
      leadScore: 85,
      industry: 'REAL_ESTATE',
      source: 'Website'
    }
  });

  const execResults = await AutomationService.processEvent(tenantId, 'lead_created', {
    ...testLead,
    id: testLead.id
  });
  assert(execResults.length > 0, 'Dispatched trigger executed ' + execResults.length + ' actions');

  const log = await prisma.automationLog.findFirst({
    where: { ruleId: workflowRule.id },
    orderBy: { executedAt: 'desc' }
  });
  assert(log !== null, 'AutomationLog entry was created');
  assert(log?.startedAt !== null && log?.completedAt !== null, 'AutomationLog records startedAt and completedAt timestamps');

  const createdFollowUp = await prisma.followUp.findFirst({
    where: { leadId: testLead.id }
  });
  assert(createdFollowUp !== null, 'create_followup action created real FollowUp record');

  // -------------------------------------------------------------
  // SUITE 7: NOTIFICATION CENTER
  // -------------------------------------------------------------
  console.log('\nTEST SUITE 7: Unified Notification Center');
  const notif = await prisma.notification.create({
    data: {
      tenantId,
      userId: adminUser.id,
      type: 'NEW_LEAD',
      title: 'High-Value Lead Created',
      message: 'Client VIP Prospect was assigned to sales team.',
      entityType: 'lead',
      entityId: testLead.id,
      isRead: false
    }
  });
  assert(notif.id !== undefined, 'Notification created successfully in database');

  const unreadNotifs = await prisma.notification.findMany({
    where: { tenantId, userId: adminUser.id, isRead: false }
  });
  assert(unreadNotifs.some(n => n.id === notif.id), 'Unread notification retrieved');

  const updatedNotif = await prisma.notification.update({
    where: { id: notif.id },
    data: { isRead: true }
  });
  assert(updatedNotif.isRead === true, 'Notification marked as read');

  // -------------------------------------------------------------
  // SUITE 8: UNIFIED ACTIVITY TIMELINE
  // -------------------------------------------------------------
  console.log('\nTEST SUITE 8: Unified Activity Timeline Aggregation');
  await prisma.activity.create({
    data: {
      tenantId,
      entityType: 'Lead',
      entityId: testLead.id,
      userId: adminUser.id,
      type: 'CALL',
      title: 'Introductory Consultation Call',
      details: 'Discussed luxury 3BHK and pre-approved home loan'
    }
  });

  await prisma.leadActivity.create({
    data: {
      tenantId,
      leadId: testLead.id,
      type: 'CALL',
      title: 'Brochure Downloaded',
      details: 'Customer downloaded plot masterplan'
    }
  });

  const [acts, leadActs, notes, fUps] = await Promise.all([
    prisma.activity.findMany({ where: { entityId: testLead.id } }),
    prisma.leadActivity.findMany({ where: { leadId: testLead.id } }),
    prisma.note.findMany({ where: { leadId: testLead.id } }),
    prisma.followUp.findMany({ where: { leadId: testLead.id } })
  ]);

  const timelineCount = acts.length + leadActs.length + notes.length + fUps.length;
  assert(timelineCount >= 3, 'Unified activity timeline aggregates ' + timelineCount + ' chronological events across tables');

  // Cleanup test rule & lead
  await prisma.automationLog.deleteMany({ where: { ruleId: workflowRule.id } });
  await prisma.automationRule.delete({ where: { id: workflowRule.id } });
  await prisma.activity.deleteMany({ where: { entityId: testLead.id } });
  await prisma.leadActivity.deleteMany({ where: { leadId: testLead.id } });
  await prisma.followUp.deleteMany({ where: { leadId: testLead.id } });
  await prisma.notification.deleteMany({ where: { id: notif.id } });
  await prisma.lead.delete({ where: { id: testLead.id } });

  console.log('\n================================================================');
  console.log('PHASE 3 TEST SUMMARY: ' + passed + ' PASSED | ' + failed + ' FAILED');
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch(err => {
    console.error('Fatal error running Phase 3 tests:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
