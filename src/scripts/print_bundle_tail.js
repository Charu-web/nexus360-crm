const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('=== TAIL OF INDEX BUNDLE (LAST 10 LINES) ===');
for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
  console.log(`\n--- Line ${i + 1} (${lines[i].length} chars) ---`);
  console.log(lines[i]);
}
