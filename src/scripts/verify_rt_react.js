const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const rtIndex = code.indexOf('const rt=cx(_)');
console.log('Found rt definition at:', rtIndex);
console.log(code.substring(rtIndex - 50, rtIndex + 300));
