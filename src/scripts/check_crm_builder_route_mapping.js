const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING /crm-builder ROUTE IN BUNDLE ===');

const routeMatches = [...code.matchAll(/path:"\/crm-builder"/g)];
console.log('Matches for path:"/crm-builder":', routeMatches.length);

routeMatches.forEach((m, idx) => {
  console.log(`Match ${idx + 1} at char ${m.index}:`);
  console.log(code.substring(m.index - 50, m.index + 200));
});
