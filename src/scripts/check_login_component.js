const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING LOGIN COMPONENT rO ===');

const rOIdx = code.indexOf('function rO(');
if (rOIdx !== -1) {
  const rOCode = code.substring(rOIdx, rOIdx + 800);
  console.log(rOCode);
} else {
  console.log('function rO( not found, searching rO definition...');
  const rODef = code.indexOf('rO=');
  if (rODef !== -1) {
    console.log(code.substring(rODef, rODef + 800));
  }
}
