const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== INSPECTING ROUTER FOR /create-crm AND /create-company ===');
console.log('Has /create-crm:', code.includes('/create-crm'));
console.log('Has /create-company:', code.includes('/create-company'));

const fdIdx = code.indexOf('function FD()');
if (fdIdx !== -1) {
  console.log(code.substring(fdIdx, fdIdx + 1500));
}
