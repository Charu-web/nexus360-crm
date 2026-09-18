const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('Fixing malformed JSX in FD router...');

const badJsx = `d.jsx(oe,{d.jsx(oe,{path:"/custom-module/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/records/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),path:"/login",element:d.jsx(rO,{})})`;

const goodJsx = `d.jsx(oe,{path:"/custom-module/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/records/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/login",element:d.jsx(rO,{})})`;

if (code.includes(badJsx)) {
  code = code.replace(badJsx, goodJsx);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced malformed JSX routes with clean separate routes in FD()!');
} else {
  console.log('Bad JSX pattern not matched directly. Searching for substring...');
  const idx = code.indexOf('/custom-module/:moduleKey');
  if (idx !== -1) {
    console.log(code.substring(idx - 40, idx + 250));
  }
}
