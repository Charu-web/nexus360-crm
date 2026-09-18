const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('Total lines:', lines.length);
console.log('Line 1581:', lines[1580]);
if (lines[1579]) console.log('Line 1580:', lines[1579]);
if (lines[1581]) console.log('Line 1582:', lines[1581]);
