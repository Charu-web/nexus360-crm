const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('Cleaning up extra injected declarations at end of file...');

const idx = code.indexOf('const rx=rt.lazy');
console.log('const rx=rt.lazy at char:', idx);

if (idx !== -1) {
  // Find where FD function starts (function FD)
  const fdIdx = code.indexOf('function FD()', idx);
  console.log('function FD() after const rx at char:', fdIdx);
  if (fdIdx !== -1) {
    code = code.substring(0, idx) + code.substring(fdIdx);
    fs.writeFileSync(bundlePath, code, 'utf8');
    console.log('[SUCCESS] Successfully removed injected lazy declarations snippet!');
  }
}
