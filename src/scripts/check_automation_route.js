const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/path\s*:\s*"\/settings\/automation[^\"]*"/g)];
console.log('Matches for /settings/automation in index-CMn9DqNx.js:', matches.map(m => m[0]));

const autoRouteIdx = code.indexOf('/settings/automation');
console.log('Context around /settings/automation in index-CMn9DqNx.js:');
console.log(code.substring(autoRouteIdx - 200, autoRouteIdx + 400));
