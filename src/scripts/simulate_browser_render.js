const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Check for dangerous unquoted strings or invalid identifiers
console.log('Checking bundle for suspicious patterns...');

// Check if window / localStorage / document references cause crashes before DOM ready
const topLevelWindowCalls = [...code.matchAll(/window\.[a-zA-Z0-9_$]+/g)];
console.log('Total window references:', topLevelWindowCalls.length);

const topLevelLocalStorageCalls = [...code.matchAll(/localStorage\.[a-zA-Z0-9_$]+/g)];
console.log('Total localStorage references:', topLevelLocalStorageCalls.length);

// Check if any undefined variables are referenced
const undefinedMatches = [...code.matchAll(/\b(undefined[a-zA-Z0-9_$]+)\b/g)];
console.log('Undefined variable matches:', undefinedMatches.map(m => m[0]));
