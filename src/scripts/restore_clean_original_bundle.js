const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== RESTORING CLEAN SINGLE-LINE SVG STRINGS IN BUNDLE ===');

// Convert all multiline backtick/string sequences into clean single lines
code = code.replace(/`([^`]*?)`/gs, (match, p1) => {
  return '`' + p1.replace(/\r?\n/g, ' ') + '`';
});

fs.writeFileSync(bundlePath, code, 'utf8');

try {
  new vm.Script(code);
  console.log('[SUCCESS] Entire bundle VM script compiled with ZERO syntax errors!');
} catch (err) {
  console.log('VM Syntax Error after SVG fix:', err.message);
}
