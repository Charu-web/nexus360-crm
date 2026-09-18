const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const lines = code.split('\n');
console.log('Total lines in index-CMn9DqNx.js:', lines.length);

if (lines.length >= 2640) {
  console.log('Lines 2638 to 2645:');
  for (let i = 2637; i < Math.min(lines.length, 2645); i++) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}
