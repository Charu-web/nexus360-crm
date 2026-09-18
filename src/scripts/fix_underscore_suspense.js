const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

if (code.includes('_.Suspense')) {
  code = code.replace(/_\.Suspense/g, 'rt.Suspense');
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced _.Suspense with rt.Suspense in index-CMn9DqNx.js!');
} else {
  console.log('_.Suspense was not found in index-CMn9DqNx.js');
}
