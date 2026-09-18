const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const builderIdx = code.indexOf('CRMBuilderComponent');
console.log('CRMBuilderComponent occurrence index:', builderIdx);
if (builderIdx !== -1) {
  console.log(code.substring(builderIdx - 50, builderIdx + 500));
}
