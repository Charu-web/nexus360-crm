const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== TESTING ACCUMULATED FUNCTION STATEMENTS IN BUNDLE ===');

try {
  new vm.Script(code);
  console.log('VM parsed full code without SyntaxError!');
} catch (err) {
  console.log('VM Full Error:', err.message);
  console.log('Stack:\n', err.stack);
}

// Search for unmatched brackets or trailing braces in function definitions
const lines = code.split('\n');
console.log('Total lines:', lines.length);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('function FD()') || line.includes('bA.createRoot')) {
    console.log(`\nLine ${i + 1} (${line.substring(0, 50)}...):`);
    try {
      new vm.Script(line);
      console.log('  -> Line parses cleanly alone!');
    } catch (e) {
      console.log('  -> Line Parse Error:', e.message);
    }
  }
}
