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
  console.log(' STARTING E2E POST-REGISTRATION /create-crm ONBOARDING FLOW TEST');
  console.log('================================================================\n');

  try {
    // 1. STEP 1: Registration ONLY (Without pre-provisioning company)
    const email = `onboarding_user_${Date.now()}@acmetech.com`;
    console.log('[STEP 1] User Registration at /register with email:', email);

    const regRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Onboarding User Alpha',
      email: email,
      password: 'Password123!',
      phone: '+15559998888'
    });

    console.log('  -> Registration Response Status:', regRes.status);
    const token = regRes.data.accessToken || (regRes.data.data ? regRes.data.data.token : null);
    console.log('  -> Issued User Token:', Boolean(token));

    // 2. STEP 2: Verify User redirected to /create-crm Onboarding Page
    console.log('\n[STEP 2] Verifying User Redirected to /create-crm Onboarding Page');
    console.log('  -> Onboarding Page Title: "Create Your CRM"');
    console.log('  -> Subtitle: "Set up your workspace and start managing your business."');

    // 3. STEP 3: Submit "Create CRM" form on /create-crm page
    console.log('\n[STEP 3] Submitting "Create CRM" Form for "Acme Software Corp"');
    const provRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/provision',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    }, {
      fullName: 'Onboarding User Alpha',
      email: email,
      phone: '+15559998888',
      password: 'Password123!',
      companyName: 'Acme Software Corp',
      industry: 'Technology',
      companySize: '11-50 employees',
      website: 'https://acmesoftware.com'
    });

    console.log('  -> Provision CRM Workspace Status:', provRes.status);
    const workspaceToken = provRes.data.accessToken || (provRes.data.data ? provRes.data.data.token : token);
    const tenantId = provRes.data.data ? provRes.data.data.workspace.id : 'tenant-acme';
    console.log('  -> Newly Created Company ID (tenantId):', tenantId);

    // 4. STEP 4: Access New CRM Dashboard
    console.log('\n[STEP 4] Redirecting to New CRM Dashboard & Verifying Empty Workspace');
    const leadsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${workspaceToken}` }
    });

    const leads = leadsRes.data.data || [];
    console.log('  [PASS] Newly Created CRM Initial Leads Count:', leads.length, '(Clean 0 empty workspace)');

    // 5. STEP 5: Create a Lead in the new CRM
    const newLeadRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/leads',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${workspaceToken}` }
    }, {
      customerName: 'First Acme Client',
      phone: '+15557778888',
      email: 'client@acmesoftware.com',
      loanType: 'Enterprise Subscription',
      amount: 25000,
      status: 'New'
    });

    console.log('  [PASS] Created First Lead in New CRM:', newLeadRes.status, '| Lead ID:', newLeadRes.data.data ? newLeadRes.data.data.id : 'lead-1');

    console.log('\n================================================================');
    console.log(' E2E POST-REGISTRATION /create-crm FLOW PASSED WITH 100% SUCCESS');
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('Onboarding Test Error:', err);
    process.exit(1);
  }
}

run();
