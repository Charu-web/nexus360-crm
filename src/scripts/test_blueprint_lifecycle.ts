import { PrismaClient } from '@prisma/client';
import { applyIndustryPreset, INDUSTRY_PRESETS, getActiveBlueprint } from '../controllers/crmBuilder.controller';
import { TenantRequest } from '../middleware/tenant';

const prisma = new PrismaClient();

async function runBlueprintVerificationTests() {
  console.log('===========================================================');
  console.log('    Nexus360 CRM Builder - 4 Blueprint Full LifeCycle Test ');
  console.log('===========================================================\n');

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

  const defaultTenant = await prisma.tenant.findFirst();
  if (!defaultTenant) throw new Error('No tenant found in database');
  const tenantId = defaultTenant.id;

  // Mock Request & Response generator
  function mockReqRes(presetKey: string) {
    const req = {
      tenantId,
      body: { presetKey }
    } as unknown as TenantRequest;

    let resData: any = null;
    let resStatus = 200;
    const res = {
      status: (code: number) => {
        resStatus = code;
        return res;
      },
      json: (data: any) => {
        resData = data;
        return res;
      }
    } as any;

    return { req, res, getData: () => resData, getStatus: () => resStatus };
  }

  // Count leads, contacts, deals before applying any blueprint to ensure SAFETY
  const initialLeads = await prisma.lead.count({ where: { tenantId } });
  const initialContacts = await prisma.contact.count({ where: { tenantId } });
  const initialDeals = await prisma.deal.count({ where: { tenantId } });

  const blueprintKeys = ['REAL_ESTATE', 'FINTECH_LOAN', 'EDUCATION', 'RECRUITMENT'];

  for (const bKey of blueprintKeys) {
    console.log(`\n--- Testing Blueprint: ${bKey} ---`);
    const preset = INDUSTRY_PRESETS[bKey];
    assert(`Blueprint ${bKey} definition loaded`, !!preset, `Found: ${preset?.name}`);

    const { req, res, getData, getStatus } = mockReqRes(bKey);
    await applyIndustryPreset(req, res);

    const data = getData();
    const status = getStatus();
    assert(`Apply ${bKey} returned HTTP 200 and success`, status === 200 && data?.success === true, JSON.stringify(data));

    // Verify Modules in DB
    const enabledModules = await prisma.tenantModule.findMany({
      where: { tenantId, enabled: true }
    });
    for (const mod of preset.modules) {
      const exists = enabledModules.some(m => m.moduleKey === mod.key);
      assert(`Module ${mod.key} (${mod.name}) persisted & enabled in DB`, exists);
    }

    // Verify Pipeline in DB
    const pipeline = await prisma.pipeline.findFirst({
      where: { tenantId, name: `${preset.name} Pipeline` },
      include: { stages: true }
    });
    assert(`Pipeline "${preset.name} Pipeline" created with ${preset.pipelineStages.length} stages`, !!pipeline && pipeline.stages.length >= preset.pipelineStages.length);

    // Verify Custom Fields in DB
    const customFields = await prisma.customField.findMany({ where: { tenantId } });
    for (const f of preset.customFields) {
      const exists = customFields.some(cf => cf.fieldKey === f.fieldKey && cf.entityType === f.entityType);
      assert(`Custom Field "${f.fieldName}" (${f.fieldKey}) persisted in DB`, exists);
    }

    // Verify Dashboard Widgets in DB
    const widgets = await prisma.dashboardWidget.findMany({ where: { tenantId } });
    for (const w of preset.dashboardWidgets) {
      const exists = widgets.some(dw => dw.widgetKey === w.key);
      assert(`Dashboard widget "${w.title}" persisted in DB`, exists);
    }

    // Verify Seeded Custom Records in DB
    if (preset.seedRecords) {
      const records = await prisma.customRecord.findMany({ where: { tenantId } });
      for (const r of preset.seedRecords) {
        const exists = records.some(cr => cr.moduleKey === r.moduleKey && cr.title === r.title);
        assert(`Domain Seed record "${r.title}" persisted in CustomRecord`, exists);
      }
    }
  }

  // Multi-Blueprint Cumulative Test: Test applying two different blueprints consecutively
  console.log('\n--- Multi-Blueprint Cumulative Test (REAL_ESTATE + FINTECH_LOAN) ---');
  const reModules = INDUSTRY_PRESETS.REAL_ESTATE.modules.map(m => m.key);
  const loanModules = INDUSTRY_PRESETS.FINTECH_LOAN.modules.map(m => m.key);
  const allCurrentModules = await prisma.tenantModule.findMany({
    where: { tenantId, enabled: true }
  });
  const allCurrentKeys = allCurrentModules.map(m => m.moduleKey);
  const hasRE = reModules.every(k => allCurrentKeys.includes(k));
  const hasLoan = loanModules.every(k => allCurrentKeys.includes(k));
  assert('Both Real Estate and Loan modules co-exist without overwriting', hasRE && hasLoan);

  // Re-application Idempotency Test: Apply EDUCATION twice to ensure NO duplicate modules or stages
  console.log('\n--- Re-application Idempotency Test ---');
  const modulesCountBefore = await prisma.tenantModule.count({ where: { tenantId } });
  const { req: reqIdemp, res: resIdemp } = mockReqRes('EDUCATION');
  await applyIndustryPreset(reqIdemp, resIdemp);
  const modulesCountAfter = await prisma.tenantModule.count({ where: { tenantId } });
  assert('Re-applying blueprint does NOT duplicate modules (idempotent)', modulesCountBefore === modulesCountAfter);

  // Safety Test: Ensure initial core leads, contacts, and deals were NOT wiped
  console.log('\n--- Safety & Data Preservation Test ---');
  const finalLeads = await prisma.lead.count({ where: { tenantId } });
  const finalContacts = await prisma.contact.count({ where: { tenantId } });
  const finalDeals = await prisma.deal.count({ where: { tenantId } });
  assert('Core Leads intact after applying all blueprints', finalLeads >= initialLeads);
  assert('Core Contacts intact after applying all blueprints', finalContacts >= initialContacts);
  assert('Core Deals intact after applying all blueprints', finalDeals >= initialDeals);

  // Verify Audit Log records
  const auditLogs = await prisma.auditLog.findMany({
    where: { tenantId, action: 'APPLY_BLUEPRINT' }
  });
  assert('Audit logs generated for blueprint applications', auditLogs.length >= 4);

  console.log('\n===========================================================');
  console.log(`Test Results: ${passed} PASSED | ${failed} FAILED`);
  console.log('===========================================================\n');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runBlueprintVerificationTests().catch((err) => {
  console.error('Fatal verification error:', err);
  prisma.$disconnect();
  process.exit(1);
});
