const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FINDING EXACT LINE WITH EXTRA BRACE ===');

const lines = code.split('\n');
console.log('Total lines:', lines.length);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line === '}' || line === '};' || line === '}}' || line === '});' || line === '}};' || line === '}}})') {
    // Test omitting line i
    const testLines = [...lines];
    testLines.splice(i, 1);
    try {
      new vm.Script(testLines.join('\n'));
      console.log(`\n!!! REMOVING LINE ${i + 1} (${line}) FIXES THE ENTIRE BUNDLE SYNTAX ERROR !!!`);
      break;
    } catch (e) {
      if (!e.message.includes('Unexpected token \'}\'')) {
        console.log(`Line ${i + 1} (${line}) changed error to:`, e.message);
      }
    }
  }
}
