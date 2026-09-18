const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING ROUTER FOR ROOT ROUTER "/" MAPPING ===');

const fdIdx = code.indexOf('function FD()');
if (fdIdx !== -1) {
  const fdCode = code.substring(fdIdx, fdIdx + 1200);
  console.log(fdCode);
}
