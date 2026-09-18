const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FINDING AST ERROR LOCATION IN BUNDLE ===');

// Check top-level statements / functions in code
// Split code by top-level declarations (function, const, let, var, import, export)
const statements = code.split(/(?=function\s+|const\s+|let\s+|var\s+|export\s+)/);

console.log('Total top-level statements/blocks:', statements.length);

let validCount = 0;
for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i].trim();
  if (!stmt) continue;
  
  // Wrap statement in function to test syntactic validity
  try {
    new vm.Script(`(function(){\n${stmt}\n})`);
    validCount++;
  } catch (err) {
    if (err.message.includes('Unexpected token') || err.message.includes('SyntaxError')) {
      console.log(`\n!!! Statement ${i + 1} HAS SYNTAX ERROR !!!`);
      console.log('Error:', err.message);
      console.log('Statement snippet:\n', stmt.substring(0, 300));
    }
  }
}

console.log(`Verified ${validCount} / ${statements.length} statements.`);
