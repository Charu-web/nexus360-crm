const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING SYMBOL li IN index-CMn9DqNx.js ===');

const matches = [...code.matchAll(/function li\(/g)];
console.log('function li( matches:', matches.length);

const constMatches = [...code.matchAll(/const li\s*=/g)];
console.log('const li = matches:', constMatches.length);

const varMatches = [...code.matchAll(/var li\s*=/g)];
console.log('var li = matches:', varMatches.length);

const letMatches = [...code.matchAll(/let li\s*=/g)];
console.log('let li = matches:', letMatches.length);

if (code.includes('useNavigate')) {
  console.log('useNavigate matches index:', code.indexOf('useNavigate'));
}
