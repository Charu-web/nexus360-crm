const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING AuthContext AND Il() IN BUNDLE ===');

const ilIdx = code.indexOf('function Il(');
console.log('function Il( at index:', ilIdx);
if (ilIdx !== -1) {
  console.log(code.substring(ilIdx, ilIdx + 400));
}

// Search for login method inside AuthContext provider
const loginMethodIdx = code.indexOf('const login=async');
if (loginMethodIdx !== -1) {
  console.log('login method at index:', loginMethodIdx);
  console.log(code.substring(loginMethodIdx, loginMethodIdx + 800));
} else {
  const loginFnIdx = code.indexOf('login:async');
  console.log('login:async at index:', loginFnIdx);
  if (loginFnIdx !== -1) {
    console.log(code.substring(loginFnIdx - 100, loginFnIdx + 800));
  }
}
