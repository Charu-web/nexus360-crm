const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const ilIndex = code.indexOf('function Il()');
console.log('function Il() found:', ilIndex !== -1);
if (ilIndex !== -1) {
  console.log(code.substring(ilIndex - 50, ilIndex + 1200));
}
