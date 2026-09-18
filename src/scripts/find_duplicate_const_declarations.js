const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/const rx=/g)];
console.log('Matches for "const rx=":');
matches.forEach(m => console.log('  @', m.index));

if (matches.length > 1) {
  // Remove the second occurrence
  const secondIdx = matches[1].index;
  const endIdx = code.indexOf(';', secondIdx);
  console.log('Second declaration text:');
  console.log(code.substring(secondIdx, endIdx + 1));

  code = code.substring(0, secondIdx) + code.substring(endIdx + 1);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('Successfully removed second const rx declaration!');
}
