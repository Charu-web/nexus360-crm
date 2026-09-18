import { createClient } from '@supabase/supabase-js';

// Handle SSL certificate validation in local environment if custom CA is used
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = 'https://ziminzbtutibtbbbqwha.supabase.co';
const supabaseKey = 'sb_publishable_7pbvLFcKp2JVf5811QEEcQ_01Dgzs_d';

const client = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase Client query with TLS override...');
  const { data, error, status } = await client.from('tenants').select('id');
  console.log('Status:', status);
  console.log('Error:', error);
  console.log('Data:', data);
}

test().catch(console.error);
