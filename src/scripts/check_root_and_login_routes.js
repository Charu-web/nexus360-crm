const fs = require('fs');
const curr = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// Check root route
const rootRoute = curr.indexOf('path:"/"');
console.log('Root / route index:', rootRoute);
if (rootRoute !== -1) {
  console.log(curr.substring(rootRoute - 50, rootRoute + 200));
}

// Check what the * catch-all redirects to
const catchAll = curr.indexOf('path:"*"');
console.log('Catch-all * route index:', catchAll);
if (catchAll !== -1) {
  console.log(curr.substring(catchAll - 20, catchAll + 200));
}

// Check rO (login component)
const roIdx = curr.indexOf('function rO(');
const roConst = curr.indexOf('const rO=');
console.log('rO function at:', roIdx, 'const at:', roConst);
if (roIdx !== -1) {
  console.log(curr.substring(roIdx, roIdx + 200));
}

// Is there a /settings route before /dashboard?
// In React Router v6 with Routes, routes are evaluated in order for specificity, not position
const settingsFirst = curr.indexOf('path:"/settings"');
const dashFirst = curr.indexOf('path:"/dashboard"');
console.log('/settings first occurrence:', settingsFirst);
console.log('/dashboard first occurrence:', dashFirst);
