const fs = require('fs');
const code = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// Now scan for ALL undefined variable references in the FD router that were injected
// by previous patch scripts but don't exist in the clean Ftt5f73P base bundle

// Things injected by old patches that might not be defined:
// CRMBuilderComponent, CustomModuleRecordComponent, AttendanceComponent, LeaveRequestsComponent
// Check each one

const checkVars = [
  'CRMBuilderComponent',
  'CustomModuleRecordComponent', 
  'AttendanceComponent',
  'LeaveRequestsComponent',
  'storage_lazy',
  'GeneralSettingsComponent',
  'AutomationRulesComponent'
];

console.log('Checking for variables used in routes:');
checkVars.forEach(varName => {
  // Check if it's DEFINED (as a function or const)
  const isDefined = code.includes(`function ${varName}`) || 
                    code.includes(`const ${varName}`) ||
                    code.includes(`var ${varName}`);
  // Check if it's USED
  const isUsed = code.indexOf(varName) !== -1;
  console.log(`${varName}: defined=${isDefined}, used=${isUsed}`);
  if (isUsed && !isDefined) {
    console.log(`  ^^^ UNDEFINED VARIABLE IN BUNDLE - WILL CRASH!`);
    // Find where it's used
    const idx = code.indexOf(varName);
    console.log(`  Used at: ${code.substring(idx - 30, idx + 100)}`);
  }
});
