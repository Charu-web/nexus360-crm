const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== VALIDATING INDEX BUNDLE VM PARSE ===');

try {
  new vm.Script(code);
  console.log('Full bundle VM script compiled with ZERO syntax errors!');
} catch (err) {
  console.error('BUNDLE SYNTAX ERROR DETECTED:', err.message);
}
