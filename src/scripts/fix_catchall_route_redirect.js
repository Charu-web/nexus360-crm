const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING CATCH-ALL ROUTE REDIRECT IN FD FUNCTION ===');

const oldCatchAll = 'd.jsx(oe,{path:"*",element:d.jsx(_2,{to:"/dashboard",replace:!0})})';
const newCatchAll = 'd.jsx(oe,{path:"*",element:d.jsx(_2,{to:"/login",replace:!0})})';

if (code.includes(oldCatchAll)) {
  code = code.replace(oldCatchAll, newCatchAll);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced catch-all route redirect from /dashboard to /login!');
} else {
  console.log('oldCatchAll string not found in bundle.');
}
