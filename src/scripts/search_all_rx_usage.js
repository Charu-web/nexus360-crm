const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/\brx\b/g)];
console.log('Total occurrences of symbol "rx":', matches.length);
matches.forEach((m, idx) => {
  console.log(`  Match ${idx + 1} at char ${m.index}: ${code.substring(m.index - 20, m.index + 50)}`);
});
