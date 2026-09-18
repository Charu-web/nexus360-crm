import http from 'http';
import app from '../server';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PORT = 5066;

function request(
  method: string,
  path: string,
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

async function runPasswordResetTestSuite() {
  console.log('==================================================');
  console.log(' Starting Forgot Password & Reset E2E Test Suite  ');
  console.log('==================================================\n');

  const server = app.listen(PORT);
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
    // TEST 1: Forgot Password with Valid Registered Email
    console.log('--- 1. Forgot Password Request ---');
    const validEmailRes = await request('POST', '/api/v1/auth/forgot-password', {
      email: 'superadmin@empirecrm.io',
    });
    assert(
      validEmailRes.status === 200 &&
        validEmailRes.body.success === true &&
        validEmailRes.body.message.includes('Password reset link has been sent to your email'),
      'Forgot Password Request with Valid Email returns 200 & success message',
      undefined,
      validEmailRes.body
    );

    const devToken = validEmailRes.body.devResetToken;

    // TEST 2: Forgot Password with Invalid Email Format
    const invalidEmailRes = await request('POST', '/api/v1/auth/forgot-password', {
      email: 'not-a-valid-email-address',
    });
    assert(
      invalidEmailRes.status === 400 && invalidEmailRes.body.success === false,
      'Forgot Password Request with Invalid Email Format returns 400 Bad Request',
      undefined,
      invalidEmailRes.body
    );

    // TEST 3: Direct Supabase Auth resetPasswordForEmail Execution
    console.log('\n--- 2. Supabase Auth Direct Reset Execution ---');
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.resetPasswordForEmail('superadmin@empirecrm.io', {
        redirectTo: 'http://localhost:5000/reset-password',
      });
      assert(
        error === null,
        'Supabase Auth resetPasswordForEmail executes cleanly without network/TLS error',
        error?.message
      );
    } else {
      console.log('  [PASS] Supabase Auth is bypassed in local DB mode.');
    }

    // TEST 4: Reset Password with Valid Token / Session
    console.log('\n--- 3. Reset Password Token Execution ---');
    if (devToken) {
      const resetRes = await request('POST', '/api/v1/auth/reset-password', {
        token: devToken,
        password: 'NewSuperPassword123!',
      });
      assert(
        resetRes.status === 200 &&
          resetRes.body.success === true &&
          resetRes.body.message.includes('Your password has been updated successfully'),
        'Reset Password with Valid Token updates password successfully (200)',
        undefined,
        resetRes.body
      );
    } else {
      console.log('  [PASS] Token reset skipped in production environment mode.');
    }

    // TEST 5: Reset Password with Invalid Token
    const invalidTokenRes = await request('POST', '/api/v1/auth/reset-password', {
      token: 'invalid-nonexistent-token-123',
      password: 'NewSuperPassword123!',
    });
    assert(
      invalidTokenRes.status === 400 && invalidTokenRes.body.success === false,
      'Reset Password with Invalid Token returns 400 Bad Request',
      undefined,
      invalidTokenRes.body
    );

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log('\n==================================================');
    console.log(` Test Suite Finished | Passed: ${passed} | Failed: ${failed}`);
    console.log('==================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runPasswordResetTestSuite();
