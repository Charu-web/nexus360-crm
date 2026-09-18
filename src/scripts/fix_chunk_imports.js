const fs = require('fs');
let code = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

// CRITICAL ISSUES FOUND:
// 1. The lazy chunk imports still reference old Ftt5f73P chunk names (Dashboard-CEO85trR.js etc)
//    because the path mapping script mapped the __vite__mapDeps array but NOT the import() calls
// 2. The /crm-builder route injection was broken - inserted inside another route definition
// 3. Settings routes from Ftt5f73P were already there (they were added previously)

// Let's fix both issues:

// FIX 1: Fix all the broken import() calls that still reference old chunk names
const chunkMapping = {
  '"./Dashboard-CEO85trR.js"': '"./Dashboard-BuIVt-cC.js"',
  '"./Leads-BN33rmf4.js"': '"./Leads-BKOSi9zF.js"',
  '"./Deals-DV0EOx9y.js"': '"./Deals-BSbWjI7C.js"',
  '"./Customers-Cnv-F32-.js"': '"./Customers-TZt4O0P6.js"',
  '"./Tasks-BRhrMJsz.js"': '"./Tasks-BPk4HPJq.js"',
  '"./Meetings-DYDTQ3Nv.js"': '"./Meetings-wVMuh86k.js"',
  '"./Reports-CRBOFIb_.js"': '"./Reports-Yw-hSF8k.js"',
  '"./Settings-M1whXnWb.js"': '"./Settings-DcmRBp2d.js"',
  '"./CallAnalyzer-BAfk692F.js"': '"./CallAnalyzer-Bz3bOYfq.js"',
  '"./Reminders-DOU56xH_.js"': '"./Reminders-BhStIPXo.js"',
  '"./ChatPage-BfXg4YJf.js"': '"./ChatPage-fEWGabDw.js"',
  '"./TodoPage-CpavRUOc.js"': '"./TodoPage-uNW6bCph.js"',
  '"./NotesPage-CeDkBDy5.js"': '"./NotesPage-DjgVb8GB.js"',
  '"./ProjectsPage-BYr4srUR.js"': '"./ProjectsPage-CvX5uO5C.js"',
  '"./CalendarPage-Cik2d-KF.js"': '"./CalendarPage-CIk1CtIY.js"',
  '"./AccountingPage-BHT3UDcl.js"': '"./AccountingPage-3k6LXiEN.js"',
  '"./InvoicesPage-BnFGxGKr.js"': '"./InvoicesPage-CXPzZos4.js"',
  '"./CampaignsPage-DzKKR3sh.js"': '"./CampaignsPage-DEEzk6nW.js"',
  '"./HRPage-DHNmEbYd.js"': '"./HRPage-8ZvnY9ZY.js"',
  '"./SMSPage-kdI_Buhl.js"': '"./SMSPage-CYHhovCb.js"',
  '"./EmailPage-B3giU-mj.js"': '"./EmailPage-DDchW3aj.js"',
  '"./GreetingsPage-C_ScOokp.js"': '"./GreetingsPage-wZyGz206.js"',
  '"./StoragePage-B.js"': '"./StoragePage-A.js"',
};

let fixes = 0;
for (const [oldRef, newRef] of Object.entries(chunkMapping)) {
  const count = (code.match(new RegExp(oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count > 0) {
    code = code.replace(new RegExp(oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newRef);
    console.log(`Fixed import ref ${count}x: ${oldRef} -> ${newRef}`);
    fixes += count;
  }
}
console.log('Total import fixes:', fixes);

// FIX 2: Fix the broken crm-builder route injection
// The broken code was: d.jsx(oe,{d.jsx(oe,{path:"/crm-builder",...}),path:"/dashboard",...})
// We need to fix this malformed JSX
const badCrmRoute = 'd.jsx(oe,{d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),path:"/dashboard"';
const goodCrmRoute = 'd.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),d.jsx(oe,{path:"/dashboard"';

if (code.includes(badCrmRoute)) {
  code = code.replace(badCrmRoute, goodCrmRoute);
  console.log('Fixed broken /crm-builder route injection!');
} else {
  console.log('Bad crm-builder route injection not found. Checking...');
  const crmIdx = code.indexOf('path:"/crm-builder"');
  if (crmIdx !== -1) {
    console.log('crm-builder route context:');
    console.log(code.substring(crmIdx - 30, crmIdx + 200));
  } else {
    console.log('No crm-builder route found at all!');
    // Add it before /dashboard
    const dashIdx = code.indexOf('path:"/dashboard"');
    if (dashIdx !== -1) {
      const crmRoute = 'd.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),';
      // Find the d.jsx(oe,{path:"/dashboard" to insert before it
      const insertBefore = 'd.jsx(oe,{path:"/dashboard"';
      const insertIdx = code.indexOf(insertBefore, dashIdx - 5);
      if (insertIdx !== -1) {
        code = code.substring(0, insertIdx) + crmRoute + code.substring(insertIdx);
        console.log('Added /crm-builder route before /dashboard');
      }
    }
  }
}

// Also check if Settings-M1whXnWb.js still referenced anywhere
const m1Count = (code.match(/Settings-M1whXnWb\.js/g) || []).length;
console.log('Settings-M1whXnWb.js references remaining:', m1Count);

// Save
fs.writeFileSync('assets/index-CMn9DqNx.js', code, 'utf8');
console.log('Saved. Final bundle size:', code.length);

// Quick final verification
const finalCheck = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');
const checks = {
  'Settings-DcmRBp2d.js': finalCheck.includes('Settings-DcmRBp2d.js'),
  'Dashboard-BuIVt-cC.js': finalCheck.includes('Dashboard-BuIVt-cC.js'),
  '/settings route': finalCheck.includes('path:"/settings"'),
  '/crm-builder route': finalCheck.includes('path:"/crm-builder"'),
  '/dashboard route': finalCheck.includes('path:"/dashboard"'),
  '/login route': finalCheck.includes('path:"/login"'),
  'createRoot call': finalCheck.includes('createRoot(document'),
};
console.log('\nFinal verification:');
Object.entries(checks).forEach(([k,v]) => console.log(' ', v ? '✓' : '✗', k));
