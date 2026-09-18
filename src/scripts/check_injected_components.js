const fs = require('fs');
const curr = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// The bundle is loaded as type="module". But we changed it extensively.
// Let me check if the modified bundle has any syntax that would cause a parse failure in the browser's ES module parser.
// Specifically check for:
// 1. Multiple export statements
// 2. Malformed import statements  
// 3. The GeneralSettingsComponent we injected - does it use arrow functions or template literals properly?

// Find all injected function code
const gsIdx = curr.indexOf('function GeneralSettingsComponent()');
console.log('GeneralSettingsComponent in index-CMn9DqNx.js:', gsIdx !== -1 ? 'YES at ' + gsIdx : 'NO');

// Check AttendanceComponent  
const attIdx = curr.indexOf('function AttendanceComponent()');
console.log('AttendanceComponent function at:', attIdx);
console.log(curr.substring(attIdx, attIdx + 500));
