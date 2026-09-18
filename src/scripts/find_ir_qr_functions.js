const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const irIdx = code.indexOf('IR=');
console.log('IR= found at:', irIdx);
if (irIdx !== -1) console.log(code.substring(irIdx - 50, irIdx + 500));

const qrIdx = code.indexOf('QR=');
console.log('QR= found at:', qrIdx);
if (qrIdx !== -1) console.log(code.substring(qrIdx - 50, qrIdx + 500));
