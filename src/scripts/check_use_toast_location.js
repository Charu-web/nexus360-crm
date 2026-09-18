const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const code = fs.readFileSync(settingsPath, 'utf8');

const utIdx = code.indexOf('useToast');
console.log('First index of useToast:', utIdx);

const matches = [...code.matchAll(/useToast/g)];
console.log('Total occurrences of useToast:', matches.length);

const defIdx = code.indexOf('const useToast =');
console.log('const useToast = at index:', defIdx);
console.log('GeneralSettingsComponent at index:', code.indexOf('function GeneralSettingsComponent()'));
