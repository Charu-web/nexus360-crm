const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('Cleaning up duplicate lazy import declarations...');

const lazyVars = [
  'rx', 'CD', 'RD', 'OD', 'kD', 'jD', 'rd', 'MD', 'ND',
  'lx', 'DD', 'zD', 'ox', 'VD', 'ux', 'UD', 'LD', 'ko',
  'BD', 'PD', 'HD'
];

let removedCount = 0;
lazyVars.forEach(v => {
  const regex = new RegExp(`const ${v}=rt\\.lazy\\([^\\n]+\\n`, 'g');
  const matches = [...code.matchAll(regex)];
  if (matches.length > 1) {
    // Keep the first declaration, remove subsequent ones
    let firstFound = false;
    code = code.replace(regex, (match) => {
      if (!firstFound) {
        firstFound = true;
        return match;
      }
      removedCount++;
      console.log(`Removed duplicate declaration for: ${v}`);
      return '';
    });
  }
});

fs.writeFileSync(bundlePath, code, 'utf8');
console.log(`Duplicate cleanup finished. Total duplicates removed: ${removedCount}`);
