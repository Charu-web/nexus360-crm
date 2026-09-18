const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== SEARCHING ENTIRE BUNDLE FOR UNEXPECTED STRING ERRORS ===');

const lines = code.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('function ') || line.includes('class ') || line.includes('const ') || line.includes('let ')) {
    try {
      new vm.Script(line);
    } catch (e) {
      if (e.message.includes('Unexpected string')) {
        console.log(`Line ${idx + 1} has UNEXPECTED STRING:`, e.message);
        console.log('Snippet:', line.substring(0, 200));
      }
    }
  }
});
