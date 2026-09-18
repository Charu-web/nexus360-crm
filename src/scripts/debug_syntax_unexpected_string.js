const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== TESTING VM PARSE OF INDEX BUNDLE ===');

try {
  new vm.Script(code);
  console.log('[SUCCESS] VM parsed index-CMn9DqNx.js with 0 syntax errors!');
} catch (err) {
  console.error('[SYNTAX ERROR FOUND]:', err.message);
  const lines = code.split('\n');
  console.log('Total lines:', lines.length);
  for (let i = 0; i < lines.length; i++) {
    try {
      new vm.Script(lines[i]);
    } catch (lineErr) {
      console.log(`Line ${i + 1} Error:`, lineErr.message);
    }
  }
}
