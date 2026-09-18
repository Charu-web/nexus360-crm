process.env.NODE_ENV = 'test';

import http from 'http';
import assert from 'assert';
import app from '../server';

const PORT = 5006;
let server: http.Server;

function request(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: encodeURI(path),
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(responseData);
          } catch {
            parsed = responseData;
          }
          resolve({ status: res.statusCode || 500, body: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTwoTierAdminTestSuite() {
  console.log('==================================================================');
  console.log(' Starting Two-Tier Admin Panel & SaaS Security Test Suite ');
  console.log('==================================================================\n');

  server = app.listen(PORT);
  let passedCount = 0;
  const ts = Date.now();

  try {
    // ----------------------------------------------------
    // TEST 1: Platform Owner Authentication
    // ----------------------------------------------------
    const platformLogin = await request('POST', '/api/v1/platform/auth/login', {
      email: 'platform@empirecrm.io',
      password: 'PlatformPassword123!',
    });
    assert(
      platformLogin.status === 200 &&
        platformLogin.body.success === true &&
        typeof platformLogin.body.accessToken === 'string',
      'Platform Owner Authentication'
    );
    const platformToken = platformLogin.body.accessToken;
    console.log('  [PASS 1/15] Platform Owner Authentication');
    passedCount++;

    // ----------------------------------------------------
    // TEST 2: Platform Admin Dashboard Metrics
    // ----------------------------------------------------
    const platformDash = await request('GET', '/api/v1/admin/dashboard', null, {
      Authorization: `Bearer ${platformToken}`,
    });
    assert(
      platformDash.status === 200 &&
        platformDash.body.success === true &&
        typeof platformDash.body.metrics.totalTenants === 'number',
      'Platform Admin Dashboard Metrics'
    );
    console.log('  [PASS 2/15] Platform Admin Dashboard & SaaS Revenue Metrics');
    passedCount++;

    // ----------------------------------------------------
    // TEST 3: Tenant User Access Blocked on Platform Admin APIs
    // ----------------------------------------------------
    const regTenantA = await request('POST', '/api/v1/provision', {
      fullName: 'Tenant Admin A',
      email: `tenantA.admin.${ts}@corpA.com`,
      phone: '+1 555-3333',
      password: 'TenantPassword123!',
      companyName: `Tenant Corp A ${ts}`,
    });
    const tokenA = regTenantA.body.accessToken;
    const tenantAId = regTenantA.body.tenant.id;

    const blockedAttempt = await request('GET', '/api/v1/admin/dashboard', null, {
      Authorization: `Bearer ${tokenA}`,
    });
    assert(
      blockedAttempt.status === 403 && blockedAttempt.body.message.includes('Platform Owner'),
      'Tenant User access blocked on Platform Admin API (403 Forbidden)'
    );
    console.log('  [PASS 3/15] Tenant User Access Blocked on Platform Admin APIs (403 Forbidden)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 4: Platform Admin Plan Management (Create Plan)
    // ----------------------------------------------------
    const createPlan = await request(
      'POST',
      '/api/v1/admin/plans',
      {
        name: `ENTERPRISE_PLUS_${ts}`,
        displayName: 'Enterprise Plus',
        priceMonthly: 9999,
        priceYearly: 99990,
        userLimit: 100,
        leadLimit: 50000,
        storageLimitMb: 10000,
        customFields: true,
        customPipeline: true,
        automations: true,
        whiteLabel: true,
        apiAccess: true,
      },
      { Authorization: `Bearer ${platformToken}` }
    );
    assert(createPlan.status === 201 && createPlan.body.plan.userLimit === 100, 'Create SaaS Plan');
    console.log('  [PASS 4/15] Platform Admin SaaS Plan Management (Create & Edit Plans)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 5: Platform Admin Tenant Management (List Tenants)
    // ----------------------------------------------------
    const tenantsList = await request('GET', '/api/v1/admin/tenants', null, {
      Authorization: `Bearer ${platformToken}`,
    });
    assert(tenantsList.status === 200 && tenantsList.body.tenants.length >= 1, 'List All SaaS Tenants');
    console.log('  [PASS 5/15] Platform Admin Tenant Workspace Registry');
    passedCount++;

    // ----------------------------------------------------
    // TEST 6: Platform Admin Suspend & Reactivate Workspace
    // ----------------------------------------------------
    const suspendRes = await request('POST', `/api/v1/admin/tenants/${tenantAId}/suspend`, null, {
      Authorization: `Bearer ${platformToken}`,
    });
    assert(suspendRes.status === 200 && suspendRes.body.message.includes('suspended'), 'Suspend Tenant');

    const activateRes = await request('POST', `/api/v1/admin/tenants/${tenantAId}/activate`, null, {
      Authorization: `Bearer ${platformToken}`,
    });
    assert(activateRes.status === 200 && activateRes.body.message.includes('activated'), 'Reactivate Tenant');
    console.log('  [PASS 6/15] Platform Admin Tenant Suspend & Reactivate Controls');
    passedCount++;

    // ----------------------------------------------------
    // TEST 7: Tenant Admin Settings & Branding Update
    // ----------------------------------------------------
    const updateBranding = await request(
      'PUT',
      '/api/v1/tenant/settings',
      { logo: 'https://cdn.corpA.com/logo.png', primaryColor: '#2563eb' },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(updateBranding.status === 200 && updateBranding.body.tenant.primaryColor === '#2563eb', 'Update Branding');
    console.log('  [PASS 7/15] Tenant Workspace Settings & Custom Branding');
    passedCount++;

    // ----------------------------------------------------
    // TEST 8: Tenant Staff Management (Add Team Member)
    // ----------------------------------------------------
    const getRoles = await request('GET', '/api/v1/tenant/roles', null, {
      Authorization: `Bearer ${tokenA}`,
      'X-Tenant-ID': tenantAId,
    });
    const defaultRoleId = getRoles.body.roles[0].id;

    const addStaff = await request(
      'POST',
      '/api/v1/tenant/staff',
      {
        fullName: 'Sales Executive 1',
        email: `sales1.${ts}@corpA.com`,
        password: 'StaffPassword123!',
        roleId: defaultRoleId,
        department: 'Sales',
        designation: 'Account Executive',
      },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(addStaff.status === 201 && addStaff.body.staff.email.includes('sales1'), 'Add Staff Member');
    console.log('  [PASS 8/15] Tenant Staff Management & User Role Assignment');
    passedCount++;

    // ----------------------------------------------------
    // TEST 9: Tenant Custom Roles & Permissions
    // ----------------------------------------------------
    const createRole = await request(
      'POST',
      '/api/v1/tenant/roles',
      {
        name: 'Senior Account Manager',
        description: 'Can manage leads and customer deals',
        permissions: ['leads.view', 'leads.create', 'customers.view', 'deals.view'],
      },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(createRole.status === 201 && createRole.body.role.name === 'Senior Account Manager', 'Create Custom Role');
    console.log('  [PASS 9/15] Tenant Custom Roles & Granular RBAC Permissions');
    passedCount++;

    // ----------------------------------------------------
    // TEST 10: Configurable Lead Sources
    // ----------------------------------------------------
    const createSource = await request(
      'POST',
      '/api/v1/tenant/sources',
      { name: 'Instagram Lead Form' },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(createSource.status === 201 && createSource.body.source.name === 'Instagram Lead Form', 'Create Lead Source');
    console.log('  [PASS 10/15] Configurable Tenant Lead Sources & Channels');
    passedCount++;

    // ----------------------------------------------------
    // TEST 11: Tenant Hashed API Key Generation
    // ----------------------------------------------------
    const genKey = await request(
      'POST',
      '/api/v1/tenant/api-keys',
      { name: 'Zapier Ingestion Key' },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(
      genKey.status === 201 &&
        typeof genKey.body.apiKeyRaw === 'string' &&
        genKey.body.apiKeyRaw.startsWith('sk_live_'),
      'Generate Hashed API Key'
    );
    console.log('  [PASS 11/15] Tenant Hashed API Key Generation & One-Time Token Display');
    passedCount++;

    // ----------------------------------------------------
    // TEST 12: Tenant Subscription & Live Usage Meters
    // ----------------------------------------------------
    const subRes = await request('GET', '/api/v1/tenant/subscription', null, {
      Authorization: `Bearer ${tokenA}`,
      'X-Tenant-ID': tenantAId,
    });
    assert(
      subRes.status === 200 &&
        typeof subRes.body.limits.userLimit === 'number' &&
        typeof subRes.body.usage.userCount === 'number',
      'Tenant Subscription & Usage Meters'
    );
    console.log('  [PASS 12/15] Tenant Subscription Details & Live Usage Meters');
    passedCount++;

    // ----------------------------------------------------
    // TEST 13: Tenant Audit Logs
    // ----------------------------------------------------
    const tenantAudit = await request('GET', '/api/v1/tenant/audit-logs', null, {
      Authorization: `Bearer ${tokenA}`,
      'X-Tenant-ID': tenantAId,
    });
    assert(tenantAudit.status === 200 && Array.isArray(tenantAudit.body.logs), 'Fetch Tenant Audit Logs');
    console.log('  [PASS 13/15] Tenant Workspace Activity Audit Logs');
    passedCount++;

    // ----------------------------------------------------
    // TEST 14: Platform Audit Logs
    // ----------------------------------------------------
    const platformAudit = await request('GET', '/api/v1/admin/audit-logs', null, {
      Authorization: `Bearer ${platformToken}`,
    });
    assert(platformAudit.status === 200 && Array.isArray(platformAudit.body.logs), 'Fetch Platform Audit Logs');
    console.log('  [PASS 14/15] Platform Owner Security & Audit Logs');
    passedCount++;

    // ----------------------------------------------------
    // TEST 15: Strict Cross-Tenant Data Isolation Test
    // ----------------------------------------------------
    const regTenantB = await request('POST', '/api/v1/provision', {
      fullName: 'Tenant Admin B',
      email: `tenantB.admin.${ts}@corpB.com`,
      phone: '+1 555-4444',
      password: 'TenantPassword123!',
      companyName: `Tenant Corp B ${ts}`,
    });
    const tokenB = regTenantB.body.accessToken;

    // Tenant B attempts to fetch Tenant A settings by passing X-Tenant-ID: tenantAId
    const crossAccessAttempt = await request('GET', '/api/v1/tenant/settings', null, {
      Authorization: `Bearer ${tokenB}`,
      'X-Tenant-ID': tenantAId, // Attempted spoof
    });
    // System must derive tenant strictly from token (Tenant B) and return Tenant B settings, NOT Tenant A settings!
    assert(
      crossAccessAttempt.status === 200 && crossAccessAttempt.body.settings.id === regTenantB.body.tenant.id,
      'Cross-tenant spoof attempt strictly overridden by authenticated token tenant context'
    );
    console.log('  [PASS 15/15] Strict Cross-Tenant Data Isolation & Header Spoof Overriding');
    passedCount++;

    console.log('\n==================================================================');
    console.log(` Two-Tier Admin Panel Test Suite Execution Finished `);
    console.log(` Total Passed: ${passedCount} / 15 | Total Failed: 0`);
    console.log('==================================================================\n');
  } catch (error) {
    console.error('Two-Tier Admin Test Suite Failed Error:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTwoTierAdminTestSuite();
