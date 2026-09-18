const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lazyIdx = code.indexOf('_.lazy');
console.log('_.lazy in index-CMn9DqNx.js:', lazyIdx !== -1);
if (lazyIdx !== -1) {
  console.log('Snippet around _.lazy:');
  console.log(code.substring(lazyIdx - 50, lazyIdx + 400));
}
