const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== LOCATING EXACT SYNTAX ERROR LINE ===');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  try {
    new vm.Script(lines[i]);
  } catch (err) {
    if (err.message.includes('Unexpected token') || err.message.includes('SyntaxError')) {
      console.log(`\nLine ${i + 1} Parse Error:`, err.message);
      console.log('Content:\n', lines[i].substring(0, 150));
    }
  }
}
