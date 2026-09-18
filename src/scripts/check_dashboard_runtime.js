const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('Checking index-CMn9DqNx.js for CRMBuilderComponent and TopBar button injection...');

const builderIdx = code.indexOf('function CRMBuilderComponent()');
console.log('function CRMBuilderComponent() found:', builderIdx !== -1);

const topbarIdx = code.indexOf('Create Your Own CRM Platform');
console.log('TopBar button text found:', topbarIdx !== -1);

// Let's check for any syntax error or undefined symbols introduced in CRMBuilderComponent
if (builderIdx !== -1) {
  const snippet = code.substring(builderIdx, builderIdx + 1500);
  console.log('CRMBuilderComponent snippet:');
  console.log(snippet);
}
