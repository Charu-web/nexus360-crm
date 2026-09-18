const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== LISTING ALL ROUTES REGISTERED IN FD() ===');

const fdIdx = code.indexOf('function FD()');
const fdCode = code.substring(fdIdx);

const pathMatches = [...fdCode.matchAll(/path:"([^"]+)"/g)];
console.log('Total path matches in FD():', pathMatches.length);
pathMatches.forEach((m, i) => {
  console.log(`${i + 1}. path: "${m[1]}"`);
});
