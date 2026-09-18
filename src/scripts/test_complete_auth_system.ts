process.env.NODE_ENV = 'test';

import http from 'http';
import assert from 'assert';
import app from '../server';

const PORT = 5003;
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

async function runAuthSecurityTestSuite() {
  console.log('==================================================');
  console.log(' Starting Production CRM Authentication Test Suite ');
  console.log('==================================================\n');

  server = app.listen(PORT);
  let passedCount = 0;
  const ts = Date.now();

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check Endpoint
    // ----------------------------------------------------
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'UP', 'Health Check endpoint must return 200 UP');
    console.log('  [PASS 1/20] Health Check Endpoint');
    passedCount++;

    // ----------------------------------------------------
    // TEST 2: Valid Pre-Seeded Admin Sign In
    // ----------------------------------------------------
    const validLogin = await request('POST', '/api/v1/auth/login', {
      email: 'superadmin@empirecrm.io',
      password: 'SuperAdminPassword123!',
    });
    assert(
      validLogin.status === 200 &&
        validLogin.body.success === true &&
        typeof validLogin.body.accessToken === 'string' &&
        typeof validLogin.body.refreshToken === 'string',
      'Valid sign in generates accessToken and refreshToken'
    );
    const superAdminAccessToken = validLogin.body.accessToken;
    console.log('  [PASS 2/20] Valid Sign In & Access/Refresh Token Generation');
    passedCount++;

    // ----------------------------------------------------
    // TEST 3: Invalid Email Rejection
    // ----------------------------------------------------
    const invalidEmailLogin = await request('POST', '/api/v1/auth/login', {
      email: 'nonexistent.user@empirecrm.io',
      password: 'SuperAdminPassword123!',
    });
    assert(invalidEmailLogin.status === 401 && invalidEmailLogin.body.success === false, 'Invalid email returns 401');
    console.log('  [PASS 3/20] Invalid Email Rejection (401 Unauthorized)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 4: Invalid Password Rejection
    // ----------------------------------------------------
    const invalidPassLogin = await request('POST', '/api/v1/auth/login', {
      email: 'superadmin@empirecrm.io',
      password: 'WrongPassword999!',
    });
    assert(invalidPassLogin.status === 401 && invalidPassLogin.body.success === false, 'Invalid password returns 401');
    console.log('  [PASS 4/20] Invalid Password Rejection (401 Unauthorized)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 5: Empty Fields Validation
    // ----------------------------------------------------
    const emptyFieldsLogin = await request('POST', '/api/v1/auth/login', {
      email: '',
      password: '',
    });
    assert(emptyFieldsLogin.status === 400, 'Empty input fields return 400 Bad Request');
    console.log('  [PASS 5/20] Empty Fields & Zod Schema Validation (400 Bad Request)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 6: Multi-Step SaaS Registration
    // ----------------------------------------------------
    const regEmail = `auth.test.${ts}@cloudcorp.io`;
    const reg = await request('POST', '/api/v1/auth/register', {
      fullName: 'Cloud Owner',
      email: regEmail,
      phone: '+1 555-9988',
      password: 'CloudPassword123!',
      companyName: `Cloud Corp ${ts}`,
      industry: 'Cloud Computing',
      companySize: '10-50',
      template: 'Standard CRM',
    });
    assert(
      reg.status === 201 &&
        reg.body.success === true &&
        typeof reg.body.accessToken === 'string' &&
        reg.body.tenant.name.includes('Cloud Corp'),
      'Multi-step registration provisions Tenant + Admin User'
    );
    let cloudUserAccessToken = reg.body.accessToken;
    let cloudRefreshToken = reg.body.refreshToken;
    console.log('  [PASS 6/20] Multi-Step Registration (Tenant, Admin, Role, Pipeline, Subscription)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 7: Duplicate Email Rejection
    // ----------------------------------------------------
    const dupReg = await request('POST', '/api/v1/auth/register', {
      fullName: 'Duplicate User',
      email: regEmail,
      phone: '+1 555-9988',
      password: 'CloudPassword123!',
      companyName: `Duplicate Corp ${ts}`,
    });
    assert(dupReg.status === 409 && dupReg.body.success === false, 'Duplicate email returns 409 Conflict');
    console.log('  [PASS 7/20] Duplicate Email Rejection (409 Conflict)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 8: Forgot Password Privacy Generic Response
    // ----------------------------------------------------
    const forgotRes = await request('POST', '/api/v1/auth/forgot-password', {
      email: regEmail,
    });
    assert(
      forgotRes.status === 200 &&
        forgotRes.body.success === true &&
        forgotRes.body.message.includes('If an account exists'),
      'Forgot password returns privacy generic message'
    );
    const devResetToken = forgotRes.body.devResetToken;
    assert(typeof devResetToken === 'string', 'Development reset token generated');
    console.log('  [PASS 8/20] Forgot Password Privacy Preserving Response');
    passedCount++;

    // ----------------------------------------------------
    // TEST 9: Invalid Reset Token Rejection
    // ----------------------------------------------------
    const invalidReset = await request('POST', '/api/v1/auth/reset-password', {
      token: 'invalid_token_string_999999999',
      newPassword: 'BrandNewPassword123!',
    });
    assert(invalidReset.status === 400, 'Invalid reset token returns 400');
    console.log('  [PASS 9/20] Invalid Reset Token Rejection (400 Bad Request)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 10: Valid Password Reset Execution
    // ----------------------------------------------------
    const validReset = await request('POST', '/api/v1/auth/reset-password', {
      token: devResetToken,
      newPassword: 'BrandNewPassword123!',
    });
    assert(validReset.status === 200 && validReset.body.success === true, 'Password reset succeeds');
    console.log('  [PASS 10/20] Valid Password Reset Execution');
    passedCount++;

    // ----------------------------------------------------
    // TEST 11: Single-Use Reset Token Enforcement
    // ----------------------------------------------------
    const reUseReset = await request('POST', '/api/v1/auth/reset-password', {
      token: devResetToken,
      newPassword: 'AnotherPassword123!',
    });
    assert(reUseReset.status === 400, 'Re-using reset token fails');
    console.log('  [PASS 11/20] Single-Use Reset Token Invalidation');
    passedCount++;

    // ----------------------------------------------------
    // TEST 12: Sign In With New Reset Password
    // ----------------------------------------------------
    const newPassLogin = await request('POST', '/api/v1/auth/login', {
      email: regEmail,
      password: 'BrandNewPassword123!',
    });
    assert(newPassLogin.status === 200 && newPassLogin.body.success === true, 'Login with new password succeeds');
    cloudUserAccessToken = newPassLogin.body.accessToken;
    cloudRefreshToken = newPassLogin.body.refreshToken;
    console.log('  [PASS 12/20] Sign In With Updated Password');
    passedCount++;

    // ----------------------------------------------------
    // TEST 13: Change Password (Authenticated)
    // ----------------------------------------------------
    const changePass = await request(
      'POST',
      '/api/v1/auth/change-password',
      {
        currentPassword: 'BrandNewPassword123!',
        newPassword: 'FinalPassword123!',
      },
      { Authorization: `Bearer ${cloudUserAccessToken}` }
    );
    assert(changePass.status === 200 && changePass.body.success === true, 'Change password succeeds');
    console.log('  [PASS 13/20] Authenticated Change Password Endpoint');
    passedCount++;

    // ----------------------------------------------------
    // TEST 14: Token Refresh Endpoint
    // ----------------------------------------------------
    const refreshRes = await request('POST', '/api/v1/auth/refresh', {
      refreshToken: cloudRefreshToken,
    });
    assert(
      refreshRes.status === 200 &&
        refreshRes.body.success === true &&
        typeof refreshRes.body.accessToken === 'string',
      'Token refresh returns fresh access token'
    );
    console.log('  [PASS 14/20] JWT Access Token Refresh Endpoint');
    passedCount++;

    // ----------------------------------------------------
    // TEST 15: Logout Endpoint
    // ----------------------------------------------------
    const logoutRes = await request(
      'POST',
      '/api/v1/auth/logout',
      { refreshToken: cloudRefreshToken },
      { Authorization: `Bearer ${cloudUserAccessToken}` }
    );
    assert(logoutRes.status === 200 && logoutRes.body.success === true, 'Logout succeeds');
    console.log('  [PASS 15/20] Logout & Token Revocation Endpoint');
    passedCount++;

    // ----------------------------------------------------
    // TEST 16: Safe Authenticated User Profile (GET /api/v1/auth/me)
    // ----------------------------------------------------
    const meRes = await request('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${superAdminAccessToken}`,
    });
    assert(
      meRes.status === 200 &&
        meRes.body.user.email === 'superadmin@empirecrm.io' &&
        meRes.body.user.password === undefined,
      'GET /api/v1/auth/me returns safe profile without password hash'
    );
    console.log('  [PASS 16/20] Safe Profile Endpoint (GET /api/v1/auth/me - Password Hash Omitted)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 17: Session Status Endpoint (GET /api/v1/auth/session)
    // ----------------------------------------------------
    const sessionRes = await request('GET', '/api/v1/auth/session', null, {
      Authorization: `Bearer ${superAdminAccessToken}`,
    });
    assert(sessionRes.status === 200 && sessionRes.body.authenticated === true, 'Session check returns 200');
    console.log('  [PASS 17/20] Session Status Endpoint (GET /api/v1/auth/session)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 18: Unauthorized API Request Rejection
    // ----------------------------------------------------
    const unauthRes = await request('GET', '/api/v1/auth/me');
    assert(unauthRes.status === 401, 'Request without token returns 401 Unauthorized');
    console.log('  [PASS 18/20] Unauthorized API Request Rejection (401 Unauthorized)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 19: Suspended Workspace Login Blocking
    // ----------------------------------------------------
    const platformLogin = await request('POST', '/api/v1/platform/auth/login', {
      email: 'platform@empirecrm.io',
      password: 'PlatformPassword123!',
    });
    console.log('Platform login result:', platformLogin.status, platformLogin.body);

    const platformToken = platformLogin.body.accessToken;
    const cloudTenantId = reg.body.tenant.id;

    const suspendCall = await request('POST', `/api/v1/admin/tenants/${cloudTenantId}/suspend`, null, {
      Authorization: `Bearer ${platformToken}`,
    });
    console.log('Suspend call result:', suspendCall.status, suspendCall.body);

    const suspendedAttempt = await request('POST', '/api/v1/auth/login', {
      email: regEmail,
      password: 'FinalPassword123!',
    });
    console.log('Suspended attempt result:', suspendedAttempt.status, suspendedAttempt.body);

    assert(
      suspendedAttempt.status === 403 && suspendedAttempt.body.message.includes('suspended'),
      'Suspended workspace user login blocked (403 Forbidden)'
    );
    console.log('  [PASS 19/20] Suspended Workspace Login Blocking (403 Forbidden)');
    passedCount++;

    // ----------------------------------------------------
    // TEST 20: Reactivate Workspace & Final Verification
    // ----------------------------------------------------
    await request('POST', `/api/v1/admin/tenants/${cloudTenantId}/activate`, null, {
      Authorization: `Bearer ${platformToken}`,
    });

    const reactivatedLogin = await request('POST', '/api/v1/auth/login', {
      email: regEmail,
      password: 'FinalPassword123!',
    });
    assert(reactivatedLogin.status === 200 && reactivatedLogin.body.success === true, 'Reactivated login succeeds');
    console.log('  [PASS 20/20] Workspace Reactivation & Complete End-to-End Auth Verification');
    passedCount++;

    console.log('\n==================================================');
    console.log(` Test Suite Execution Finished `);
    console.log(` Total Passed: ${passedCount} / 20 | Total Failed: 0`);
    console.log('==================================================\n');
  } catch (error) {
    console.error('Test Suite Failed Error:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runAuthSecurityTestSuite();
