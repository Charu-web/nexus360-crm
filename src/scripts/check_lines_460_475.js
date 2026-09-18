const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('=== LINES 460 TO 475 IN INDEX BUNDLE ===');
for (let i = 459; i < Math.min(lines.length, 475); i++) {
  console.log(`Line ${i + 1}: ${lines[i]}`);
}
