const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const builderIdx = code.indexOf('const CRMBuilderComponent');
console.log('CRMBuilderComponent snippet:');
console.log(code.substring(builderIdx, builderIdx + 1500));
