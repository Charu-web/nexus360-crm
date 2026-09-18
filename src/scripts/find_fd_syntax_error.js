const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const fdIdx = code.indexOf('function FD()');
console.log('FD index:', fdIdx);
const fdCode = code.substring(fdIdx);

try {
  new Function(fdCode);
  console.log('FD code evaluates with NO syntax error!');
} catch (e) {
  console.log('FD syntax error:', e.message);
  // Test substrings to pinpoint
  for (let len = 500; len < fdCode.length; len += 500) {
    try {
      new Function(fdCode.substring(0, len) + '}}');
    } catch (err) {
      if (err.message.includes('Unexpected token')) {
        console.log(`Error around character ${len}:`, err.message);
        console.log(fdCode.substring(len - 200, len + 200));
        break;
      }
    }
  }
}
