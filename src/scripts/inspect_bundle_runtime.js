const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('Searching for CRMBuilderComponent in index-CMn9DqNx.js...');
const builderIdx = code.indexOf('const CRMBuilderComponent');
console.log('CRMBuilderComponent found:', builderIdx !== -1);

console.log('Searching for CustomModuleRecordComponent in index-CMn9DqNx.js...');
const recordIdx = code.indexOf('const CustomModuleRecordComponent');
console.log('CustomModuleRecordComponent found:', recordIdx !== -1);

console.log('Searching for FD function in index-CMn9DqNx.js...');
const fdIdx = code.indexOf('function FD()');
console.log('FD function found:', fdIdx !== -1);

if (fdIdx !== -1) {
  console.log('FD code snippet:');
  console.log(code.substring(fdIdx, fdIdx + 800));
}
