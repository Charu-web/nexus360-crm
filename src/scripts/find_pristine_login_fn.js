const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const loginUrlIdx = code.indexOf('/auth/login');
console.log('/auth/login found at:', loginUrlIdx);
if (loginUrlIdx !== -1) {
  console.log(code.substring(loginUrlIdx - 150, loginUrlIdx + 300));
}
