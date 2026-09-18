const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lines = code.split('\n');
console.log('Total lines in index-CMn9DqNx.js:', lines.length);

if (lines.length >= 465) {
  console.log('Lines 465 to 470:');
  for (let i = 464; i < Math.min(lines.length, 471); i++) {
    console.log(`Line ${i + 1}: ${lines[i].substring(0, 300)}`);
  }
}
