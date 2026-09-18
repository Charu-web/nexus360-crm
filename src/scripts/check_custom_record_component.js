const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

const customRecIdx = code.indexOf('CustomModuleRecordComponent');
console.log('CustomModuleRecordComponent occurrence index:', customRecIdx);
if (customRecIdx !== -1) {
  console.log(code.substring(customRecIdx - 50, customRecIdx + 400));
}
