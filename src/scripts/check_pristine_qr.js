const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const qrIdx = code.indexOf('QR=async');
console.log('QR=async found at:', qrIdx);
if (qrIdx !== -1) {
  console.log(code.substring(qrIdx, qrIdx + 400));
}
