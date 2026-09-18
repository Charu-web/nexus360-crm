const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/_\.Suspense/g)];
console.log('Matches for _.Suspense in index-CMn9DqNx.js:', matches.length);

const idx = code.indexOf('_.Suspense');
if (idx !== -1) {
  console.log('Snippet around _.Suspense:');
  console.log(code.substring(idx - 100, idx + 200));
}
