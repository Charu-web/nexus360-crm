const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../../assets/Dashboard-BuIVt-cC.js');
const code = fs.readFileSync(dashPath, 'utf8');

console.log('Checking Dashboard-BuIVt-cC.js size:', code.length);

const underscoreMatches = [...code.matchAll(/_\.([a-zA-Z0-9_$]+)/g)];
console.log('Underscore matches in Dashboard-BuIVt-cC.js:', underscoreMatches.length);
if (underscoreMatches.length > 0) {
  const methods = underscoreMatches.map(m => m[1]);
  console.log('Methods:', [...new Set(methods)]);
}
