const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== ADDING /settings/general ROUTE TO FD ROUTER ===');

const targetStr = 'd.jsx(oe,{path:"/settings",';
const replacementStr = 'd.jsx(oe,{path:"/settings/general",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings",';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Added /settings/general route to FD router!');
} else {
  console.log('Target string not found in bundle.');
}
