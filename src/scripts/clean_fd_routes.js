const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CLEANING MALFORMED ROUTE SYNTAX IN FD() ===');

const badRoutePattern = `d.jsx(oe,{d.jsx(oe,{path:"/crm/:crmSlug"`;
const goodRoutePattern = `d.jsx(oe,{path:"/crm/:crmSlug"`;

if (code.includes(badRoutePattern)) {
  code = code.replace(badRoutePattern, goodRoutePattern);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced malformed d.jsx(oe,{d.jsx(oe,{ with clean d.jsx(oe,{ in FD()!');
} else {
  console.log('badRoutePattern not matched directly. Searching for snippet...');
  const idx = code.indexOf('/crm/:crmSlug');
  if (idx !== -1) {
    console.log(code.substring(idx - 60, idx + 100));
  }
}
