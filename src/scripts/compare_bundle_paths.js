const fs = require('fs');

// The real approach: restore index-CMn9DqNx.js from the other copy (index-Ftt5f73P.js)
// But index-Ftt5f73P.js references assets with the 'assets/' prefix path  
// which won't work with the current server setup.

// Better approach: Use index-Ftt5f73P.js as the CLEAN BASE
// Then carefully apply ONLY the necessary minimal patches:
// 1. Replace _.Suspense with _.lazy (which was valid originally - _ IS React)
// 2. Add the Settings routes
// 3. Add CRMBuilderComponent, AttendanceComponent, etc.

// First let's understand: In index-Ftt5f73P.js, _.lazy IS valid (checked earlier)
// So the original bundle with _.lazy SHOULD work!
// The ONLY thing missing in the original was the /settings routes

// Let's create a clean minimal patch on the ORIGINAL bundle

const orig = fs.readFileSync('assets/index-Ftt5f73P.js', 'utf8');

// Check what the __vite__mapDeps paths look like (they have 'assets/' prefix)
const mapIdx = orig.indexOf('m.f=[');
const endIdx = orig.indexOf(']))', mapIdx);
const arrStr = orig.substring(mapIdx + 4, endIdx + 1);
let arr;
try {
  arr = JSON.parse(arrStr);
  console.log('Ftt5f73P mapDeps paths (first 5):');
  arr.slice(0, 5).forEach((p, i) => console.log(' ['+i+']', p));
  console.log('Paths use assets/ prefix:', arr[0].startsWith('assets/'));
} catch(e) {
  console.log('Parse error:', e.message);
}

// Check what index-CMn9DqNx.js mapDeps paths look like (they DON'T have assets/ prefix)
const curr = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');
const mapIdx2 = curr.indexOf('m.f=[');
const endIdx2 = curr.indexOf(']))', mapIdx2);
const arrStr2 = curr.substring(mapIdx2 + 4, endIdx2 + 1);
let arr2;
try {
  arr2 = JSON.parse(arrStr2);
  console.log('CMn9DqNx mapDeps paths (first 5):');
  arr2.slice(0, 5).forEach((p, i) => console.log(' ['+i+']', p));
  console.log('Paths use ./ prefix:', arr2[0].startsWith('./'));
} catch(e) {
  console.log('Parse error:', e.message);
}
