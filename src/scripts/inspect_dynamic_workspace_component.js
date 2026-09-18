const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const dwIdx = code.indexOf('function DynamicWorkspaceComponent()');
console.log('DynamicWorkspaceComponent length:', code.indexOf('function MyCRMsComponent()') - dwIdx);
console.log(code.substring(dwIdx, dwIdx + 2000));
