const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const code = fs.readFileSync(settingsPath, 'utf8');

// Check for any unhandled variables inside GeneralSettingsComponent
const gsIdx = code.indexOf('function GeneralSettingsComponent()');
const gsCode = code.substring(gsIdx, gsIdx + 3500);

console.log('Checking variable names inside GeneralSettingsComponent...');
const varMatches = [...gsCode.matchAll(/\b([a-zA-Z0-9_$]+)\b/g)].map(m => m[0]);
const uniqueVars = [...new Set(varMatches)];

console.log('Sample symbols used in GeneralSettingsComponent:');
console.log(uniqueVars.filter(v => ['e', 't', 'useToast', 'notify', 'toastEl', 'loading', 'generalForm', 'fetch', 'localStorage', 'React'].includes(v)));
