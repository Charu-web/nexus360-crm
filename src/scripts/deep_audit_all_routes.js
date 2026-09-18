const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== DEEP AUDIT OF BUNDLE IDENTIFIERS & ROUTE WRAPPERS ===');

// Check all lazy components in index-CMn9DqNx.js
const lazyMatches = [...code.matchAll(/const ([a-zA-Z0-9_$]+)\s*=\s*rt\.lazy/g)].map(m => m[1]);
console.log('Lazy components defined with rt.lazy:', lazyMatches);

// Check for any legacy _.lazy in bundle
const legacyLazyMatches = [...code.matchAll(/const ([a-zA-Z0-9_$]+)\s*=\s*_\.lazy/g)].map(m => m[1]);
console.log('Legacy _.lazy components:', legacyLazyMatches);

// Check FD router code
const fdIdx = code.indexOf('function FD()');
const fdEnd = code.indexOf('}bA.createRoot', fdIdx);
const fdBody = code.substring(fdIdx, fdEnd);

// Find all components passed to <Route element={<Component />} />
const elementMatches = [...fdBody.matchAll(/element:d\.jsx\(([a-zA-Z0-9_$]+),/g)].map(m => m[1]);
const uniqueElements = [...new Set(elementMatches)];

console.log('\nUnique element wrappers/components in FD router:', uniqueElements);

uniqueElements.forEach(el => {
  const isFunc = code.includes(`function ${el}(`);
  const isConst = code.includes(`const ${el}=`) || code.includes(`const ${el} =`);
  const isVar = code.includes(`var ${el}=`) || code.includes(`var ${el} =`);
  const isLet = code.includes(`let ${el}=`) || code.includes(`let ${el} =`);
  const defined = isFunc || isConst || isVar || isLet;
  console.log(`  - Element [${el}]: ${defined ? 'DEFINED' : '!!! UNDEFINED (CRASH CAUSE) !!!'}`);
});
