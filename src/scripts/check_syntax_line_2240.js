const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lines = code.split('\n');
console.log('Total lines in index-CMn9DqNx.js:', lines.length);

if (lines.length >= 2235) {
  console.log('Lines 2235 to 2245:');
  for (let i = 2234; i < Math.min(lines.length, 2245); i++) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}
