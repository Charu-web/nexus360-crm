const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const matches = [...code.matchAll(/_\.([a-zA-Z0-9_$]+)/g)];
const methods = matches.map(m => m[1]);
const uniqueMethods = [...new Set(methods)];

console.log('Unique methods called on _ in index-CMn9DqNx.js:', uniqueMethods);
