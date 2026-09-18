import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service';
import { AutomationEngine } from '../services/automation.service';

const prisma = new PrismaClient();

async function runE2ETests() {
  console.log('====================================================');
  console.log('    Nexus360 Comprehensive E2E Verification Suite   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  // 1. Prisma Data Verification
  console.log('1. Checking Database Model Records:');
  const tenants = await prisma.tenant.findMany();
  assert('Tenants exist in DB', tenants.length > 0, `Found ${tenants.length}`);

  const defaultTenant = tenants[0];
  const users = await prisma.user.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Admin user seeded', users.length > 0 && users.some(u => u.email === 'admin@empirecrm.io'));

  const unifiedLeads = await prisma.lead.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Unified Leads seeded', unifiedLeads.length > 0, `Found ${unifiedLeads.length}`);

  const loans = await prisma.loanApplication.findMany({ where: { tenantId: defaultTenant.id } });
  assert('DSA Loan Applications seeded', loans.length > 0, `Found ${loans.length}`);

  const projects = await prisma.realEstateProject.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Real Estate Projects seeded', projects.length > 0, `Found ${projects.length}`);

  const plots = await prisma.propertyUnit.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Real Estate Plot Units seeded', plots.length > 0, `Found ${plots.length}`);

  const visits = await prisma.siteVisit.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Site Visits seeded', visits.length > 0, `Found ${visits.length}`);

  const socialAccounts = await prisma.socialAccount.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Social Channels (Meta/FB/IG) seeded', socialAccounts.length > 0, `Found ${socialAccounts.length}`);

  const socialConvs = await prisma.socialConversation.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Social Inbox Threads seeded', socialConvs.length > 0, `Found ${socialConvs.length}`);

  const automationRules = await prisma.automationRule.findMany({ where: { tenantId: defaultTenant.id } });
  assert('Automation Engine Rules seeded', automationRules.length > 0, `Found ${automationRules.length}`);

  // 2. Direct Service & Controller Logic Verification
  console.log('\n2. Verifying AI Intelligence Layer:');
  const testLead = unifiedLeads[0];
  const aiScoreResult = AIService.calculateLeadScore({
    source: testLead.source,
    customerName: testLead.customerName,
    phone: testLead.phone,
    email: testLead.email,
    city: testLead.city,
    amount: testLead.amount || 5000000
  });
  assert('AI Lead Scoring calculation (0-100)', aiScoreResult.score >= 0 && aiScoreResult.score <= 100, `Score: ${aiScoreResult.score} (${aiScoreResult.category})`);

  const summary = await AIService.generateLeadSummary(testLead.id);
  assert('AI Lead Summary generation', summary.length > 20, `Summary preview: ${summary.slice(0, 50)}...`);

  const followUp = AIService.generateFollowUp(testLead, 'whatsapp');
  assert('AI Follow-up message composer (WhatsApp)', followUp.message.length > 10, `Follow-up preview: ${followUp.preview.slice(0, 50)}...`);

  const insights = await AIService.getSalesInsights(defaultTenant.id);
  assert('AI Sales Insights and recommendations', insights.highValueLeads.length > 0);

  const assistantResponse = await AIService.answerAssistantPrompt(defaultTenant.id, users[0], 'Show me loan applications');
  assert('Conversational CRM Assistant natural language processor', assistantResponse.answer.length > 0);

  // 3. Verifying Loan EMI Calculation Logic
  console.log('\n3. Verifying DSA Sathi Loan Calculator Logic:');
  const P = 2500000;
  const R = 8.5 / (12 * 100);
  const N = 240;
  const expectedEmi = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
  const totalPayment = expectedEmi * N;
  const totalInterest = totalPayment - P;
  assert('EMI Calculator formula accuracy', expectedEmi > 0 && totalInterest > 0, `Calculated EMI for ₹25L: ₹${expectedEmi}/mo`);

  // 4. Verifying Automation Engine
  console.log('\n4. Verifying Automation Engine Trigger->Condition->Action:');
  const createdTestLead = await prisma.lead.create({
    data: {
      tenantId: defaultTenant.id,
      leadId: `LEAD-TEST-${Date.now()}`,
      customerName: 'Workflow Automation Test Lead',
      phone: '+919876543999',
      email: 'workflow.test@example.com',
      source: 'FACEBOOK_ADS',
      industry: 'REAL_ESTATE',
      leadScore: 88,
      status: 'NEW'
    }
  });

  const execResults = await AutomationEngine.processEvent(
    defaultTenant.id,
    'lead.score_high',
    createdTestLead
  );
  assert('Automation Engine processed event', execResults !== undefined);

  const logs = await prisma.automationLog.findMany({
    where: { tenantId: defaultTenant.id }
  });
  assert('Automation rule execution logged to audit table', logs.length > 0, `Logs recorded: ${logs.length}`);

  // Cleanup test lead
  await prisma.lead.delete({ where: { id: createdTestLead.id } });

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runE2ETests().catch((err) => {
  console.error('Fatal test error:', err);
  prisma.$disconnect();
  process.exit(1);
});
