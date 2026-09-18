const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

const fdIdx = code.indexOf('function FD()');
if (fdIdx === -1) {
  console.error('Could not find FD() function in index-CMn9DqNx.js');
  process.exit(1);
}

// Check if settings routes are already present in FD()
if (code.includes('path:"/settings/automation"')) {
  console.log('Settings routes already present in index-CMn9DqNx.js');
}

// Find p5 (Routes container) inside FD()
const routesMarker = 'children:[d.jsx(oe,{path:"/login"';
if (!code.includes(routesMarker)) {
  console.error('Could not find routes marker in FD()');
  process.exit(1);
}

const settingsRoutesJs = `d.jsx(oe,{path:"/settings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/general",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/account",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/web",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/lead",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/hrms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/integrations",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/lead-trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/attributes",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/templates",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/automation",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/automation-rules",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),`;

code = code.replace(routesMarker, 'children:[' + settingsRoutesJs + 'd.jsx(oe,{path:"/login"');

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Successfully mounted all /settings routes into FD() router in index-CMn9DqNx.js!');
