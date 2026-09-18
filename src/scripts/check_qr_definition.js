const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const qrIdx = code.indexOf('const QR=');
console.log('const QR= found at index:', qrIdx);
if (qrIdx !== -1) {
  console.log(code.substring(qrIdx, qrIdx + 500));
}
