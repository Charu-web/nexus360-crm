const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const elIdx = code.indexOf('const El=');
console.log('const El= found at index:', elIdx);
if (elIdx !== -1) {
  console.log(code.substring(elIdx, elIdx + 400));
}
