import app from '../server';
import { Server } from 'http';

const PORT = 5050;
const BASE_URL = `http://localhost:${PORT}`;

async function runE2EVerification() {
  console.log('================================================================');
  console.log(' EMPIRE CRM COMPREHENSIVE END-TO-END SaaS VERIFICATION SUITE   ');
  console.log('================================================================\n');

  let server: Server | undefined = undefined;
  await new Promise<void>((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`[TEST SERVER] Running on ${BASE_URL}`);
      resolve();
    });
  });

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assertTest(name: string, condition: boolean, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. HEALTH CHECK VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- 1. HEALTH CHECK & SYSTEM STATUS ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = (await healthRes.json()) as any;
    assertTest('GET /health returns HTTP 200 OK', healthRes.status === 200);
    assertTest('Health status is UP', healthData.status === 'UP');

    // -------------------------------------------------------------------------
    // 2. AUTHENTICATION & SECURITY VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- 2. AUTHENTICATION & SECURITY VERIFICATION ---');

    // Invalid Password
    const invalidPassRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@empirecrm.io', password: 'WrongPassword123!' }),
    });
    assertTest('Login with invalid password returns 401 Unauthorized', invalidPassRes.status === 401);

    // Invalid Email
    const invalidEmailRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@empirecrm.io', password: 'Password123!' }),
    });
    assertTest('Login with invalid email returns 401 Unauthorized', invalidEmailRes.status === 401);

    // Protected API without Token
    const noTokenRes = await fetch(`${BASE_URL}/api/v1/auth/me`);
    assertTest('Protected API without token returns 401 Unauthorized', noTokenRes.status === 401);

    // Protected API with Invalid Token
    const invalidTokenRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: 'Bearer invalid.jwt.token' },
    });
    assertTest('Protected API with invalid token returns 401 Unauthorized', invalidTokenRes.status === 401);

    // Valid Platform Owner Login
    const platformLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@empirecrm.io', password: 'SuperAdminPassword123!' }),
    });
    const platformAuthData = (await platformLoginRes.json()) as any;
    assertTest('Platform Owner login succeeds with 200 OK', platformLoginRes.status === 200);
    const superAdminToken = platformAuthData.accessToken;

    // Verify /me endpoint
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assertTest('GET /api/v1/auth/me returns 200 OK for valid token', meRes.status === 200);

    // -------------------------------------------------------------------------
    // 3. CRM BUILDER & PROVISIONING FLOW
    // -------------------------------------------------------------------------
    console.log('\n--- 3. CRM BUILDER & PROVISIONING FLOW ---');

    const timestamp = Date.now();

    // Provision Tenant A (Demo Company A - Real Estate)
    const provARes = await fetch(`${BASE_URL}/api/v1/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Admin Company A',
        email: `admin.a.${timestamp}@demoa.com`,
        phone: '+91 9876543210',
        password: 'Password123!',
        companyName: 'Demo Company A',
        companySlug: `demo-company-a-${timestamp}`,
        industry: 'REAL_ESTATE',
        companySize: '10-50',
        country: 'India',
        template: 'REAL_ESTATE',
        plan: 'STARTER',
      }),
    });
    const provAData = (await provARes.json()) as any;
    assertTest('Provisioning Tenant A (Real Estate) succeeds', provARes.status === 201);
    const tenantA = provAData.tenant;
    const tokenA = provAData.accessToken;

    // Provision Tenant B (Demo Company B - Healthcare)
    const provBRes = await fetch(`${BASE_URL}/api/v1/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Admin Company B',
        email: `admin.b.${timestamp}@demob.com`,
        phone: '+91 9998887776',
        password: 'Password123!',
        companyName: 'Demo Company B',
        companySlug: `demo-company-b-${timestamp}`,
        industry: 'HEALTHCARE',
        companySize: '50-200',
        country: 'India',
        template: 'HEALTHCARE',
        plan: 'PRO',
      }),
    });
    const provBData = (await provBRes.json()) as any;
    assertTest('Provisioning Tenant B (Healthcare) succeeds', provBRes.status === 201);
    const tenantB = provBData.tenant;
    const tokenB = provBData.accessToken;

    // -------------------------------------------------------------------------
    // 4. MULTI-TENANT ISOLATION TESTING (TENANT A VS TENANT B)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. MULTI-TENANT DATA ISOLATION TESTING ---');

    // Create Lead in A & B
    const leadARes = await fetch(`${BASE_URL}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ customerName: 'Property Buyer A', phone: '+91 9000000001', amount: 5000000 }),
    });
    const leadAData = (await leadARes.json()) as any;
    assertTest('Tenant A creates Lead successfully', leadARes.status === 201);

    const leadBRes = await fetch(`${BASE_URL}/api/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ customerName: 'Patient B', phone: '+91 9000000002', amount: 150000 }),
    });
    const leadBData = (await leadBRes.json()) as any;
    assertTest('Tenant B creates Lead successfully', leadBRes.status === 201);

    // List Leads for A & B
    const listLeadsARes = await fetch(`${BASE_URL}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const listLeadsA = (await listLeadsARes.json()) as any;

    const listLeadsBRes = await fetch(`${BASE_URL}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const listLeadsB = (await listLeadsBRes.json()) as any;

    const aSeesA = listLeadsA.leads.some((l: any) => l.id === leadAData.lead.id);
    const aSeesB = listLeadsA.leads.some((l: any) => l.id === leadBData.lead.id);
    const bSeesB = listLeadsB.leads.some((l: any) => l.id === leadBData.lead.id);
    const bSeesA = listLeadsB.leads.some((l: any) => l.id === leadAData.lead.id);

    assertTest('Tenant A sees Tenant A Lead', aSeesA);
    assertTest('Tenant A CANNOT see Tenant B Lead (Isolated)', !aSeesB);
    assertTest('Tenant B sees Tenant B Lead', bSeesB);
    assertTest('Tenant B CANNOT see Tenant A Lead (Isolated)', !bSeesA);

    // Cross-tenant Direct ID Access Attempt (IDOR Attack)
    const directCrossAccessRes = await fetch(`${BASE_URL}/api/v1/leads/${leadBData.lead.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assertTest('Cross-tenant Lead access by ID returns 404/403 (IDOR Protected)', directCrossAccessRes.status === 404 || directCrossAccessRes.status === 403);

    // Create Customer in A & B
    const custARes = await fetch(`${BASE_URL}/api/v1/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Customer A', email: `cust.a.${timestamp}@a.com`, phone: '+91 9111111111' }),
    });
    const custAData = (await custARes.json()) as any;
    assertTest('Tenant A creates Customer', custARes.status === 201);

    const custBRes = await fetch(`${BASE_URL}/api/v1/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ name: 'Customer B', email: `cust.b.${timestamp}@b.com`, phone: '+91 9222222222' }),
    });
    const custBData = (await custBRes.json()) as any;
    assertTest('Tenant B creates Customer', custBRes.status === 201);

    const listCustARes = await fetch(`${BASE_URL}/api/v1/customers`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const listCustA = (await listCustARes.json()) as any;
    assertTest('Tenant A customer list isolated from Tenant B', !listCustA.customers.some((c: any) => c.id === custBData.customer.id));

    // Custom Fields Isolation
    const cfARes = await fetch(`${BASE_URL}/api/v1/custom-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ entityType: 'LEAD', fieldName: 'Field A Only', fieldType: 'TEXT' }),
    });
    const cfAData = (await cfARes.json()) as any;
    assertTest('Tenant A creates Custom Field', cfARes.status === 201);

    const listCfBRes = await fetch(`${BASE_URL}/api/v1/custom-fields`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const listCfB = (await listCfBRes.json()) as any;
    assertTest('Tenant B custom fields isolated from Tenant A', !listCfB.customFields.some((f: any) => f.id === cfAData.customField.id));

    // Pipelines & Stages Isolation
    const pipeARes = await fetch(`${BASE_URL}/api/v1/pipelines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Pipeline A' }),
    });
    const pipeAData = (await pipeARes.json()) as any;
    assertTest('Tenant A creates Pipeline', pipeARes.status === 201);

    const listPipeBRes = await fetch(`${BASE_URL}/api/v1/pipelines`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const listPipeB = (await listPipeBRes.json()) as any;
    assertTest('Tenant B pipelines isolated from Tenant A', !listPipeB.pipelines.some((p: any) => p.id === pipeAData.pipeline.id));

    // Automations Isolation
    const autoARes = await fetch(`${BASE_URL}/api/v1/automations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Rule A', triggerEvent: 'lead.created', actions: [{ actionType: 'create_followup', params: {} }] }),
    });
    const autoAData = (await autoARes.json()) as any;
    assertTest('Tenant A creates Automation Rule', autoARes.status === 201);

    const listAutoBRes = await fetch(`${BASE_URL}/api/v1/automations`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const listAutoB = (await listAutoBRes.json()) as any;
    assertTest('Tenant B automations isolated from Tenant A', !listAutoB.automations.some((a: any) => a.id === autoAData.automation.id));

    // API Keys Isolation
    const keyARes = await fetch(`${BASE_URL}/api/v1/tenant/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Key A' }),
    });
    const keyAData = (await keyARes.json()) as any;
    assertTest('Tenant A generates API Key', keyARes.status === 201);

    const listKeyBRes = await fetch(`${BASE_URL}/api/v1/tenant/api-keys`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const listKeyB = (await listKeyBRes.json()) as any;
    assertTest('Tenant B API keys isolated from Tenant A', !listKeyB.apiKeys.some((k: any) => k.id === keyAData.keyRecord.id));

    // Staff/Users Isolation
    const listStaffBRes = await fetch(`${BASE_URL}/api/v1/tenant/staff`, { headers: { Authorization: `Bearer ${tokenB}` } });
    const listStaffB = (await listStaffBRes.json()) as any;
    assertTest('Tenant B staff members isolated from Tenant A Admin', !listStaffB.staff.some((u: any) => u.email === provAData.user.email));

    // -------------------------------------------------------------------------
    // 5. CRM BUILDER OPERATIONS TESTING
    // -------------------------------------------------------------------------
    console.log('\n--- 5. CRM BUILDER OPERATIONS TESTING ---');

    // Dynamic Module Enable / Disable
    const modRes = await fetch(`${BASE_URL}/api/v1/modules`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const modData = (await modRes.json()) as any;
    assertTest('Get Tenant Modules returns 200 OK', modRes.status === 200);

    const projectMod = modData.modules.find((m: any) => m.moduleKey === 'PROJECTS');
    if (projectMod) {
      const toggleModRes = await fetch(`${BASE_URL}/api/v1/modules/${projectMod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
        body: JSON.stringify({ enabled: false }),
      });
      assertTest('Disable module succeeds', toggleModRes.status === 200);
    }

    // Custom Field Update & Delete
    const cfUpdateRes = await fetch(`${BASE_URL}/api/v1/custom-fields/${cfAData.customField.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ fieldName: 'Field A Updated' }),
    });
    assertTest('Update Custom Field succeeds', cfUpdateRes.status === 200);

    const cfDeleteRes = await fetch(`${BASE_URL}/api/v1/custom-fields/${cfAData.customField.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assertTest('Delete Custom Field succeeds', cfDeleteRes.status === 200);

    // Automation Dry-Run Test
    const autoTestRes = await fetch(`${BASE_URL}/api/v1/automations/${autoAData.automation.id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ status: 'New' }),
    });
    assertTest('Automation dry-run test succeeds', autoTestRes.status === 200);

    // Update Tenant Branding
    const brandRes = await fetch(`${BASE_URL}/api/v1/tenant/branding`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ primaryColor: '#ff5500', name: 'Demo Company A White-Label' }),
    });
    assertTest('Update Tenant Branding succeeds', brandRes.status === 200);

    // Create User & Assign Role
    const newUserRes = await fetch(`${BASE_URL}/api/v1/tenant/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ fullName: 'Staff User 1', email: `staff1.${timestamp}@a.com`, password: 'Password123!' }),
    });
    assertTest('Tenant Admin creates new staff user', newUserRes.status === 201);

    // -------------------------------------------------------------------------
    // 6. PLAN LIMIT ENFORCEMENT TESTING
    // -------------------------------------------------------------------------
    console.log('\n--- 6. PLAN LIMIT ENFORCEMENT TESTING ---');

    // Create a Tenant on FREE plan with limit of 2 users / 10 leads
    const provFreeRes = await fetch(`${BASE_URL}/api/v1/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Free Admin',
        email: `freeadmin.${timestamp}@free.com`,
        phone: '+91 9000000000',
        password: 'Password123!',
        companyName: 'Free Tier Co',
        companySlug: `free-co-${timestamp}`,
        plan: 'FREE',
      }),
    });
    const provFreeData = (await provFreeRes.json()) as any;
    const tokenFree = provFreeData.accessToken;

    // Create leads up to the FREE plan limit (maxLeads: 250 in seed schema for FREE plan)
    // To quickly test limit, let's update usage or test custom field limit (maxCustomFields: 5)
    for (let i = 1; i <= 5; i++) {
      await fetch(`${BASE_URL}/api/v1/custom-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFree}` },
        body: JSON.stringify({ entityType: 'LEAD', fieldName: `Free Field ${i}`, fieldType: 'TEXT' }),
      });
    }

    // 6th custom field attempt should fail with 403 PLAN_LIMIT_REACHED
    const limitExceedRes = await fetch(`${BASE_URL}/api/v1/custom-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFree}` },
      body: JSON.stringify({ entityType: 'LEAD', fieldName: 'Over Limit Field', fieldType: 'TEXT' }),
    });
    const limitExceedData = (await limitExceedRes.json()) as any;

    assertTest('Exceeding plan custom field limit returns HTTP 403 Forbidden', limitExceedRes.status === 403);
    assertTest('Returns standardized PLAN_LIMIT_REACHED error code', limitExceedData.code === 'PLAN_LIMIT_REACHED');

    // -------------------------------------------------------------------------
    // 7. PLATFORM OWNER MANAGEMENT
    // -------------------------------------------------------------------------
    console.log('\n--- 7. PLATFORM OWNER METADATA & LIFECYCLE MANAGEMENT ---');

    const adminDashboardRes = await fetch(`${BASE_URL}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assertTest('Platform Owner accesses global dashboard', adminDashboardRes.status === 200);

    const adminTenantsRes = await fetch(`${BASE_URL}/api/v1/admin/tenants`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assertTest('Platform Owner lists all system tenants', adminTenantsRes.status === 200);

    // Suspend Tenant B
    const suspendRes = await fetch(`${BASE_URL}/api/v1/admin/tenants/${tenantB.id}/suspend`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assertTest('Platform Owner suspends Tenant B', suspendRes.status === 200);

    // Attempt request as suspended Tenant B -> should return 403 Forbidden
    const suspendedReqRes = await fetch(`${BASE_URL}/api/v1/leads`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assertTest('Suspended Tenant request blocked with HTTP 403 Forbidden', suspendedReqRes.status === 403);

    // Re-activate Tenant B
    const activateRes = await fetch(`${BASE_URL}/api/v1/admin/tenants/${tenantB.id}/activate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assertTest('Platform Owner re-activates Tenant B', activateRes.status === 200);

    console.log('\n================================================================');
    console.log(` FINAL E2E TEST RESULTS: ${passedTests} / ${totalTests} Passed `);
    console.log('================================================================\n');

  } catch (error) {
    console.error('Fatal Error during E2E verification:', error);
  } finally {
    if (server) {
      (server as Server).close();
    }
  }
}

runE2EVerification();
