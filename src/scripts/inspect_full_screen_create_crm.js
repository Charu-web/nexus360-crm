const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING CreateCrmComponent IN BUNDLE ===');

const cIdx = code.indexOf('function CreateCrmComponent()');
if (cIdx !== -1) {
  console.log(code.substring(cIdx, cIdx + 1500));
}
