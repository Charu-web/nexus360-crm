const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('=== PRINTING LINES 1550 TO 1610 ===');
for (let i = 1549; i < Math.min(lines.length, 1610); i++) {
  console.log(`Line ${i + 1}:`, lines[i]);
}
