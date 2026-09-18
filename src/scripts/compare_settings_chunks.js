const fs = require('fs');

// The Settings-DcmRBp2d.js imports from index-CMn9DqNx.js  
// Let's check what the M1whXnWb (old Settings for Ftt5f73P) exported vs what DcmRBp2d has
const settingsOld = fs.readFileSync('assets/Settings-M1whXnWb.js', 'utf8');
const settingsNew = fs.readFileSync('assets/Settings-DcmRBp2d.js', 'utf8');

// Check their import line from index
console.log('Settings-M1whXnWb.js first line import:');
const m1Line = settingsOld.substring(0, 200);
console.log(m1Line);

console.log('\nSettings-DcmRBp2d.js first line import:');
const dcmLine = settingsNew.substring(0, 200);
console.log(dcmLine);

// If DcmRBp2d imports from index-CMn9DqNx.js (the file we just restored), it should work
// If M1whXnWb imports from index-Ftt5f73P.js, we might need to use M1whXnWb instead

// Check both export statements
const m1Export = settingsOld.substring(settingsOld.lastIndexOf('export'), settingsOld.length);
const dcmExport = settingsNew.substring(settingsNew.lastIndexOf('export'), settingsNew.length);
console.log('\nSettings-M1whXnWb.js export:');
console.log(m1Export.substring(0, 100));
console.log('\nSettings-DcmRBp2d.js export:');
console.log(dcmExport.substring(0, 100));
