const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

const targetStr = 'd.jsxs(p5,{children:[';
const replacementStr = 'd.jsxs(p5,{children:[d.jsx(oe,{path:"/",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Inserted root path "/" route into FD router!');
} else {
  console.log('targetStr not found.');
}
