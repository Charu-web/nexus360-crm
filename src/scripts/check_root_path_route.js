const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const fdStart = code.indexOf('function FD()');
const fdCode = code.substring(fdStart);

console.log('Includes path:"/":', fdCode.includes('path:"/"'));
if (!fdCode.includes('path:"/"')) {
  console.log('path:"/" route is MISSING in FD()!');
}
