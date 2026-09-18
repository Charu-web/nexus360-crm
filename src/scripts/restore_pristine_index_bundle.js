const fs = require('fs');
const path = require('path');

const pristinePath = path.join(__dirname, '../../../empire_crm_multitenant_saas_deploy/assets/index-CMn9DqNx.js');
const targetPath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');

console.log('=== RESTORING PRISTINE BUNDLE FROM empire_crm_multitenant_saas_deploy ===');
console.log('Pristine path:', pristinePath);

if (fs.existsSync(pristinePath)) {
  fs.copyFileSync(pristinePath, targetPath);
  console.log('[SUCCESS] Restored pristine index-CMn9DqNx.js to Empire_CRM_COMPLETE_FINAL/assets/index-CMn9DqNx.js!');
} else {
  console.error('Pristine path not found:', pristinePath);
}
