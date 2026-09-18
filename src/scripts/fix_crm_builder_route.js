const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING /crm-builder ROUTE TO MOUNT CRMBuilderComponent ===');

const oldCrmRoute = `d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),`;
const newCrmRoute = `d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(CRMBuilderComponent,{})})})})}),`;

if (code.includes(oldCrmRoute)) {
  code = code.replace(oldCrmRoute, newCrmRoute);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced /crm-builder route element from AD (Dashboard) to CRMBuilderComponent wrapped in ErrorBoundary!');
} else {
  console.log('oldCrmRoute target not found directly. Searching for pattern...');
  const idx = code.indexOf('path:"/crm-builder"');
  if (idx !== -1) {
    console.log(code.substring(idx - 30, idx + 150));
  }
}
