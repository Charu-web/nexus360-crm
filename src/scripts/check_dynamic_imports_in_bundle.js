const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING DYNAMIC MODULE IMPORTS IN INDEX BUNDLE ===');

const importRegex = /import\((['"])\.\/([^'"]+)\1\)/g;
let match;
let count = 0;

while ((match = importRegex.exec(code)) !== null) {
  count++;
  if (count <= 10) {
    console.log(`Match ${count}:`, match[0]);
  }
}

console.log('Total relative dynamic imports found:', count);
