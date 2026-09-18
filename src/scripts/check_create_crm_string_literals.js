const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING CreateCrmComponent STRING LITERALS ===');
const fnIdx = code.indexOf('function CreateCrmComponent()');
if (fnIdx !== -1) {
  const fnCode = code.substring(fnIdx);
  console.log(fnCode);
}
