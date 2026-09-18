const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const ilIdx = code.indexOf('function Il()');
console.log(code.substring(ilIdx, ilIdx + 600));
