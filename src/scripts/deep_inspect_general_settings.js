const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const code = fs.readFileSync(settingsPath, 'utf8');

const gsIdx = code.indexOf('function GeneralSettingsComponent()');
console.log('function GeneralSettingsComponent() found in Settings-DcmRBp2d.js:', gsIdx !== -1);

if (gsIdx !== -1) {
  console.log('Full GeneralSettingsComponent code:');
  console.log(code.substring(gsIdx, gsIdx + 3000));
}
