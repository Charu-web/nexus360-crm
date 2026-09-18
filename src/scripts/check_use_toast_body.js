const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const code = fs.readFileSync(settingsPath, 'utf8');

const utIdx = code.indexOf('const useToast =');
console.log('useToast snippet:');
console.log(code.substring(utIdx, utIdx + 600));
