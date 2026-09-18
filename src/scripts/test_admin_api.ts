import http from 'http';
import app from '../server';
import { prisma } from '../lib/db';

const PORT = 5055; // Dedicated port for test suite

function request(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const reqOptions: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 500, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('==================================================');
  console.log(' Starting Admin Panel Backend Automated Test Suite ');
  console.log('==================================================\n');

  const server = app.listen(PORT);
  let superAdminToken = '';
  let adminToken = '';
  let staffToken = '';
  let createdUserId = '';
  let createdLeadId = '';
  let createdCustomerId = '';

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string, resBody?: any) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      if (resBody !== undefined) {
        console.error(`         Response Body:`, JSON.stringify(resBody, null, 2));
      }
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('GET', '/health');
    assert(
      health.status === 200 && (health.body.status === 'healthy' || health.body.server?.status === 'UP'),
      'Health Check Endpoint',
      undefined,
      health.body
    );

    // 2. Admin Authentication Tests (Bypass Auth Middleware on Login)
    console.log('\n--- 1. Admin Authentication Tests ---');

    // TEST: GET /api/admin/auth/login without Authorization header returns 405 Method Not Allowed
    const getLoginRes = await request('GET', '/api/admin/auth/login');
    assert(
      getLoginRes.status === 405 &&
        getLoginRes.body.success === false &&
        getLoginRes.body.message.includes('Method Not Allowed'),
      'GET /api/admin/auth/login returns 405 Method Not Allowed (No token missing error, success: false)'
    );

    // TEST: POST /api/admin/auth/login without Authorization header with bad credentials
    const invalidLogin = await request('POST', '/api/admin/auth/login', {}, {
      email: 'superadmin@empirecrm.io',
      password: 'WrongPassword123!',
    });
    assert(
      invalidLogin.status === 401 && invalidLogin.body.message === 'Invalid email or password',
      'POST /api/admin/auth/login without token rejects invalid credentials (401)'
    );

    // TEST: POST /api/admin/auth/login without Authorization header with valid credentials
    const superAdminLogin = await request('POST', '/api/admin/auth/login', {}, {
      email: 'superadmin@empirecrm.io',
      password: 'SuperAdminPassword123!',
    });
    assert(
      superAdminLogin.status === 200 &&
        !!superAdminLogin.body.accessToken &&
        superAdminLogin.body.user.email === 'superadmin@empirecrm.io',
      'POST /api/admin/auth/login generates JWT session token on valid credentials (200)'
    );
    superAdminToken = superAdminLogin.body.accessToken;

    const adminLogin = await request('POST', '/api/admin/auth/login', {}, {
      email: 'admin@empirecrm.io',
      password: 'AdminPassword123!',
    });
    assert(adminLogin.status === 200 && !!adminLogin.body.accessToken, 'Admin Login Success');
    adminToken = adminLogin.body.accessToken;

    const staffLogin = await request('POST', '/api/v1/auth/login', {}, {
      email: 'user@empirecrm.io',
      password: 'UserPassword123!',
    });
    assert(staffLogin.status === 200 && !!staffLogin.body.accessToken, 'Staff User Login Success');
    staffToken = staffLogin.body.accessToken;

    const profileRes = await request('GET', '/api/admin/auth/me', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(
      profileRes.status === 200 && profileRes.body.user.email === 'superadmin@empirecrm.io',
      'Get Admin Profile (/api/admin/auth/me) with Bearer token'
    );

    // 3. Authorization & RBAC Middleware Tests
    console.log('\n--- 2. Authorization & RBAC Tests ---');
    const noTokenRes = await request('GET', '/api/admin/dashboard');
    assert(
      noTokenRes.status === 401 && noTokenRes.body.message.includes('token missing'),
      'Protected Endpoint (/api/admin/dashboard) blocks unauthenticated request (401)'
    );

    const invalidTokenRes = await request('GET', '/api/admin/dashboard', {
      Authorization: 'Bearer invalid.fake.token',
    });
    assert(
      invalidTokenRes.status === 401 && invalidTokenRes.body.message.includes('Invalid'),
      'Protected Endpoint rejects invalid token (401)'
    );

    const staffAccessRes = await request('GET', '/api/admin/dashboard', {
      Authorization: `Bearer ${staffToken}`,
    });
    assert(
      staffAccessRes.status === 403 && staffAccessRes.body.message.includes('Access denied'),
      'Block Non-Admin / Staff User from Admin API (403)'
    );

    // 4. Admin Dashboard Metrics
    console.log('\n--- 3. Admin Dashboard Metrics Tests ---');
    const dashboardRes = await request('GET', '/api/admin/dashboard', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(
      dashboardRes.status === 200 &&
        typeof dashboardRes.body?.metrics?.totalUsers === 'number' &&
        typeof dashboardRes.body?.metrics?.totalLeads === 'number',
      'Fetch Real DB Dashboard Metrics using valid token',
      undefined,
      dashboardRes.body
    );

    // 5. User Management CRUD & Actions
    console.log('\n--- 4. User Management Tests ---');
    const listUsersRes = await request('GET', '/api/admin/users?page=1&limit=5', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(
      listUsersRes.status === 200 && Array.isArray(listUsersRes.body?.users),
      'List Users with Pagination',
      undefined,
      listUsersRes.body
    );

    const createUserRes = await request(
      'POST',
      '/api/admin/users',
      { Authorization: `Bearer ${superAdminToken}` },
      {
        fullName: 'Test Agent',
        email: 'testagent@empirecrm.io',
        password: 'TestPassword123!',
        phone: '+15559998888',
        department: 'Operations',
        designation: 'Operations Specialist',
        roleName: 'STAFF',
      }
    );
    assert(createUserRes.status === 201 && !!createUserRes.body?.user?.id, 'Create User API', undefined, createUserRes.body);
    createdUserId = createUserRes.body?.user?.id;

    const userDetailRes = await request('GET', `/api/admin/users/${createdUserId}`, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(userDetailRes.status === 200, 'View User Details');

    const toggleStatusRes = await request(
      'PATCH',
      `/api/admin/users/${createdUserId}/status`,
      { Authorization: `Bearer ${superAdminToken}` },
      { isActive: false }
    );
    assert(
      toggleStatusRes.status === 200 && toggleStatusRes.body.user.isActive === false,
      'Deactivate User Status'
    );

    const resetPassRes = await request(
      'POST',
      `/api/admin/users/${createdUserId}/reset-password`,
      { Authorization: `Bearer ${superAdminToken}` },
      { newPassword: 'NewSecurePassword123!' }
    );
    assert(resetPassRes.status === 200, 'Reset User Password');

    const deleteUserRes = await request('DELETE', `/api/admin/users/${createdUserId}`, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(deleteUserRes.status === 200, 'Delete User API');

    // 6. CRM Data Management (Leads, Customers, Tasks, Notes, Activities)
    console.log('\n--- 5. CRM Data Management Tests ---');
    const createLeadRes = await request(
      'POST',
      '/api/admin/leads',
      { Authorization: `Bearer ${superAdminToken}` },
      {
        customerName: 'Test Lead Prospect',
        phone: '+919999000011',
        email: 'testprospect@example.com',
        loanType: 'Home Loan',
        amount: 3500000,
        source: 'Website',
        status: 'New',
      }
    );
    assert(createLeadRes.status === 201 && !!createLeadRes.body.lead.id, 'Create Lead API');
    createdLeadId = createLeadRes.body.lead.id;

    const getLeadsRes = await request('GET', '/api/admin/leads?status=New', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(getLeadsRes.status === 200 && getLeadsRes.body.leads.length > 0, 'Get & Filter Leads');

    const updateLeadRes = await request(
      'PUT',
      `/api/admin/leads/${createdLeadId}`,
      { Authorization: `Bearer ${superAdminToken}` },
      { status: 'Converted' }
    );
    assert(
      updateLeadRes.status === 200 && updateLeadRes.body.lead.status === 'Converted',
      'Update Lead Status'
    );

    const createCustomerRes = await request(
      'POST',
      '/api/admin/customers',
      { Authorization: `Bearer ${superAdminToken}` },
      {
        name: 'Test Corporate Client',
        email: 'corpclient@example.com',
        phone: '+919876500000',
        city: 'Mumbai',
        company: 'Apex Tech Ltd',
      }
    );
    assert(
      createCustomerRes.status === 201 && !!createCustomerRes.body.customer.id,
      'Create Customer API'
    );
    createdCustomerId = createCustomerRes.body.customer.id;

    const getCustomersRes = await request('GET', '/api/admin/customers', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(getCustomersRes.status === 200, 'List Customers API');

    const createTaskRes = await request(
      'POST',
      '/api/admin/tasks',
      { Authorization: `Bearer ${superAdminToken}` },
      {
        title: 'Review compliance documents',
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(),
        assignedToId: adminLogin.body.user.id,
        leadId: createdLeadId,
      }
    );
    assert(createTaskRes.status === 201, 'Create Task API');

    const createNoteRes = await request(
      'POST',
      '/api/admin/notes',
      { Authorization: `Bearer ${superAdminToken}` },
      {
        content: 'Client requested lowering ROI to 8.5%',
        leadId: createdLeadId,
      }
    );
    assert(createNoteRes.status === 201, 'Create Note API');

    const getActivitiesRes = await request('GET', '/api/admin/activities', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(
      getActivitiesRes.status === 200 && getActivitiesRes.body.activities.length > 0,
      'Get Recent System Activities'
    );

    // 6.5 Extended Zoho-Style CRM Feature Tests
    console.log('\n--- 5.5 Extended CRM Feature Tests ---');

    // Lead Conversion Test
    const convertRes = await request(
      'POST',
      `/api/admin/leads/${createdLeadId}/convert`,
      { Authorization: `Bearer ${superAdminToken}` },
      { createDeal: true, dealTitle: 'Enterprise Loan Deal', dealAmount: 5000000 }
    );
    assert(
      convertRes.status === 200 && convertRes.body.lead.status === 'Converted' && !!convertRes.body.customer.id,
      'Convert Lead to Contact, Account & Deal',
      undefined,
      convertRes.body
    );

    // Contacts Test
    const contactsRes = await request('GET', '/api/admin/contacts', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(contactsRes.status === 200 && Array.isArray(contactsRes.body.contacts), 'Get Contacts List');

    // Deals Test
    const dealsRes = await request('GET', '/api/admin/deals', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(dealsRes.status === 200 && Array.isArray(dealsRes.body.deals), 'Get Deals List');

    // Meetings Test
    const createMeetingRes = await request(
      'POST',
      '/api/admin/meetings',
      { Authorization: `Bearer ${superAdminToken}` },
      { title: 'Project Discovery Call', meetingDate: new Date(), duration: 45 }
    );
    assert(createMeetingRes.status === 201 && !!createMeetingRes.body.meeting.id, 'Schedule Meeting API');

    // Products Test
    const createProductRes = await request(
      'POST',
      '/api/admin/products',
      { Authorization: `Bearer ${superAdminToken}` },
      { name: 'Enterprise CRM License', category: 'Software', price: 999 }
    );
    assert(createProductRes.status === 201 && !!createProductRes.body.product.id, 'Create Product API');

    // Quotes Test
    const createQuoteRes = await request(
      'POST',
      '/api/admin/quotes',
      { Authorization: `Bearer ${superAdminToken}` },
      { subject: 'Quote for Enterprise License', totalAmount: 999 }
    );
    assert(createQuoteRes.status === 201 && !!createQuoteRes.body.quote.id, 'Create Quote API');

    // Global Search Test
    const searchRes = await request('GET', '/api/v1/search?q=Test', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(searchRes.status === 200 && !!searchRes.body.results.leads, 'Global Unified Search');

    // 7. Reports & Analytics APIs
    console.log('\n--- 6. Reports & Analytics Tests ---');
    const reportsRes = await request('GET', '/api/admin/reports', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(
      reportsRes.status === 200 &&
        !!reportsRes.body.reports.conversionStats &&
        Array.isArray(reportsRes.body.reports.sourceBreakdown),
      'Fetch Real DB Analytics & Summaries'
    );

    // 8. Audit Logs
    console.log('\n--- 7. Audit Logs Tests ---');
    const auditLogsRes = await request('GET', '/api/admin/audit-logs', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(
      auditLogsRes.status === 200 && auditLogsRes.body.auditLogs.length > 0,
      'Fetch Recorded Admin Audit Logs'
    );

    // 9. Admin Logout Test
    console.log('\n--- 8. Admin Logout Test ---');
    const logoutRes = await request(
      'POST',
      '/api/admin/auth/logout',
      { Authorization: `Bearer ${superAdminToken}` }
    );
    assert(logoutRes.status === 200 && logoutRes.body.success === true, 'Admin Logout Endpoint');

    // 10. Input Validation & Error Handling
    console.log('\n--- 9. Error Handling & Validation Tests ---');
    const badValidationRes = await request(
      'POST',
      '/api/admin/users',
      { Authorization: `Bearer ${superAdminToken}` },
      { email: 'not-an-email' }
    );
    assert(badValidationRes.status === 400, 'Validation Error Handling (400 Bad Request)');

    const notFoundRes = await request('GET', '/api/admin/users/non-existent-id-9999', {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert(notFoundRes.status === 404, 'Not Found Error Handling (404)');

    // Clean up created test entities
    await request('DELETE', `/api/admin/leads/${createdLeadId}`, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    await request('DELETE', `/api/admin/customers/${createdCustomerId}`, {
      Authorization: `Bearer ${superAdminToken}`,
    });

    console.log('\n==================================================');
    console.log(` Test Suite Execution Finished `);
    console.log(` Total Passed: ${passed} | Total Failed: ${failed}`);
    console.log('==================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close(async () => {
      await prisma.$disconnect();
      if (failed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
  }
}

runTestSuite();
