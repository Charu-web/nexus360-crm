const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== DEBUGGING DASHBOARD BLANK PAGE ===');

// Check FD router in index-CMn9DqNx.js
const fdIdx = code.indexOf('function FD()');
console.log('function FD() found:', fdIdx !== -1);
if (fdIdx !== -1) {
  const fdEnd = code.indexOf('}bA.createRoot', fdIdx);
  console.log('FD Router code:');
  console.log(code.substring(fdIdx, fdEnd));
}
