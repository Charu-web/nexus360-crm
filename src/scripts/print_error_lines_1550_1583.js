const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

console.log('=== PRINTING LINES 1550 TO 1583 ===');
for (let i = 1549; i < lines.length; i++) {
  console.log(`Line ${i + 1}:`, lines[i]);
}
