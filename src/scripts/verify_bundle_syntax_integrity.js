const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('====================================================');
console.log(' SCANNING FRONTEND BUNDLE FOR SYNTAX ERRORS');
console.log('====================================================\n');

try {
  new vm.Script(code);
  console.log(' [PASS] Node VM successfully compiled index-CMn9DqNx.js with 0 syntax errors!');
} catch (err) {
  console.error(' [FAIL] Syntax error in index-CMn9DqNx.js:', err.message);
  process.exit(1);
}

// Inspect every JSX / string in CreateCrmComponent
const fnIdx = code.indexOf('function CreateCrmComponent()');
if (fnIdx !== -1) {
  const fnCode = code.substring(fnIdx);
  try {
    new vm.Script(fnCode);
    console.log(' [PASS] CreateCrmComponent isolated compilation: 0 syntax errors!');
  } catch (fnErr) {
    console.error(' [FAIL] Syntax error in CreateCrmComponent:', fnErr.message);
    process.exit(1);
  }
} else {
  console.error(' [FAIL] CreateCrmComponent not found in index bundle!');
  process.exit(1);
}

console.log('\n====================================================');
console.log(' FRONTEND BUNDLE SYNTAX INTEGRITY: 100% VERIFIED');
console.log('====================================================');
