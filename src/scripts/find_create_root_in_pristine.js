const fs = require('fs');
const path = require('path');

const pristinePath = path.join(__dirname, '../../../empire_crm_multitenant_saas_deploy/assets/index-CMn9DqNx.js');
const code = fs.readFileSync(pristinePath, 'utf8');

const crIdx = code.indexOf('createRoot');
console.log('createRoot in pristine found at:', crIdx);
if (crIdx !== -1) {
  console.log('Snippet:', code.substring(crIdx - 50, crIdx + 200));
}
