const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('End of index-CMn9DqNx.js (last 1000 characters):');
console.log(code.substring(code.length - 1000));
