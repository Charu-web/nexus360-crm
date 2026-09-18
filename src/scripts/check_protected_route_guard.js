const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING PROTECTED ROUTE GUARD ve ===');

const veIdx = code.indexOf('function ve(');
if (veIdx !== -1) {
  const veCode = code.substring(veIdx, veIdx + 500);
  console.log(veCode);
}
