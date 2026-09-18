const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const q3Idx = code.indexOf('Q3=async');
console.log(code.substring(q3Idx, q3Idx + 600));
