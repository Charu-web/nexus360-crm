const fs = require('fs');
const path = require('path');

const fileA = path.join(__dirname, '../../assets/StoragePage-A.js');
const fileB = path.join(__dirname, '../../assets/StoragePage-B.js');

console.log('Verifying StoragePage chunks:');
console.log('StoragePage-A.js size:', fs.readFileSync(fileA, 'utf8').length);
console.log('StoragePage-B.js size:', fs.readFileSync(fileB, 'utf8').length);
