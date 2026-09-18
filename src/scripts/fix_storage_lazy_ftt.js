const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-Ftt5f73P.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('Inspecting assets/index-Ftt5f73P.js for storage_lazy...');

const idx = code.indexOf('storage_lazy');
console.log('storage_lazy index in index-Ftt5f73P.js:', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 100, idx + 200));
}

// Replace storage_lazy with AD (Dashboard component)
code = code.replace(/storage_lazy/g, 'AD');
fs.writeFileSync(bundlePath, code, 'utf8');
console.log('[SUCCESS] Replaced all storage_lazy in assets/index-Ftt5f73P.js with AD!');
