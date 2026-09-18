const BASE_URL = 'http://localhost:5000';

async function testAdminLoginFlow() {
  console.log('====================================================');
  console.log('  TESTING ADMIN LOGIN FLOW & ERROR HANDLING          ');
  console.log('====================================================');

  // 1. TEST: GET /api/admin/auth/login (Wrong HTTP Method)
  console.log('\n[TEST 1] GET /api/admin/auth/login (Wrong Method)...');
  const res1 = await fetch(`${BASE_URL}/api/admin/auth/login`);
  const data1 = await res1.json() as any;
  console.log(`   Status: ${res1.status} (Expected: 405)`);
  console.log(`   Message: ${data1.message}`);
  if (res1.status !== 405) throw new Error('Expected status 405 for GET request');

  // 2. TEST: POST /api/admin/auth/login (Empty Fields)
  console.log('\n[TEST 2] POST /api/admin/auth/login (Empty Email & Password)...');
  const res2 = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  const data2 = await res2.json() as any;
  console.log(`   Status: ${res2.status} (Expected: 400)`);
  console.log(`   Message: ${data2.message}`);
  if (res2.status !== 400) throw new Error('Expected status 400 for empty fields');

  // 3. TEST: POST /api/admin/auth/login (Invalid Password)
  console.log('\n[TEST 3] POST /api/admin/auth/login (Invalid Password)...');
  const res3 = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@empirecrm.io', password: 'WrongPassword123!' }),
  });
  const data3 = await res3.json() as any;
  console.log(`   Status: ${res3.status} (Expected: 401)`);
  console.log(`   Message: ${data3.message}`);
  if (res3.status !== 401) throw new Error('Expected status 401 for invalid credentials');

  // 4. TEST: POST /api/admin/auth/login (Valid Admin Credentials)
  console.log('\n[TEST 4] POST /api/admin/auth/login (Valid Admin Credentials)...');
  const res4 = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@empirecrm.io', password: 'AdminPassword123!' }),
  });
  const data4 = await res4.json() as any;
  console.log(`   Status: ${res4.status} (Expected: 200)`);
  console.log(`   User: ${data4.user?.email || 'N/A'} (Role: ${data4.user?.role?.name || 'N/A'})`);
  console.log(`   Has Access Token: ${Boolean(data4.accessToken)}`);
  if (res4.status !== 200 || !data4.accessToken) throw new Error('Expected status 200 & accessToken for valid credentials');

  const token = data4.accessToken;

  // 5. TEST: GET /api/admin/auth/me (Protected Admin Profile Route with Token)
  console.log('\n[TEST 5] GET /api/admin/auth/me (Authenticated Session Profile)...');
  const res5 = await fetch(`${BASE_URL}/api/admin/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data5 = await res5.json() as any;
  console.log(`   Status: ${res5.status} (Expected: 200)`);
  console.log(`   Profile Email: ${data5.user?.email}`);
  if (res5.status !== 200) throw new Error('Expected status 200 for protected route');

  // 6. TEST: GET /api/admin/auth/me (Protected Admin Profile Route WITHOUT Token)
  console.log('\n[TEST 6] GET /api/admin/auth/me (Unauthenticated Access Attempt)...');
  const res6 = await fetch(`${BASE_URL}/api/admin/auth/me`);
  const data6 = await res6.json() as any;
  console.log(`   Status: ${res6.status} (Expected: 401)`);
  console.log(`   Message: ${data6.message}`);
  if (res6.status !== 401) throw new Error('Expected status 401 for unauthenticated request');

  // 7. TEST: POST /api/admin/auth/logout (Admin Logout)
  console.log('\n[TEST 7] POST /api/admin/auth/logout (Logout)...');
  const res7 = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data7 = await res7.json() as any;
  console.log(`   Status: ${res7.status} (Expected: 200)`);
  console.log(`   Message: ${data7.message}`);
  if (res7.status !== 200) throw new Error('Expected status 200 for logout');

  console.log('\n====================================================');
  console.log('  ALL ADMIN LOGIN FLOW TESTS PASSED SUCCESSFULLY!   ');
  console.log('====================================================');
  process.exit(0);
}

testAdminLoginFlow().catch(err => {
  console.error('Admin Login Flow Test Failed:', err);
  process.exit(1);
});
