const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Test binary search on string length of code to pinpoint exact character offset of syntax error
let min = 0;
let max = code.length;
let lastValid = 0;
let firstErrorMsg = '';

// Find where parsing fails
for (let i = 1000; i <= code.length; i += 1000) {
  const chunk = code.substring(0, i);
  try {
    new vm.Script(chunk);
  } catch (err) {
    if (!err.message.includes('Unexpected end of input') && !err.message.includes('Unterminated')) {
      console.log(`Syntax error occurs before character index ${i}:`, err.message);
      max = i;
      firstErrorMsg = err.message;
      break;
    }
  }
}

console.log('Searching range between', min, 'and', max);
for (let pos = Math.max(0, max - 5000); pos <= max; pos += 100) {
  const chunk = code.substring(0, pos);
  try {
    new vm.Script(chunk);
  } catch (err) {
    if (!err.message.includes('Unexpected end of input') && !err.message.includes('Unterminated')) {
      console.log(`Precise character position ~${pos}:`, err.message);
      console.log('Snippet around error:\n', code.substring(pos - 300, pos + 100));
      break;
    }
  }
}
