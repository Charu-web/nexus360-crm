const fs = require('fs');
const code = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// Good - no more undefined injected variables in routes
// BUT AttendanceComponent and LeaveRequestsComponent ARE defined AND used
// These were injected into the bundle - let's check if they're used IN ROUTES
// which would require they be defined BEFORE FD() is called

// Find where AttendanceComponent is defined vs where FD() is
const attDefIdx = code.indexOf('function AttendanceComponent()');
const attUseIdx = code.indexOf('AttendanceComponent,{}');
const fdIdx = code.indexOf('function FD()');

console.log('AttendanceComponent defined at:', attDefIdx);
console.log('AttendanceComponent used at:', attUseIdx);
console.log('FD() defined at:', fdIdx);
console.log('');

// AttendanceComponent MUST be defined BEFORE FD() is called, or it's a hoisting issue
// Function declarations are hoisted, so this is fine if it's a function declaration

// Now let's check what error comes next - check the FD function for any other 
// variable that might be referenced but not defined

// Scan FD function body for variable names used as React components
const fdEnd = code.indexOf('}bA.createRoot', fdIdx);
const fdBody = code.substring(fdIdx, fdEnd);

// Find all d.jsx(VARIABLE, or d.jsxs(VARIABLE patterns
const componentRefs = [...fdBody.matchAll(/d\.jsx\(([a-zA-Z_$][a-zA-Z0-9_$]*),/g)].map(m => m[1]);
const uniqueRefs = [...new Set(componentRefs)];

console.log('Components referenced in FD router:', uniqueRefs);

// Check which ones are NOT defined in the bundle
const undefined_comps = uniqueRefs.filter(ref => {
  // Skip known React Router/HTML things
  if (['oe', 've', 'ge', '_2', 'd', 'p5'].includes(ref)) return false;
  
  // Check if defined
  const isDefined = code.includes(`function ${ref}(`) || 
                    code.includes(`const ${ref}=`) ||
                    code.includes(`var ${ref}=`) ||
                    code.includes(`let ${ref}=`);
  return !isDefined;
});

console.log('\nUNDEFINED components used in FD router:');
undefined_comps.forEach(c => {
  const idx = fdBody.indexOf(`d.jsx(${c},`);
  console.log(`  ${c} -> context: ${fdBody.substring(idx - 20, idx + 80)}`);
});
