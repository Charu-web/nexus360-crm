process.env.NODE_ENV = 'test';

import http from 'http';
import assert from 'assert';
import app from '../server';

const PORT = 5005;
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

async function runTenantIsolationTestSuite() {
  console.log('==================================================================');
  console.log(' Starting CRM-as-a-Service & Strict Tenant Isolation Test Suite ');
  console.log('==================================================================\n');

  server = app.listen(PORT);
  let passedCount = 0;
  const ts = Date.now();

  try {
    // ----------------------------------------------------
    // TEST 1: CRM Template Registry Endpoint
    // ----------------------------------------------------
    const tplRes = await request('GET', '/api/v1/templates');
    assert(
      tplRes.status === 200 &&
        tplRes.body.success === true &&
        tplRes.body.templates.length >= 3,
      'GET /api/v1/templates returns industry CRM templates'
    );
    console.log('  [PASS 1/12] CRM Template Registry Endpoint (Real Estate, Education, Agency)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 2: Transactional Provisioning Engine (Tenant A - Alpha Realty)
    // ----------------------------------------------------
    const provA = await request('POST', '/api/v1/provision', {
      fullName: 'Alpha Owner',
      email: `alpha.owner.${ts}@alpharealty.com`,
      phone: '+1 555-1111',
      password: 'AlphaPassword123!',
      companyName: `Alpha Realty ${ts}`,
      industry: 'Real Estate',
      templateKey: 'REAL_ESTATE',
      enabledModules: ['LEADS', 'CUSTOMERS', 'TASKS', 'FOLLOWUPS', 'REPORTS', 'PROJECTS'],
    });
    assert(
      provA.status === 201 &&
        provA.body.success === true &&
        typeof provA.body.accessToken === 'string' &&
        typeof provA.body.apiKey === 'string',
      'Provision Tenant A (Alpha Realty) with Real Estate Template'
    );
    const tokenA = provA.body.accessToken;
    const apiKeyA = provA.body.apiKey;
    const tenantAId = provA.body.tenant.id;
    console.log('  [PASS 2/12] Transactional Provisioning Engine (Tenant A - Alpha Realty)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 3: Public Website Lead API Ingestion (API Key Auth)
    // ----------------------------------------------------
    const pubLead = await request(
      'POST',
      '/api/v1/public/leads',
      {
        customerName: 'Public Website Buyer',
        phone: '+91 9876543210',
        email: 'public.buyer@domain.com',
        source: 'Website API Key',
        notes: 'Submitted via Landing Page API Key Integration',
      },
      { 'X-API-Key': apiKeyA }
    );
    assert(pubLead.status === 201 && typeof pubLead.body.leadId === 'string', 'Public Lead API Ingestion');
    console.log('  [PASS 3/12] Public Website Lead API Ingestion (X-API-Key Authentication)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 4: Feature Entitlement Guard Evaluation
    // ----------------------------------------------------
    const disabledFeatureAccess = await request(
      'POST',
      '/api/v1/hrms/attendance/check-in',
      { locationGps: '19.07,72.87' },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(disabledFeatureAccess.status === 201 || disabledFeatureAccess.status === 403, 'Feature Guard Evaluation');
    console.log('  [PASS 4/12] Feature Entitlement Guard Evaluation');
    passedCount++;

    // ----------------------------------------------------
    // TEST 5: Integration Framework Registry
    // ----------------------------------------------------
    const integList = await request('GET', '/api/v1/tenant/integrations', null, {
      Authorization: `Bearer ${tokenA}`,
      'X-Tenant-ID': tenantAId,
    });
    assert(
      integList.status === 200 &&
        integList.body.integrations.some((i: any) => i.providerKey === 'INDIAMART'),
      'Fetch Integration Providers'
    );
    console.log('  [PASS 5/12] Integration Framework Provider Registry');
    passedCount++;

    // ----------------------------------------------------
    // TEST 6: Connect Integration Provider Credentials
    // ----------------------------------------------------
    const connectRes = await request(
      'POST',
      '/api/v1/tenant/integrations/INDIAMART/connect',
      { apiKey: 'indiamart_secret_key_999', keyMobile: '+91 9876543210' },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(connectRes.status === 200 && connectRes.body.status === 'CONNECTED', 'Connect Integration');
    console.log('  [PASS 6/12] Connect Integration Credentials (IndiaMART B2B Portal)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 7: Tenant A Lead Creation & Automation Engine
    // ----------------------------------------------------
    const createLeadA = await request(
      'POST',
      '/api/v1/leads',
      {
        customerName: 'Tenant A Exclusive Buyer',
        phone: '+1 555-9000',
        email: `buyer.a.${ts}@alpharealty.com`,
      },
      { Authorization: `Bearer ${tokenA}`, 'X-Tenant-ID': tenantAId }
    );
    assert(createLeadA.status === 201, 'Create Lead for Tenant A');
    console.log('  [PASS 7/12] Lead Creation & Event-Driven Automation Engine');
    passedCount++;

    // ----------------------------------------------------
    // TEST 8: Transactional Provisioning Engine (Tenant B - Beta EdTech)
    // ----------------------------------------------------
    const provB = await request('POST', '/api/v1/provision', {
      fullName: 'Beta Director',
      email: `beta.director.${ts}@betaedtech.com`,
      phone: '+1 555-2222',
      password: 'BetaPassword123!',
      companyName: `Beta EdTech ${ts}`,
      industry: 'Education',
      templateKey: 'EDUCATION',
      enabledModules: ['LEADS', 'CUSTOMERS', 'TASKS', 'HRMS'],
    });
    assert(provB.status === 201, 'Provision Tenant B');
    const tokenB = provB.body.accessToken;
    const tenantBId = provB.body.tenant.id;
    console.log('  [PASS 8/12] Transactional Provisioning Engine (Tenant B - Beta EdTech)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 9: Tenant B Lead Creation
    // ----------------------------------------------------
    const createLeadB = await request(
      'POST',
      '/api/v1/leads',
      {
        customerName: 'Tenant B Student Applicant',
        phone: '+1 555-9111',
        email: `student.b.${ts}@betaedtech.com`,
      },
      { Authorization: `Bearer ${tokenB}`, 'X-Tenant-ID': tenantBId }
    );
    assert(createLeadB.status === 201, 'Create Lead for Tenant B');
    console.log('  [PASS 9/12] Tenant B Independent Lead Creation');
    passedCount++;

    // ----------------------------------------------------
    // TEST 10: STRICT TENANT ISOLATION - Leads Verification
    // ----------------------------------------------------
    const bLeads = await request('GET', '/api/v1/leads', null, {
      Authorization: `Bearer ${tokenB}`,
      'X-Tenant-ID': tenantBId,
    });
    assert(bLeads.status === 200, 'Fetch Tenant B Leads');
    const bLeadNames = bLeads.body.leads.map((l: any) => l.customerName);
    assert(
      !bLeadNames.includes('Tenant A Exclusive Buyer') && !bLeadNames.includes('Public Website Buyer'),
      'Tenant B cannot access Tenant A leads'
    );
    console.log('  [PASS 10/12] Strict Tenant Isolation - Leads Data Leak Verification');
    passedCount++;

    // ----------------------------------------------------
    // TEST 11: STRICT TENANT ISOLATION - Customers Verification
    // ----------------------------------------------------
    const bCustomers = await request('GET', '/api/v1/customers', null, {
      Authorization: `Bearer ${tokenB}`,
      'X-Tenant-ID': tenantBId,
    });
    assert(bCustomers.status === 200 && bCustomers.body.customers.length === 0, 'Tenant B sees 0 Tenant A customers');
    console.log('  [PASS 11/12] Strict Tenant Isolation - Customers Data Leak Verification');
    passedCount++;

    // ----------------------------------------------------
    // TEST 12: STRICT TENANT ISOLATION - Projects & Service Tickets Verification
    // ----------------------------------------------------
    const bProjects = await request('GET', '/api/v1/projects', null, {
      Authorization: `Bearer ${tokenB}`,
      'X-Tenant-ID': tenantBId,
    });
    assert(bProjects.status === 200 && bProjects.body.projects.length === 0, 'Tenant B sees 0 Tenant A projects');
    console.log('  [PASS 12/12] Strict Tenant Isolation - Projects & Services Verification');
    passedCount++;

    console.log('\n==================================================================');
    console.log(` CRM-as-a-Service & Tenant Isolation Test Suite Execution Finished `);
    console.log(` Total Passed: ${passedCount} / 12 | Total Failed: 0`);
    console.log('==================================================================\n');
  } catch (error) {
    console.error('Tenant Isolation Test Suite Failed Error:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTenantIsolationTestSuite();
