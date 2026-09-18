const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== LOCATING EXACT SYNTAX ERROR IN INDEX BUNDLE ===');

// Binary search or line-by-line chunk check to find where syntax error occurs
const lines = code.split('\n');
console.log('Total lines:', lines.length);

// Check accumulating lines to find first invalid chunk
let currentCode = '';
for (let i = 0; i < lines.length; i++) {
  currentCode += lines[i] + '\n';
  try {
    new vm.Script(currentCode);
  } catch (err) {
    if (err.message.includes('Unexpected end of input') || err.message.includes('Unterminated')) {
      // Expected while building multi-line structures
      continue;
    }
    console.log(`\n!!! Syntax error detected at line ${i + 1} !!!`);
    console.log('Error:', err.message);
    console.log('Line content:\n', lines[i].substring(0, 300));
    console.log('\nPrevious line (line ' + i + '):\n', lines[i - 1].substring(0, 300));
    break;
  }
}
