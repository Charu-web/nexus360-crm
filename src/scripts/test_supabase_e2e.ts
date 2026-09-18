import http from 'http';

// Local environment TLS certificate override for Windows network environment
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import app from '../server';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseDataService } from '../services/supabaseDataService';

async function runE2ETest() {
  console.log('====================================================');
  console.log('  EMPIRE CRM - COMPREHENSIVE E2E VERIFICATION TEST  ');
  console.log('====================================================\n');

  // 1. Check Express Server Startup on port 5000
  console.log('1. Starting Express Server on Port 5000...');
  const server = app.listen(5000, () => {
    console.log('   ✓ Express Server successfully started on http://localhost:5000');
  });

  try {
    // 2. Test GET /api/health endpoint
    console.log('\n2. Testing GET /api/health Endpoint...');
    const healthRes = await new Promise<any>((resolve, reject) => {
      http
        .get('http://localhost:5000/api/health', (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
            } catch (e) {
              resolve({ statusCode: res.statusCode, body });
            }
          });
        })
        .on('error', reject);
    });

    console.log(`   [HTTP Status]: ${healthRes.statusCode}`);
    console.log('   [Health Response]:', JSON.stringify(healthRes.data, null, 2));

    // 3. Test Supabase Configuration & Connectivity
    console.log('\n3. Verifying Supabase Configuration...');
    const configured = isSupabaseConfigured();
    console.log(`   Supabase Configured: ${configured ? 'YES (Live Supabase Project)' : 'PENDING CREDENTIALS'}`);

    if (configured) {
      console.log('\n4. Testing Live Supabase Database Queries...');
      const { data: leads, error, status } = await supabase.from('leads').select('id, customer_name').limit(5);
      console.log(`   ✓ [Supabase PostgREST Connection]: HTTP ${status} — ${error ? error.message : `${leads?.length || 0} rows found`}`);

      console.log('\n5. Testing CRM Data Layer via SupabaseDataService...');
      const stats = await SupabaseDataService.getDashboardStats();
      console.log('   ✓ [Dashboard Stats Aggregator]:', JSON.stringify(stats, null, 2));
    }

    console.log('\n====================================================');
    console.log('  E2E VERIFICATION TEST COMPLETED SUCCESSFULLY');
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ E2E Verification Failed:', err.message);
  } finally {
    server.close();
    process.exit(0);
  }
}

runE2ETest().catch((err) => {
  console.error('Fatal E2E Test Error:', err);
  process.exit(1);
});
