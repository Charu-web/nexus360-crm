const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('=== FINDING EXACT FAILING LINE IN SINGLE LINE BUNDLE ===');
console.log('Total lines:', lines.length);

for (let i = 0; i < lines.length; i++) {
  try {
    new vm.Script(lines[i]);
  } catch (err) {
    console.log(`Line ${i + 1} Parse Result:`, err.message);
  }
}
