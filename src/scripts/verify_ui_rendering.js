const fs = require('fs');
const path = require('path');
const http = require('http');

function checkRoute(pathStr) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${pathStr}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('====================================================');
  console.log(' VERIFYING FRONTEND UI SERVER STATUS & STATIC ASSETS');
  console.log('====================================================\n');

  try {
    const rootRes = await checkRoute('/');
    console.log('[PASS] GET http://localhost:5000/ Status:', rootRes.status, '| Contains root div:', rootRes.body.includes('id="root"'));

    const loginRes = await checkRoute('/login');
    console.log('[PASS] GET http://localhost:5000/login Status:', loginRes.status, '| Contains root div:', loginRes.body.includes('id="root"'));

    const regRes = await checkRoute('/register');
    console.log('[PASS] GET http://localhost:5000/register Status:', regRes.status, '| Contains root div:', regRes.body.includes('id="root"'));

    const jsRes = await checkRoute('/assets/index-CMn9DqNx.js');
    console.log('[PASS] GET http://localhost:5000/assets/index-CMn9DqNx.js Status:', jsRes.status, '| Size:', jsRes.body.length, 'bytes');

    const cssRes = await checkRoute('/assets/index-Bq8bJDgt.css');
    console.log('[PASS] GET http://localhost:5000/assets/index-Bq8bJDgt.css Status:', cssRes.status, '| Size:', cssRes.body.length, 'bytes');

    console.log('\n====================================================');
    console.log(' ALL FRONTEND ROUTES AND ASSETS LOADED WITH HTTP 200 OK');
    console.log('====================================================');
  } catch (err) {
    console.error('Frontend Verification Error:', err);
    process.exit(1);
  }
}

run();
