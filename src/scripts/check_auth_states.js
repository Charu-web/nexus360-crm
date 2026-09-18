const fs = require('fs');
const curr = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// The auth hook: If no token -> calls e(Iy()) -> sets status to "unauthenticated"
// So unauthenticated user: status changes from "idle" -> "unauthenticated"
// Then ve() sees status is NOT "idle"/"loading", user is null -> redirects to /login
// /login should render rO

// The REAL problem: The background is 'bg-slate-900' on ge()
// BUT for unauthenticated users, they're redirected to /login which is NOT wrapped in ge()
// /login renders rO directly (no ge wrapper)

// Check Iy() - the "logout" action creator that sets status to unauthenticated
const iyIdx = curr.indexOf('Iy=');
console.log('Iy= at:', iyIdx);
if (iyIdx !== -1) {
  console.log(curr.substring(iyIdx - 30, iyIdx + 200));
}

// Check what status values exist in the auth slice
const idleIdx = curr.indexOf('"idle"');
const loadingIdx = curr.indexOf('"loading"');
const authIdx = curr.indexOf('"authenticated"');
const unauthIdx = curr.indexOf('"unauthenticated"');
console.log('status values in bundle:');
console.log(' "idle":', idleIdx !== -1);
console.log(' "loading":', loadingIdx !== -1);
console.log(' "authenticated":', authIdx !== -1);
console.log(' "unauthenticated":', unauthIdx !== -1);

// Let's also check the initial state of auth slice  
const initialStateIdx = curr.indexOf('status:"idle"');
console.log('status:"idle" in initial state at:', initialStateIdx);
if (initialStateIdx !== -1) {
  console.log(curr.substring(initialStateIdx - 100, initialStateIdx + 200));
}
