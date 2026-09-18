const fs = require('fs');
const path = require('path');

const patchPath = path.join(__dirname, 'patch_frontend_bundle.js');
let code = fs.readFileSync(patchPath, 'utf8');

if (code.includes('_.Suspense')) {
  code = code.replace(/_\.Suspense/g, 'rt.Suspense');
  fs.writeFileSync(patchPath, code, 'utf8');
  console.log('[SUCCESS] Replaced _.Suspense with rt.Suspense in patch_frontend_bundle.js!');
} else {
  console.log('No _.Suspense in patch_frontend_bundle.js');
}
