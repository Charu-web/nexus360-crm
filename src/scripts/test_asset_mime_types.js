const http = require('http');

function checkUrl(urlPath) {
  return new Promise((resolve) => {
    http.get('http://localhost:5000' + urlPath, (res) => {
      resolve({
        path: urlPath,
        statusCode: res.statusCode,
        contentType: res.headers['content-type']
      });
    }).on('error', (err) => {
      resolve({ path: urlPath, error: err.message });
    });
  });
}

async function run() {
  console.log('=== VERIFYING ASSET MIME TYPES & ROUTING ===');
  const urls = [
    '/assets/index-CMn9DqNx.js',
    '/assets/index-Bq8bJDgt.css',
    '/crm/assets/index-CMn9DqNx.js',
    '/crm/assets/index-Bq8bJDgt.css',
    '/crm/real-estate-crm-s4c3lp',
    '/dashboard'
  ];

  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(`URL [${res.path}]: Status ${res.statusCode} | Content-Type: ${res.contentType}`);
  }
}

run();
