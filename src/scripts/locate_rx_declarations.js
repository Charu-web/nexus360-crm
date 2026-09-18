const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/\b(var|let|const)\s+rx\b/g)];
console.log('All declarations of "rx":', matches.length);
matches.forEach((m, idx) => {
  console.log(`  Decl ${idx + 1} at char ${m.index}: ${m[0]}`);
  console.log('    Snippet:', code.substring(m.index - 20, m.index + 80));
});
