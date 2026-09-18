const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const code = fs.readFileSync(settingsPath, 'utf8');

const wrapperIdx = code.indexOf('function SettingsPageWrapper()');
console.log(code.substring(wrapperIdx, wrapperIdx + 1500));
