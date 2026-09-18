const fs = require('fs');
const code = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// Verify Ze call pattern
const zeIdx = code.indexOf('Ze(()=>import(');
console.log('Ze call pattern found:', zeIdx !== -1);
if (zeIdx !== -1) {
  console.log('Ze usage:', code.substring(zeIdx, zeIdx + 200));
}

// Verify settings route
const settingsPresent = code.includes('/settings"');
console.log('Settings route in final bundle:', settingsPresent);

// Check the FD function
const fdIdx = code.indexOf('function FD()');
console.log('FD router:');
console.log(code.substring(fdIdx, fdIdx + 1000));
