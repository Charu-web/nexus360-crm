const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('=== TEST 1: FETCHING INDEX HTML & JS FROM LOCAL SERVER (PORT 3000 & 5000) ===');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const html3000 = await fetchUrl('http://localhost:3000/');
    console.log('Port 3000 HTML Status:', html3000.statusCode);
    console.log('Port 3000 HTML Content-Type:', html3000.headers['content-type']);
    console.log('Port 3000 HTML First 200 chars:\n', html3000.body.substring(0, 200));

    const jsUrl = 'http://localhost:3000/assets/index-CMn9DqNx.js';
    const jsRes = await fetchUrl(jsUrl);
    console.log('\nJS Asset Status:', jsRes.statusCode);
    console.log('JS Asset Content-Type:', jsRes.headers['content-type']);
    console.log('JS Asset Length:', jsRes.body.length);

    console.log('\n=== TEST 2: EVALUATING JS BUNDLE IN NODE TO FIND COMPILATION / RUNTIME EXCEPTION ===');
    const bundleCode = jsRes.body;
    
    // Test parsing with Function constructor or VM module
    const vm = require('vm');
    const sandbox = {
      window: {
        location: { href: 'http://localhost:3000/', pathname: '/', search: '', hash: '', origin: 'http://localhost:3000' },
        navigator: { userAgent: 'node' },
        addEventListener: () => {},
        removeEventListener: () => {},
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        document: {
          createElement: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {} }),
          querySelector: () => null,
          querySelectorAll: () => [],
          getElementById: () => ({ appendChild: () => {} }),
          head: { appendChild: () => {} },
          body: { appendChild: () => {} }
        }
      },
      document: {
        createElement: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {} }),
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: () => ({ appendChild: () => {} }),
        head: { appendChild: () => {} },
        body: { appendChild: () => {} }
      },
      navigator: { userAgent: 'node' },
      console: { log: console.log, error: console.error, warn: console.warn, info: console.info },
      setTimeout, clearTimeout, setInterval, clearInterval,
      process: { env: { NODE_ENV: 'production' } }
    };
    sandbox.window.window = sandbox.window;
    sandbox.global = sandbox;
    sandbox.self = sandbox.window;

    vm.createContext(sandbox);
    
    try {
      vm.runInContext(bundleCode, sandbox);
      console.log('Bundle executed in VM without top-level syntax/runtime crash!');
    } catch (vmErr) {
      console.error('\n!!! EXACT FIRST RUNTIME ERROR IN JS BUNDLE !!!');
      console.error('Error Message:', vmErr.message);
      console.error('Error Stack:\n', vmErr.stack);
    }

  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
