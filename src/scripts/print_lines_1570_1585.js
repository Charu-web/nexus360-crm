const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');
const lines = code.split('\n');

for (let i = 1569; i < Math.min(lines.length, 1585); i++) {
  console.log(`Line ${i + 1}:`, lines[i]);
}
