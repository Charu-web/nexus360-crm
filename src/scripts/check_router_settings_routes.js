const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const fdIdx = code.indexOf('function FD()');
const fdCode = code.substring(fdIdx, fdIdx + 3000);

const matches = [...fdCode.matchAll(/path\s*:\s*"\/settings[^\"]*"/g)];
console.log('Routes in FD() starting with /settings:', matches.map(m => m[0]));
