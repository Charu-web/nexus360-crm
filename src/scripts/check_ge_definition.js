const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const geIdx = code.indexOf('function ge(');
console.log('function ge( at:', geIdx);
if (geIdx !== -1) {
  console.log(code.substring(geIdx, geIdx + 800));
}
