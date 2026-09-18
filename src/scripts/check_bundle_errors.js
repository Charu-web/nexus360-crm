const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');

console.log('Checking syntax of assets/index-CMn9DqNx.js...');
try {
  const code = fs.readFileSync(bundlePath, 'utf8');
  new vm.Script(code);
  console.log('[SUCCESS] assets/index-CMn9DqNx.js syntax is valid JS!');
} catch (err) {
  console.error('[ERROR] assets/index-CMn9DqNx.js syntax error:', err.message);
}

console.log('Checking syntax of assets/Settings-DcmRBp2d.js...');
try {
  const code = fs.readFileSync(settingsPath, 'utf8');
  new vm.Script(code);
  console.log('[SUCCESS] assets/Settings-DcmRBp2d.js syntax is valid JS!');
} catch (err) {
  console.error('[ERROR] assets/Settings-DcmRBp2d.js syntax error:', err.message);
}
