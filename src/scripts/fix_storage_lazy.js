const fs = require('fs');
let code = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// The error: ReferenceError: storage_lazy is not defined
// The restored bundle (from Ftt5f73P.js) never had storage_lazy defined
// But the route still references it: {path:"/storage",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(storage_lazy,{})})})}
// This was injected by a previous patch script

// Fix: Replace storage_lazy with AD (Dashboard component) or remove the /storage route entirely
// Let's check what's there
const storageRef = code.indexOf('storage_lazy');
console.log('storage_lazy at:', storageRef);
if (storageRef !== -1) {
  console.log('Context:', code.substring(storageRef - 50, storageRef + 200));
}

// Count all occurrences
const count = (code.match(/storage_lazy/g) || []).length;
console.log('Total storage_lazy occurrences:', count);

// Fix: replace storage_lazy with AD (the dashboard component as a safe fallback)
// since /storage was a supplementary route
code = code.replace(/storage_lazy/g, 'AD');
console.log('Replaced all storage_lazy -> AD');

fs.writeFileSync('assets/index-CMn9DqNx.js', code, 'utf8');
console.log('Saved. Bundle size:', code.length);

// Verify no more storage_lazy
const verify = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');
const remaining = (verify.match(/storage_lazy/g) || []).length;
console.log('Remaining storage_lazy occurrences:', remaining);
