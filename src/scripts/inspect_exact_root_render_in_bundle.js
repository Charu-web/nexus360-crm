const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== INSPECTING ROOT RENDER & AppErrorBoundary IN INDEX BUNDLE ===');

const ebIdx = code.indexOf('AppErrorBoundary');
console.log('AppErrorBoundary occurrences:', ebIdx);

const lastLines = code.substring(code.length - 2500);
console.log('--- TAIL OF BUNDLE ---');
console.log(lastLines);
