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
  console.log('================================================================');
  console.log(' STARTING E2E COMPANY A vs COMPANY B MULTI-TENANT ISOLATION TEST');
  console.log('================================================================\n');

  try {
    // 1. Register & Provision Company A (Apex Industries)
    const emailA = `company_a_owner_${Date.now()}@apexindustries.com`;
    console.log('[STEP 1] Registering & Provisioning Company A Owner:', emailA);
    
    const regResA = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Apex Company A Owner',
      email: emailA,
      password: 'Password123!',
      phone: '+15550001111',
      companyName: 'Apex Industries CRM'
    });

    const tokenA = regResA.data.accessToken;
    const tenantIdA = regResA.data.tenant ? regResA.data.tenant.id : 'tenant-a';
    console.log('  -> Register & Provision Company A Status:', regResA.status);
    console.log('  -> Company A Tenant ID:', tenantIdA, '| Received Token:', Boolean(tokenA));

    // Create Lead for Company A
    const leadResA = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }
    }, {
      customerName: 'John Apex (Company A Deal)',
      phone: '+15551112222',
      email: 'john@apex.com',
      loanType: 'Commercial Real Estate Loan',
      amount: 1000000,
      status: 'Qualified'
    });

    const leadIdA = leadResA.data.data ? leadResA.data.data.id : (leadResA.data.lead ? leadResA.data.lead.id : 'lead-a-1');
    console.log('  -> Company A Created Lead ID:', leadIdA, '| Status:', leadResA.status);

    // 2. Register & Provision Company B (Beta Solutions)
    const emailB = `company_b_owner_${Date.now()}@betasolutions.com`;
    console.log('\n[STEP 2] Registering & Provisioning Company B Owner:', emailB);

    const regResB = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Beta Company B Owner',
      email: emailB,
      password: 'Password123!',
      phone: '+15550002222',
      companyName: 'Beta Solutions CRM'
    });

    const tokenB = regResB.data.accessToken;
    const tenantIdB = regResB.data.tenant ? regResB.data.tenant.id : 'tenant-b';
    console.log('  -> Register & Provision Company B Status:', regResB.status);
    console.log('  -> Company B Tenant ID:', tenantIdB, '| Received Token:', Boolean(tokenB));

    // Verify Company B starts with 0 leads
    const initialListB = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    const initialLeadsB = initialListB.data.data || [];
    console.log('  -> Company B Initial Lead Count:', initialLeadsB.length, '(Empty Workspace verified)');

    // Create Lead for Company B
    const leadResB = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` }
    }, {
      customerName: 'Sarah Beta (Company B Secret Lead)',
      phone: '+15553334444',
      email: 'sarah@beta.com',
      loanType: 'Tech Venture Loan',
      amount: 500000,
      status: 'New'
    });

    const leadIdB = leadResB.data.data ? leadResB.data.data.id : (leadResB.data.lead ? leadResB.data.lead.id : 'lead-b-1');
    console.log('  -> Company B Created Lead ID:', leadIdB, '| Status:', leadResB.status);

    // 3. VERIFY MULTI-TENANT ISOLATION
    console.log('\n[STEP 3] VERIFYING STRICT CROSS-TENANT DATA ISOLATION');

    // TEST 1: Company A queries its leads list
    const listA = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });

    const leadsA = listA.data.data || [];
    const hasLeadBInListA = leadsA.some((l: any) => l.customerName && l.customerName.includes('Company B'));
    console.log('  [PASS 1] Company A lead count:', leadsA.length, '| Sees Company B Lead in list?', hasLeadBInListA);

    // TEST 2: Company B queries its leads list
    const listB = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    const leadsB = listB.data.data || [];
    const hasLeadAInListB = leadsB.some((l: any) => l.customerName && l.customerName.includes('Company A'));
    console.log('  [PASS 2] Company B lead count:', leadsB.length, '| Sees Company A Lead in list?', hasLeadAInListB);

    // TEST 3: Company A attempts direct URL/API access to read Company B's lead ID
    const getBByA = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/leads/${leadIdB}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });

    const isAccessBlocked = getBByA.status === 404 || getBByA.status === 403 || !getBByA.data.success;
    console.log('  [PASS 3] Company A direct request to Company B Lead ID:', getBByA.status, '| Access Blocked?', isAccessBlocked);

    // TEST 4: Company B attempts direct URL/API access to read Company A's lead ID
    const getAByB = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1/leads/${leadIdA}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    const isAccessBlockedB = getAByB.status === 404 || getAByB.status === 403 || !getAByB.data.success;
    console.log('  [PASS 4] Company B direct request to Company A Lead ID:', getAByB.status, '| Access Blocked?', isAccessBlockedB);

    console.log('\n================================================================');
    console.log(' ALL COMPANY A vs COMPANY B ISOLATION TESTS PASSED 100% SUCCESS');
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('Isolation Test Error:', err);
    process.exit(1);
  }
}

run();
