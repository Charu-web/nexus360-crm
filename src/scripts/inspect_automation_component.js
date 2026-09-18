const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const code = fs.readFileSync(settingsPath, 'utf8');

const autoIdx = code.indexOf('function AutomationRulesComponent()');
console.log('AutomationRulesComponent found in Settings-DcmRBp2d.js:', autoIdx !== -1);

if (autoIdx !== -1) {
  console.log('AutomationRulesComponent code snippet:');
  console.log(code.substring(autoIdx, autoIdx + 1500));
}
