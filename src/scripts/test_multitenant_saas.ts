import http from 'http';
import assert from 'assert';
import app from '../server';

const PORT = 5002;
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
        path,
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

async function runTestRunner() {
  console.log('==================================================');
  console.log(' Starting Multi-Tenant CRM SaaS Automated Test Suite ');
  console.log('==================================================\n');

  server = app.listen(PORT);
  let passedCount = 0;
  const ts = Date.now();

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check
    // ----------------------------------------------------
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'UP', 'Health Check endpoint must return 200 UP');
    console.log('  [PASS] Health Check Endpoint');
    passedCount++;

    // ----------------------------------------------------
    // TEST 2: Register Tenant A ("Acme Corp" on Free Plan)
    // ----------------------------------------------------
    const regAcme = await request('POST', '/api/v1/auth/register-tenant', {
      companyName: `Acme Corp ${ts}`,
      ownerName: 'Alice Acme',
      email: `alice.${ts}@acmecorp.com`,
      phone: '+1 555-0101',
      password: 'AcmePassword123!',
      industry: 'Real Estate',
      companySize: '1-10',
    });

    assert(
      regAcme.status === 201 && regAcme.body.success === true,
      'Register Tenant A (Acme Corp) succeeds with 201'
    );
    const acmeToken = regAcme.body.accessToken;
    const acmeTenantId = regAcme.body.tenant.id;
    console.log('  [PASS] Public Tenant Registration ("Create Your CRM" Onboarding)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 3: Register Tenant B ("Nexus Tech" on Starter Plan)
    // ----------------------------------------------------
    const regNexus = await request('POST', '/api/v1/auth/register-tenant', {
      companyName: `Nexus Tech ${ts}`,
      ownerName: 'Bob Nexus',
      email: `bob.${ts}@nexustech.io`,
      phone: '+1 555-0202',
      password: 'NexusPassword123!',
      industry: 'Software',
      companySize: '10-50',
    });

    assert(
      regNexus.status === 201 && regNexus.body.success === true,
      'Register Tenant B (Nexus Tech) succeeds with 201'
    );
    const nexusToken = regNexus.body.accessToken;
    const nexusTenantId = regNexus.body.tenant.id;
    console.log('  [PASS] Second Independent Tenant Registration (Nexus Tech)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 4: Tenant Data Creation (Acme Corp Lead & Nexus Tech Lead)
    // ----------------------------------------------------
    const acmeLead = await request(
      'POST',
      '/api/v1/leads',
      {
        customerName: 'Acme Buyer One',
        phone: '+1 555-1111',
        email: 'buyer1@acmeclient.com',
        amount: 8500000,
      },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(acmeLead.status === 201 && acmeLead.body.success === true, 'Acme Corp creates Lead');

    // Nexus Tech creates Lead
    const nexusLead = await request(
      'POST',
      '/api/v1/leads',
      {
        customerName: 'Nexus Software Client',
        phone: '+1 555-2222',
        email: 'client@nexuscust.io',
        amount: 250000,
      },
      { Authorization: `Bearer ${nexusToken}`, 'X-Tenant-ID': nexusTenantId }
    );
    assert(nexusLead.status === 201 && nexusLead.body.success === true, 'Nexus Tech creates Lead');
    console.log('  [PASS] Tenant Data Creation');
    passedCount++;

    // ----------------------------------------------------
    // TEST 5: STRICT TENANT ISOLATION VERIFICATION
    // ----------------------------------------------------
    const acmeLeadsList = await request('GET', '/api/v1/leads', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(
      acmeLeadsList.status === 200 &&
        acmeLeadsList.body.leads.length === 1 &&
        acmeLeadsList.body.leads[0].customerName === 'Acme Buyer One',
      'Acme Corp sees ONLY Acme Corp leads (1 lead)'
    );

    const nexusLeadsList = await request('GET', '/api/v1/leads', null, {
      Authorization: `Bearer ${nexusToken}`,
      'X-Tenant-ID': nexusTenantId,
    });
    assert(
      nexusLeadsList.status === 200 &&
        nexusLeadsList.body.leads.length === 1 &&
        nexusLeadsList.body.leads[0].customerName === 'Nexus Software Client',
      'Nexus Tech sees ONLY Nexus Tech leads (1 lead)'
    );

    console.log('  [PASS] Strict Tenant Data Isolation (Tenant A cannot see Tenant B data)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 6: SUBSCRIPTION LIMIT ENFORCEMENT (User Limit)
    // ----------------------------------------------------
    // Acme Corp is on FREE plan (limit: 3 users). Currently has 1 owner user.
    const user2 = await request(
      'POST',
      '/api/v1/users',
      { fullName: 'Acme User Two', email: `user2.${ts}@acmecorp.com`, password: 'UserPassword123!' },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(user2.status === 201, 'Acme Corp creates 2nd User (within limit 3)');

    const user3 = await request(
      'POST',
      '/api/v1/users',
      { fullName: 'Acme User Three', email: `user3.${ts}@acmecorp.com`, password: 'UserPassword123!' },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(user3.status === 201, 'Acme Corp creates 3rd User (reaches limit 3)');

    // Attempt 4th User creation on FREE plan limit of 3
    const user4 = await request(
      'POST',
      '/api/v1/users',
      { fullName: 'Acme User Four', email: `user4.${ts}@acmecorp.com`, password: 'UserPassword123!' },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(
      user4.status === 422 && user4.body.message.includes('Subscription limit reached'),
      'Backend rejects 4th user creation on FREE plan (Limit 3 enforced)'
    );
    console.log('  [PASS] Subscription Plan Limit Guard Enforcement (User Limit Rejection)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 7: PLATFORM OWNER DASHBOARD & TENANT SUSPENSION
    // ----------------------------------------------------
    const platformLogin = await request('POST', '/api/v1/platform/auth/login', {
      email: 'platform@empirecrm.io',
      password: 'PlatformPassword123!',
    });
    assert(
      platformLogin.status === 200 && platformLogin.body.user.isPlatformOwner === true,
      'Platform Owner Authentication'
    );
    const platformToken = platformLogin.body.accessToken;

    const platformDash = await request('GET', '/api/v1/platform/dashboard', null, {
      Authorization: `Bearer ${platformToken}`,
    });
    assert(
      platformDash.status === 200 && platformDash.body.metrics.totalTenants >= 3,
      'Platform Owner Dashboard Metrics'
    );

    // Platform Owner suspends Acme Corp
    const suspendRes = await request('POST', `/api/v1/platform/tenants/${acmeTenantId}/suspend`, null, {
      Authorization: `Bearer ${platformToken}`,
    });
    assert(suspendRes.status === 200 && suspendRes.body.success === true, 'Platform Owner suspends Acme Corp');

    // Acme Corp user attempts login / API access -> 403 Forbidden
    const suspendedLogin = await request('POST', '/api/v1/auth/login', {
      email: `alice.${ts}@acmecorp.com`,
      password: 'AcmePassword123!',
    });
    assert(
      suspendedLogin.status === 403 && suspendedLogin.body.message.includes('suspended'),
      'Suspended tenant user login is blocked (403 Forbidden)'
    );

    // Platform Owner reactivates Acme Corp
    await request('POST', `/api/v1/platform/tenants/${acmeTenantId}/activate`, null, {
      Authorization: `Bearer ${platformToken}`,
    });
    console.log('  [PASS] Platform Owner Dashboard & Tenant Suspension Controls');
    passedCount++;

    // ----------------------------------------------------
    // TEST 8: KANBAN SALES PIPELINE STAGES
    // ----------------------------------------------------
    const pipelines = await request('GET', '/api/v1/pipelines', null, {
      Authorization: `Bearer ${nexusToken}`,
      'X-Tenant-ID': nexusTenantId,
    });
    assert(
      pipelines.status === 200 && pipelines.body.pipelines[0].stages.length >= 6,
      'Fetch Tenant Kanban Pipeline'
    );
    console.log('  [PASS] Tenant Customizable Sales Kanban Pipeline');
    passedCount++;

    // ----------------------------------------------------
    // TEST 9: TENANT REPORTS & ANALYTICS
    // ----------------------------------------------------
    const acmeReports = await request('GET', '/api/v1/reports', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(
      acmeReports.status === 200 && acmeReports.body.summary.totalLeads === 1,
      'Tenant Reports return isolated counts'
    );
    console.log('  [PASS] Multi-Tenant Isolated Reports & Analytics');
    passedCount++;

    console.log('\n==================================================');
    console.log(` Test Suite Execution Finished `);
    console.log(` Total Passed: ${passedCount} / 9 | Total Failed: 0`);
    console.log('==================================================\n');
  } catch (error) {
    console.error('Test Suite Failed Error:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTestRunner();
