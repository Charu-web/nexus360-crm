const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const fdIdx = code.indexOf('function FD()');
const fdCode = code.substring(fdIdx, fdIdx + 4000);

const matches = [...fdCode.matchAll(/path\s*:\s*"[^"]+"/g)];
console.log('All routes registered in FD():');
matches.forEach(m => console.log('  -', m[0]));
