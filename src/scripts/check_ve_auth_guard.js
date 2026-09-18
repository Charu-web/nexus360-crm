const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const veIdx = code.indexOf('function ve(');
console.log('function ve( found at:', veIdx);
if (veIdx !== -1) {
  console.log(code.substring(veIdx, veIdx + 600));
}
