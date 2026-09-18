const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FORMATTING FD FUNCTION TO SINGLE LINE ===');

const fdStart = code.indexOf('function FD()');
if (fdStart !== -1) {
  const bAStart = code.indexOf('bA.createRoot', fdStart);
  if (bAStart !== -1) {
    let fdCode = code.substring(fdStart, bAStart);
    fdCode = fdCode.replace(/\n/g, '');
    code = code.substring(0, fdStart) + fdCode + code.substring(bAStart);
    fs.writeFileSync(bundlePath, code, 'utf8');
    console.log('[SUCCESS] Reformatted FD function to single line!');
  }
}
