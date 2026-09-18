const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const idx = code.indexOf('function li(');
console.log('function li( at:', idx);
if (idx !== -1) {
  console.log(code.substring(idx, idx + 200));
}
