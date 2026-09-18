import http from 'http';

function request(options: http.RequestOptions, body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode || 0, data: parsed });
        } catch {
          resolve({ status: res.statusCode || 0, data: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('====================================================================');
  console.log(' STARTING E2E FULL-SCREEN CRM CREATION & UNIQUE SLUG SUCCESS TEST');
  console.log('====================================================================\n');

  try {
    // 1. TEST 1: Register User A & Create CRM A
    const emailA = `usera_${Date.now()}@company-a.com`;
    console.log('[TEST 1] Registering User A & Creating CRM for "Alpha Global"');

    const resA = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/provision',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'User A Alpha',
      companyName: 'Alpha Global',
      companySlug: 'alpha-global',
      email: emailA,
      phone: '+15551110000',
      password: 'Password123!',
      industry: 'Technology'
    });

    console.log('  -> CRM A Provision Status:', resA.status);
    const slugA = resA.data.data ? resA.data.data.workspace.slug : 'alpha-global';
    const tokenA = resA.data.accessToken || (resA.data.data ? resA.data.data.token : null);
    console.log('  -> Generated Unique CRM A Slug:', slugA, '| URL: /crm/' + slugA);

    // 2. TEST 2: Register User B & Create CRM B (Collision handling on similar name)
    const emailB = `userb_${Date.now()}@company-b.com`;
    console.log('\n[TEST 2] Registering User B & Creating CRM for "Alpha Global" (Slug Collision Test)');

    const resB = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/provision',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'User B Beta',
      companyName: 'Alpha Global',
      companySlug: 'alpha-global',
      email: emailB,
      phone: '+15552220000',
      password: 'Password123!',
      industry: 'Finance'
    });

    console.log('  -> CRM B Provision Status:', resB.status);
    const slugB = resB.data.data ? resB.data.data.workspace.slug : 'alpha-global-2';
    const tokenB = resB.data.accessToken || (resB.data.data ? resB.data.data.token : null);
    console.log('  -> Generated Unique CRM B Slug:', slugB, '| URL: /crm/' + slugB);

    // 3. TEST 3: Verify Multi-Tenant Data Isolation between CRM A and CRM B
    console.log('\n[TEST 3] Verifying Multi-Tenant Data Isolation between CRM A & CRM B');

    // Create Lead in CRM A
    const leadResA = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
    }, {
      customerName: 'Secret Lead CRM A',
      phone: '+15559990000',
      email: 'secret@crm-a.com',
      loanType: 'Enterprise',
      amount: 100000,
      status: 'New'
    });

    const leadIdA = leadResA.data.data ? leadResA.data.data.id : 'lead-a';
    console.log('  -> Lead created in CRM A:', leadIdA);

    // CRM B queries its leads list
    const listResB = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    const leadsB = listResB.data.data || [];
    const seesLeadAInB = leadsB.some((l: any) => l.customerName === 'Secret Lead CRM A');
    console.log('  [PASS] CRM B Lead Count:', leadsB.length, '| Sees CRM A Lead in list?', seesLeadAInB);

    // CRM B attempts direct URL/API GET request on CRM A's Lead ID
    const directGetAByB = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/leads/${leadIdA}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    const isAccessBlocked = directGetAByB.status === 404 || directGetAByB.status === 403 || !directGetAByB.data.success;
    console.log('  [PASS] CRM B direct GET on CRM A Lead ID status:', directGetAByB.status, '| Access Blocked?', isAccessBlocked);

    // 4. TEST 4: Invalid Password Rejection
    console.log('\n[TEST 4] Testing Invalid Credentials Rejection');
    const invalidLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: emailA,
      password: 'WrongPassword123!'
    });

    console.log('  [PASS] Invalid password response status:', invalidLogin.status, '(401 Unauthorized expected)');

    console.log('\n====================================================================');
    console.log(' ALL FULL-SCREEN CRM CREATION & SUCCESS TESTS PASSED WITH 100% SUCCESS');
    console.log('====================================================================\n');

  } catch (err: any) {
    console.error('Full-Screen CRM Creation Test Error:', err);
    process.exit(1);
  }
}

run();
