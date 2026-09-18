const fs = require('fs');

// Perfect: 
// Settings-DcmRBp2d.js imports from "./index-CMn9DqNx.js" - CORRECT for our restored bundle
// Settings-M1whXnWb.js imports from "./index-Ftt5f73P.js" - for the other bundle

// Now we need to restore Settings-DcmRBp2d.js to its CLEAN state 
// (it was heavily modified with our patching scripts - GeneralSettingsComponent was replaced, etc.)
// The cleanest solution: copy Settings-M1whXnWb.js -> Settings-DcmRBp2d.js 
// but update its import to reference index-CMn9DqNx.js instead of index-Ftt5f73P.js

const m1Content = fs.readFileSync('assets/Settings-M1whXnWb.js', 'utf8');

// Update the import from Ftt5f73P.js -> CMn9DqNx.js
const cleanSettings = m1Content.replace(
  '"./index-Ftt5f73P.js"', 
  '"./index-CMn9DqNx.js"'
);

console.log('Import reference updated:', cleanSettings.includes('"./index-CMn9DqNx.js"'));
console.log('Old reference removed:', !cleanSettings.includes('"./index-Ftt5f73P.js"'));

// Write as Settings-DcmRBp2d.js
fs.writeFileSync('assets/Settings-DcmRBp2d.js', cleanSettings, 'utf8');
console.log('Settings-DcmRBp2d.js restored from clean M1whXnWb.js, size:', cleanSettings.length);

// Verify the clean settings has SettingsPageWrapper
console.log('SettingsPageWrapper found:', cleanSettings.includes('function SettingsPageWrapper'));
console.log('Has tabs:', cleanSettings.includes('Account & Security'));
console.log('Has general tab:', cleanSettings.includes('General Settings'));
console.log('Has automation tab:', cleanSettings.includes('Automation Rules'));
