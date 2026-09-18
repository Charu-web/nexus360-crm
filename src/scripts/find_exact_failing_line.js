const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('=== FINDING EXACT FAILING LINE IN BUNDLE ===');

for (let i = 0; i < lines.length; i++) {
  try {
    // Evaluate line wrapped in dummy function block to test standalone validity
    new vm.Script(`function _test_${i}(){ ${lines[i]} }`);
  } catch (err) {
    if (err.message.includes('Unexpected token') && !err.message.includes('export') && !err.message.includes('import')) {
      console.log(`Line ${i + 1} Parse Error:`, err.message);
      console.log('Snippet:\n', lines[i].substring(0, 200));
    }
  }
}
