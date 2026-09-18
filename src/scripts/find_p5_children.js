const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const fdIdx = code.indexOf('function FD()');
console.log(code.substring(fdIdx, fdIdx + 300));
