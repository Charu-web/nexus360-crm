const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING FRONTEND LOGIN COMPONENT IN BUNDLE ===');

const rOIdx = code.indexOf('function rO(');
console.log('function rO( found at index:', rOIdx);

if (rOIdx !== -1) {
  console.log('rO component snippet:');
  console.log(code.substring(rOIdx, rOIdx + 1500));
}
