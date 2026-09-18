const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/_\.lazy/g)];
console.log('Matches for _.lazy in index-CMn9DqNx.js:', matches.length);

if (matches.length > 0) {
  code = code.replace(/_\.lazy/g, 'rt.lazy');
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced all _.lazy with rt.lazy in index-CMn9DqNx.js!');
} else {
  console.log('No _.lazy found.');
}
