const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find definition of ve component
const veIndex = code.indexOf('function ve(');
console.log('function ve() found:', veIndex !== -1);
if (veIndex !== -1) {
  console.log(code.substring(veIndex - 50, veIndex + 800));
} else {
  // Search const ve=
  const veConstIdx = code.indexOf('ve=');
  console.log('ve= found:', veConstIdx !== -1);
  if (veConstIdx !== -1) {
    console.log(code.substring(veConstIdx - 50, veConstIdx + 800));
  }
}
