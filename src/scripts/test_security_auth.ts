import http from 'http';
import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

const BASE_URL = 'http://localhost:5000';

function makeRequest(
  path: string,
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : undefined;

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          let parsedBody = responseData;
          try {
            parsedBody = JSON.parse(responseData);
          } catch {}
          resolve({
            status: res.statusCode || 0,
            body: parsedBody,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runSecurityTestSuite() {
  console.log('==================================================');
  console.log('  Starting Empire CRM Security & Auth Test Suite  ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // Ensure default tenant and test users exist in DB
  let defaultTenant = await prisma.tenant.findFirst({ where: { slug: 'empire-crm' } });
  if (!defaultTenant) {
    defaultTenant = await prisma.tenant.create({
      data: { name: 'Empire CRM Workspace', slug: 'empire-crm', status: 'ACTIVE' },
    });
  }

  // Find or create admin role
  let adminRole = await prisma.role.findFirst({ where: { tenantId: defaultTenant.id, name: 'TENANT_ADMIN' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: { tenantId: defaultTenant.id, name: 'TENANT_ADMIN', permissions: '["*"]' },
    });
  }

  const adminPassHash = await bcrypt.hash('AdminPassword123!', 10);
  let adminUser = await prisma.user.findFirst({ where: { email: 'admin@empirecrm.io' } });
  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: adminPassHash, isActive: true, roleId: adminRole.id },
    });
  } else {
    adminUser = await prisma.user.create({
      data: {
        tenantId: defaultTenant.id,
        email: 'admin@empirecrm.io',
        password: adminPassHash,
        fullName: 'Admin User',
        roleId: adminRole.id,
        isActive: true,
      },
    });
  }

  // Find or create staff role & user
  let staffRole = await prisma.role.findFirst({ where: { tenantId: defaultTenant.id, name: 'STAFF' } });
  if (!staffRole) {
    staffRole = await prisma.role.create({
      data: { tenantId: defaultTenant.id, name: 'STAFF', permissions: '["LEADS_VIEW"]' },
    });
  }

  const staffPassHash = await bcrypt.hash('UserPassword123!', 10);
  let staffUser = await prisma.user.findFirst({ where: { email: 'user@empirecrm.io' } });
  if (staffUser) {
    await prisma.user.update({
      where: { id: staffUser.id },
      data: { password: staffPassHash, isActive: true, roleId: staffRole.id },
    });
  } else {
    staffUser = await prisma.user.create({
      data: {
        tenantId: defaultTenant.id,
        email: 'user@empirecrm.io',
        password: staffPassHash,
        fullName: 'Staff User',
        roleId: staffRole.id,
        isActive: true,
      },
    });
  }

  // Create Tenant B & user for Tenant Isolation test
  let tenantB = await prisma.tenant.findFirst({ where: { slug: 'tenant-b-test' } });
  if (!tenantB) {
    tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B Workspace', slug: 'tenant-b-test', status: 'ACTIVE' },
    });
  }

  let tenantBRole = await prisma.role.findFirst({ where: { tenantId: tenantB.id, name: 'TENANT_ADMIN' } });
  if (!tenantBRole) {
    tenantBRole = await prisma.role.create({
      data: { tenantId: tenantB.id, name: 'TENANT_ADMIN', permissions: '["*"]' },
    });
  }

  let tenantBUser = await prisma.user.findFirst({ where: { email: 'user.tenantb@example.com' } });
  if (tenantBUser) {
    await prisma.user.update({
      where: { id: tenantBUser.id },
      data: { password: staffPassHash, isActive: true, roleId: tenantBRole.id },
    });
  } else {
    tenantBUser = await prisma.user.create({
      data: {
        tenantId: tenantB.id,
        email: 'user.tenantb@example.com',
        password: staffPassHash,
        fullName: 'Tenant B Admin',
        roleId: tenantBRole.id,
        isActive: true,
      },
    });
  }

  // --- Test A: Wrong email + wrong password -> LOGIN FAIL ---
  const resA = await makeRequest('/api/auth/login', 'POST', { email: 'invalid.user@test.com', password: 'WrongPassword999!' });
  assert(resA.status === 401 && resA.body.success === false, 'Test A: Wrong email + wrong password rejects (401)', `Got ${resA.status}`);

  // --- Test B: Correct email + wrong password -> LOGIN FAIL ---
  const resB = await makeRequest('/api/auth/login', 'POST', { email: 'admin@empirecrm.io', password: 'WrongPassword999!' });
  assert(resB.status === 401 && resB.body.success === false, 'Test B: Correct email + wrong password rejects (401)', `Got ${resB.status}`);

  // --- Test C: Wrong email + correct password -> LOGIN FAIL ---
  const resC = await makeRequest('/api/auth/login', 'POST', { email: 'nonexistent@empirecrm.io', password: 'AdminPassword123!' });
  assert(resC.status === 401 && resC.body.success === false, 'Test C: Wrong email + correct password rejects (401)', `Got ${resC.status}`);

  // --- Test D: Correct registered credentials -> LOGIN SUCCESS ---
  const resD = await makeRequest('/api/auth/login', 'POST', { email: 'admin@empirecrm.io', password: 'AdminPassword123!' });
  assert(resD.status === 200 && resD.body.success === true && !!resD.body.accessToken, 'Test D: Valid credentials returns HTTP 200 + token', `Got ${resD.status}`);
  const adminToken = resD.body.accessToken;

  // Login staff user
  const resStaffLogin = await makeRequest('/api/auth/login', 'POST', { email: 'user@empirecrm.io', password: 'UserPassword123!' });
  assert(resStaffLogin.status === 200 && !!resStaffLogin.body.accessToken, 'Staff Login Success', `Got ${resStaffLogin.status}`);
  const staffToken = resStaffLogin.body.accessToken;

  // Login Tenant B user
  const resTBLogin = await makeRequest('/api/auth/login', 'POST', { email: 'user.tenantb@example.com', password: 'UserPassword123!' });
  const tenantBToken = resTBLogin.body.accessToken;

  // --- Test F: Unauthenticated API request -> HTTP 401 ---
  const resF = await makeRequest('/api/v1/leads', 'GET');
  assert(resF.status === 401 && resF.body.success === false, 'Test F: Unauthenticated request to /api/v1/leads returns 401', `Got ${resF.status}`);

  const resF2 = await makeRequest('/api/admin/dashboard', 'GET');
  assert(resF2.status === 401 && resF2.body.success === false, 'Test F2: Unauthenticated request to /api/admin/dashboard returns 401', `Got ${resF2.status}`);

  // --- Test G: Authenticated non-admin accesses admin endpoint -> HTTP 403 ---
  const resG = await makeRequest('/api/v1/modules', 'POST', { moduleKey: 'TEST' }, { Authorization: `Bearer ${staffToken}` });
  assert(resG.status === 403 && resG.body.success === false, 'Test G: Staff user creating module returns HTTP 403 Forbidden', `Got ${resG.status}`);

  // --- Test H: User from Tenant A requests Tenant B data -> DENIED ---
  // Create a lead in Tenant B
  const leadTB = await prisma.lead.create({
    data: {
      tenantId: tenantB.id,
      leadId: `TEST-TB-${Date.now()}`,
      customerName: 'Tenant B Private Lead',
      phone: '+91 9999999999',
    },
  });

  // Query leads as Tenant A user
  const resH = await makeRequest('/api/v1/leads', 'GET', undefined, { Authorization: `Bearer ${adminToken}` });
  const tenantALeads = resH.body.leads || [];
  const foundTBLead = tenantALeads.find((l: any) => l.id === leadTB.id);
  assert(!foundTBLead, 'Test H: Tenant A user cannot read Tenant B lead', `Tenant A received Tenant B lead!`);

  // --- Test I: Logout -> Session destroyed ---
  const resI = await makeRequest('/api/auth/logout', 'POST', undefined, { Authorization: `Bearer ${adminToken}` });
  assert(resI.status === 200 && resI.body.success === true, 'Test I: Logout returns HTTP 200 Success', `Got ${resI.status}`);

  // --- Test J: Invalid session token -> HTTP 401 ---
  const resJ = await makeRequest('/api/auth/me', 'GET', undefined, { Authorization: 'Bearer invalid_fake_token_123' });
  assert(resJ.status === 401 && resJ.body.success === false, 'Test J: Invalid token returns HTTP 401', `Got ${resJ.status}`);

  // --- Test K: Registration flow ---
  const newEmail = `newuser.${Date.now()}@example.com`;
  const resK = await makeRequest('/api/auth/signup', 'POST', {
    fullName: 'Test New User',
    name: 'Test New User',
    email: newEmail,
    password: 'NewSecurePassword123!',
  });
  assert(resK.status === 201 && resK.body.success === true, 'Test K: User registration succeeds with HTTP 201', `Got ${resK.status}`);

  // Login with newly registered credentials
  const resKLogin = await makeRequest('/api/auth/login', 'POST', {
    email: newEmail,
    password: 'NewSecurePassword123!',
  });
  assert(resKLogin.status === 200 && !!resKLogin.body.accessToken, 'Test K2: Login with newly registered user succeeds', `Got ${resKLogin.status}`);

  // --- Test L: Password reset request ---
  const resL = await makeRequest('/api/auth/forgot-password', 'POST', { email: newEmail });
  assert(resL.status === 200 && resL.body.success === true, 'Test L: Password reset request returns HTTP 200', `Got ${resL.status}`);

  // Cleanup test lead
  await prisma.lead.delete({ where: { id: leadTB.id } }).catch(() => {});

  console.log('\n==================================================');
  console.log(`  Security Test Suite Finished`);
  console.log(`  Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
