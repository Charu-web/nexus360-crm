const fs = require('fs');

// Now let's verify the export names in the restored index-CMn9DqNx.js match what Settings-DcmRBp2d.js needs
// Settings-DcmRBp2d.js imports: { c, w as se, r as t, j as e, a as te, x as ae, f as le, X as re, n as D, p as oe, M as de }

const newIndex = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');
const newExports = newIndex.substring(newIndex.lastIndexOf('export{'), newIndex.length);
console.log('Exports from restored index-CMn9DqNx.js:');
console.log(newExports.substring(0, 400));

// Check that key exports exist: c, w, r, j, a, x, f, X, n, p, M
const exportsNeeded = ['c as', 'w as', 'r as', 'j as', 'a as', 'x as', 'f as', 'X as', 'n as', 'p as', 'M as'];
console.log('\nRequired exports check:');
exportsNeeded.forEach(exp => {
  const has = newExports.includes(exp);
  console.log(' ', has ? '✓' : '✗', exp);
});
