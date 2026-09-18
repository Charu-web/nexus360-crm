const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const content = fs.readFileSync(settingsPath, 'utf8');

console.log('Settings-DcmRBp2d.js total length:', content.length);

const wrapperIdx = content.indexOf('function SettingsPageWrapper()');
console.log('SettingsPageWrapper code:');
console.log(content.substring(wrapperIdx, wrapperIdx + 2000));
