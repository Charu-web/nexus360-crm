const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const sidebarIdx = code.indexOf('function _D(');
console.log('function _D() found at:', sidebarIdx);
if (sidebarIdx !== -1) {
  console.log(code.substring(sidebarIdx, sidebarIdx + 1500));
}
