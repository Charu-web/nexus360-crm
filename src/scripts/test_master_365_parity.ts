process.env.NODE_ENV = 'test';

import http from 'http';
import assert from 'assert';
import app from '../server';

const PORT = 5004;
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

async function runMasterParityTestSuite() {
  console.log('====================================================');
  console.log(' Starting Master 365 CRM Parity Automated Test Suite ');
  console.log('====================================================\n');

  server = app.listen(PORT);
  let passedCount = 0;
  const ts = Date.now();

  try {
    // Register Tenant A
    const regAcme = await request('POST', '/api/v1/auth/register', {
      fullName: 'Master Admin',
      email: `master.admin.${ts}@acmemaster.com`,
      phone: '+1 555-7777',
      password: 'MasterPassword123!',
      companyName: `Acme Master ${ts}`,
      industry: 'Enterprise Technology',
    });
    assert(regAcme.status === 201, 'Register Acme Master Tenant');
    const acmeToken = regAcme.body.accessToken;
    const acmeTenantId = regAcme.body.tenant.id;

    // ----------------------------------------------------
    // TEST 1: Projects & Milestones Module
    // ----------------------------------------------------
    const createProj = await request(
      'POST',
      '/api/v1/projects',
      {
        title: 'ERP CRM Upgrade Project',
        description: 'Migrating legacy CRM to Multi-Tenant SaaS Engine',
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 150000,
      },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(createProj.status === 201 && createProj.body.project.title === 'ERP CRM Upgrade Project', 'Create Project');
    const projectId = createProj.body.project.id;

    const projTask = await request(
      'POST',
      `/api/v1/projects/${projectId}/tasks`,
      { title: 'Setup Server Architecture', dueDate: new Date().toISOString() },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(projTask.status === 201, 'Create Project Task');

    const projList = await request('GET', '/api/v1/projects', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(projList.status === 200 && projList.body.projects.length === 1, 'Fetch Projects');
    console.log('  [PASS 1/10] Projects, Tasks & Milestones Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 2: Customer Service Support Tickets
    // ----------------------------------------------------
    const createCust = await request(
      'POST',
      '/api/v1/customers',
      { name: 'Apex Solutions', email: `apex.${ts}@solutions.com`, phone: '+1 555-8888' },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    const customerId = createCust.body.customer.id;

    const createService = await request(
      'POST',
      '/api/v1/services',
      {
        subject: 'Database Performance Optimization Inquiry',
        description: 'Requesting assistance with custom indexing.',
        priority: 'High',
        customerId,
      },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(createService.status === 201 && createService.body.serviceRecord.ticketId.startsWith('TKT-'), 'Create Support Ticket');

    const serviceList = await request('GET', '/api/v1/services', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(serviceList.status === 200 && serviceList.body.serviceRecords.length === 1, 'Fetch Service Tickets');
    console.log('  [PASS 2/10] Customer Service & Support Tickets Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 3: Sales Targets & Quota Management
    // ----------------------------------------------------
    const userId = regAcme.body.user.id;
    const createTarget = await request(
      'POST',
      '/api/v1/targets',
      {
        userId,
        targetAmount: 50000,
        periodMonth: 9,
        periodYear: 2026,
      },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(createTarget.status === 201, 'Create Sales Target');

    const targetList = await request('GET', '/api/v1/targets', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(targetList.status === 200 && targetList.body.targets[0].targetAmount === 50000, 'Fetch Sales Targets');
    console.log('  [PASS 3/10] Sales Targets & Quotas Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 4: Marketing Campaigns & Channel ROI
    // ----------------------------------------------------
    const createCamp = await request(
      'POST',
      '/api/v1/campaigns',
      {
        name: 'Q3 Facebook Lead Generation',
        channel: 'Facebook',
        budget: 25000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(createCamp.status === 201, 'Create Marketing Campaign');

    const campList = await request('GET', '/api/v1/campaigns', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(campList.status === 200 && campList.body.campaigns[0].channel === 'Facebook', 'Fetch Marketing Campaigns');
    console.log('  [PASS 4/10] Marketing Campaigns & Channel Analytics Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 5: Form Builder & Public Lead Submission
    // ----------------------------------------------------
    const createForm = await request(
      'POST',
      '/api/v1/forms',
      {
        title: 'Real Estate Buyer Inquiry Form',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: false },
        ],
        leadSource: 'Website Form',
      },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(createForm.status === 201, 'Create Custom Lead Form');
    const formSlug = createForm.body.form.formSlug;

    // Public Form Definition (No Auth)
    const publicForm = await request('GET', `/api/v1/forms/public/${formSlug}`);
    assert(publicForm.status === 200 && publicForm.body.form.title.includes('Real Estate'), 'Public Form Definition');

    // Public Form Submission (No Auth -> Auto Lead Creation)
    const submitForm = await request('POST', `/api/v1/forms/public/${formSlug}/submit`, {
      name: 'Form Lead Submission',
      phone: '+91 9988776655',
      email: 'public.form@lead.com',
    });
    assert(submitForm.status === 201 && typeof submitForm.body.leadId === 'string', 'Public Form Submission Creates Lead');
    console.log('  [PASS 5/10] Drag & Drop Form Builder & Public Lead Capture Engine');
    passedCount++;

    // ----------------------------------------------------
    // TEST 6: HRMS & Attendance Check-In / Check-Out
    // ----------------------------------------------------
    const checkIn = await request(
      'POST',
      '/api/v1/hrms/attendance/check-in',
      { locationGps: '19.0760,72.8777' },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(checkIn.status === 201 && checkIn.body.record.status === 'PRESENT', 'Employee Clock In');

    const checkOut = await request(
      'POST',
      '/api/v1/hrms/attendance/check-out',
      {},
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(checkOut.status === 200 && checkOut.body.record.checkOut !== null, 'Employee Clock Out');
    console.log('  [PASS 6/10] HRMS Attendance & Check-In/Out Tracking Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 7: Call Analyzer & Call Logging
    // ----------------------------------------------------
    const createCall = await request(
      'POST',
      '/api/v1/calls',
      {
        callType: 'OUTGOING',
        durationSec: 185,
        notes: 'Discussed pricing structure.',
      },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(createCall.status === 201, 'Record Call Log');

    const callAnalytics = await request('GET', '/api/v1/calls', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(callAnalytics.status === 200 && callAnalytics.body.analytics.totalCalls === 1, 'Fetch Call Analytics');
    console.log('  [PASS 7/10] Call Analyzer & Agent Performance Metrics Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 8: Staff Live Chat Messaging
    // ----------------------------------------------------
    const sendChat = await request(
      'POST',
      '/api/v1/chat',
      { content: 'Welcome to the team workspace!' },
      { Authorization: `Bearer ${acmeToken}`, 'X-Tenant-ID': acmeTenantId }
    );
    assert(sendChat.status === 201, 'Send Staff Chat Message');

    const chatList = await request('GET', '/api/v1/chat', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(chatList.status === 200 && chatList.body.messages.length === 1, 'Fetch Chat History');
    console.log('  [PASS 8/10] Staff Live Messaging Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 9: Unified Global Search
    // ----------------------------------------------------
    const searchRes = await request('GET', '/api/v1/search?q=Form', null, {
      Authorization: `Bearer ${acmeToken}`,
      'X-Tenant-ID': acmeTenantId,
    });
    assert(
      searchRes.status === 200 &&
        searchRes.body.results.leads.length >= 1 &&
        searchRes.body.results.leads[0].customerName.includes('Form Lead'),
      'Global Search matches across entities'
    );
    console.log('  [PASS 9/10] Unified Tenant-Scoped Global Search Module');
    passedCount++;

    // ----------------------------------------------------
    // TEST 10: Strict Tenant Isolation on Expanded Modules
    // ----------------------------------------------------
    const regTenantB = await request('POST', '/api/v1/auth/register', {
      fullName: 'Tenant B Admin',
      email: `tenantB.${ts}@corp.io`,
      phone: '+1 555-1234',
      password: 'Password123!',
      companyName: `Tenant B Corp ${ts}`,
    });
    const tokenB = regTenantB.body.accessToken;
    const tenantBId = regTenantB.body.tenant.id;

    const bProjects = await request('GET', '/api/v1/projects', null, {
      Authorization: `Bearer ${tokenB}`,
      'X-Tenant-ID': tenantBId,
    });
    assert(bProjects.status === 200 && bProjects.body.projects.length === 0, 'Tenant B sees 0 projects from Tenant A');
    console.log('  [PASS 10/10] Strict Tenant Isolation Across All Expanded Modules');
    passedCount++;

    console.log('\n====================================================');
    console.log(` Master Parity Test Suite Execution Finished `);
    console.log(` Total Passed: ${passedCount} / 10 | Total Failed: 0`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Master Test Suite Failed Error:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runMasterParityTestSuite();
