const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/Create CRM/g)];
console.log('Matches for "Create CRM":', matches.length);

matches.forEach((m, idx) => {
  console.log(`Match ${idx} at ${m.index}:`);
  console.log(code.substring(m.index - 100, m.index + 200));
});
