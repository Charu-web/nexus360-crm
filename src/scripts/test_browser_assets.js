const fs = require('fs');
const http = require('http');

function testFetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const rootRes = await testFetch('http://localhost:5000/');
    console.log('GET / -> Status:', rootRes.status);
    console.log('HTML length:', rootRes.body.length);

    // Extract script src
    const match = rootRes.body.match(/src=["']([^"']+)["']/);
    console.log('Script src in index.html:', match ? match[1] : 'NONE');

    if (match) {
      let scriptUrl = match[1];
      if (scriptUrl.startsWith('.')) scriptUrl = scriptUrl.substring(1);
      if (!scriptUrl.startsWith('/')) scriptUrl = '/' + scriptUrl;

      const scriptRes = await testFetch('http://localhost:5000' + scriptUrl);
      console.log('GET', scriptUrl, '-> Status:', scriptRes.status, 'Content-Type:', scriptRes.headers['content-type'], 'Size:', scriptRes.body.length);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

run();
