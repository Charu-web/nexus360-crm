const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/\{\s*name\s*:\s*"General Settings"[^}]+\}/g)];
console.log('Matches for General Settings in index-CMn9DqNx.js:');
matches.forEach(m => console.log('  -', m[0]));
