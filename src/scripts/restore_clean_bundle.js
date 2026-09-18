const fs = require('fs');
const path = require('path');

console.log('=== FINAL DEFINITIVE FIX ===');
console.log('Strategy: Restore index-CMn9DqNx.js from the clean Ftt5f73P bundle with path corrections + minimal settings patch');

// Step 1: Load original clean bundle
let code = fs.readFileSync('assets/index-Ftt5f73P.js', 'utf8');
console.log('Loaded Ftt5f73P.js, size:', code.length);

// Step 2: Fix the __vite__mapDeps paths - Ftt5f73P uses 'assets/XXX.js' but we need './XXX.js'
// The chunk files in assets/ are named differently too - let's map them
const pathMapping = {
  'assets/Dashboard-CEO85trR.js': './Dashboard-BuIVt-cC.js',
  'assets/rotate-ccw-Xlzzg5tP.js': './rotate-ccw-DjshX79R.js',
  'assets/trending-up-neMsFz1a.js': './trending-up-BzIoD8gX.js',
  'assets/formatCurrency-ChTmm5Hb.js': './formatCurrency-ChTmm5Hb.js',
  'assets/BarChart-CxoWz9Jd.js': './BarChart-CmZP9itR.js',
  'assets/filter-Csa6fLKp.js': './filter-BuZ4jxKc.js',
  'assets/phone-B0geBidU.js': './phone-BQOqdgth.js',
  'assets/message-square-P8ST5FoV.js': './message-square-DD00z4eL.js',
  'assets/play-B9mo62_R.js': './play-DPJLRsJD.js',
  'assets/ellipsis-vertical-DUcSGqgY.js': './ellipsis-vertical-DIWa1Z2w.js',
  'assets/eye-BO_HrcZh.js': './eye-aYyo--4G.js',
  'assets/download-DuHWj1MS.js': './download-x16UYntH.js',
  'assets/Leads-BN33rmf4.js': './Leads-BKOSi9zF.js',
  'assets/leadService-6qZ-PlqA.js': './leadService-BjryWvWs.js',
  'assets/trash-2-DFy-mrrL.js': './trash-2-DNXq061R.js',
  'assets/Deals-DV0EOx9y.js': './Deals-BSbWjI7C.js',
  'assets/arrow-right-Vh5JrBFN.js': './arrow-right-35w40hdZ.js',
  'assets/Customers-Cnv-F32-.js': './Customers-TZt4O0P6.js',
  'assets/Tasks-BRhrMJsz.js': './Tasks-BPk4HPJq.js',
  'assets/square-pen-CaLRoXBS.js': './square-pen-Cqfm8O-A.js',
  'assets/Meetings-DYDTQ3Nv.js': './Meetings-wVMuh86k.js',
  'assets/meetingService-0_7uXCIU.js': './meetingService-BTA4in0x.js',
  'assets/video-C4BrGSu8.js': './video-B7p0olEd.js',
  'assets/Reports-CRBOFIb_.js': './Reports-Yw-hSF8k.js',
  'assets/Settings-M1whXnWb.js': './Settings-DcmRBp2d.js',
  'assets/CallAnalyzer-BAfk692F.js': './CallAnalyzer-Bz3bOYfq.js',
  'assets/Reminders-DOU56xH_.js': './Reminders-BhStIPXo.js',
  'assets/circle-alert-HYI5NHak.js': './circle-alert-BsqugUIr.js',
  'assets/ChatPage-BfXg4YJf.js': './ChatPage-fEWGabDw.js',
  'assets/TodoPage-CpavRUOc.js': './TodoPage-uNW6bCph.js',
  'assets/NotesPage-CeDkBDy5.js': './NotesPage-DjgVb8GB.js',
  'assets/ProjectsPage-BYr4srUR.js': './ProjectsPage-CvX5uO5C.js',
  'assets/CalendarPage-Cik2d-KF.js': './CalendarPage-CIk1CtIY.js',
  'assets/AccountingPage-BHT3UDcl.js': './AccountingPage-3k6LXiEN.js',
  'assets/InvoicesPage-BnFGxGKr.js': './InvoicesPage-CXPzZos4.js',
  'assets/CampaignsPage-DzKKR3sh.js': './CampaignsPage-DEEzk6nW.js',
  'assets/HRPage-DHNmEbYd.js': './HRPage-8ZvnY9ZY.js',
  'assets/SMSPage-kdI_Buhl.js': './SMSPage-CYHhovCb.js',
  'assets/rotate-cw-w5YoGMHD.js': './rotate-cw-Bu-lg_7R.js',
  'assets/EmailPage-B3giU-mj.js': './EmailPage-DDchW3aj.js',
  'assets/GreetingsPage-C_ScOokp.js': './GreetingsPage-wZyGz206.js',
};

let replacementCount = 0;
for (const [oldPath, newPath] of Object.entries(pathMapping)) {
  const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = (code.match(regex) || []).length;
  if (matches > 0) {
    code = code.replace(regex, newPath);
    replacementCount += matches;
    console.log(`Replaced ${matches}x: ${oldPath} -> ${newPath}`);
  }
}
console.log(`Total path replacements: ${replacementCount}`);

// Step 3: Also fix the dynamic import() calls which use the full 'assets/...' path in Ftt5f73P
// These appear in the lazy() calls like: import("assets/Dashboard-CEO85trR.js")
// They need to become: import("./Dashboard-BuIVt-cC.js")
// We've already done the replacements above in __vite__mapDeps
// But the import() calls themselves also need fixing
for (const [oldPath, newPath] of Object.entries(pathMapping)) {
  // The import path used in lazy calls is just the filename without 'assets/'
  const oldImport = `import("${oldPath}")`;
  const newImport = `import("${newPath}")`;
  if (code.includes(oldImport)) {
    code = code.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
    console.log(`Fixed import: ${oldImport}`);
  }
}

// Step 4: Verify Settings chunk path is now correct
const settingsRef = code.indexOf('Settings-DcmRBp2d.js');
console.log('Settings-DcmRBp2d.js referenced:', settingsRef !== -1);

// Step 5: Add Settings routes to FD() router
// Find function FD() and the children array start
const fdIdx = code.indexOf('function FD()');
const settingsRouteCheck = code.indexOf('path:"/settings"');
console.log('Settings route already in FD:', settingsRouteCheck !== -1);

if (settingsRouteCheck === -1) {
  // Insert settings routes before the /login route
  const loginRouteIdx = code.indexOf('path:"/login"', fdIdx);
  if (loginRouteIdx !== -1) {
    const settingsRoutes = `d.jsx(oe,{path:"/settings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/general",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/account",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/web",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/lead",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/hrms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/integrations",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/lead-trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/attributes",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/templates",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/automation",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/automation-rules",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),`;
    code = code.substring(0, loginRouteIdx) + settingsRoutes + code.substring(loginRouteIdx);
    console.log('Settings routes INSERTED before /login route');
  }
}

// Step 6: Add /crm-builder route if missing (points to a CRMBuilderComponent)
// For now, just point it to the dashboard (which exists)
// We'll use a simple inline component
const crmBuilderCheck = code.indexOf('path:"/crm-builder"');
if (crmBuilderCheck === -1) {
  const dashRouteIdx = code.indexOf('path:"/dashboard"');
  if (dashRouteIdx !== -1) {
    const crmBuilderRoute = `d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),`;
    code = code.substring(0, dashRouteIdx) + crmBuilderRoute + code.substring(dashRouteIdx);
    console.log('/crm-builder route INSERTED (points to dashboard for now)');
  }
} else {
  console.log('/crm-builder route already exists');
}

// Step 7: Fix export statement - it references old index filename
// The export at the end exports various symbols - they should still be valid
// But the import in Settings-DcmRBp2d.js references index-CMn9DqNx.js specifically!
// Settings-DcmRBp2d.js starts with: import { c, w as se, r as t, j as e, ... } from "./index-CMn9DqNx.js";
// Since we're WRITING to index-CMn9DqNx.js, this is correct!

// Step 8: Write the fixed bundle
fs.writeFileSync('assets/index-CMn9DqNx.js', code, 'utf8');
console.log('Written fixed bundle to index-CMn9DqNx.js, size:', code.length);

// Verify
const verify = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');
const hasSettings = verify.indexOf('path:"/settings"') !== -1;
const hasLogin = verify.indexOf('path:"/login"') !== -1;
const hasDashboard = verify.indexOf('path:"/dashboard"') !== -1;
const hasSettingsDcm = verify.indexOf('Settings-DcmRBp2d.js') !== -1;
const hasImportMeta = verify.indexOf('import.meta') !== -1;
console.log('Verification:');
console.log(' /settings route:', hasSettings ? 'YES' : 'MISSING');
console.log(' /login route:', hasLogin ? 'YES' : 'MISSING');
console.log(' /dashboard route:', hasDashboard ? 'YES' : 'MISSING');
console.log(' Settings-DcmRBp2d.js ref:', hasSettingsDcm ? 'YES' : 'MISSING');
console.log(' import.meta present:', hasImportMeta ? 'YES (needed for ES module)' : 'NO');
