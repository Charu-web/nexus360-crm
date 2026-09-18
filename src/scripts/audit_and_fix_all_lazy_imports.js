const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== AUDITING & FIXING ALL LAZY IMPORTS IN MAIN BUNDLE ===');

const lazyDefList = [
  { varName: 'AD', file: './Dashboard-BuIVt-cC.js', deps: [0,1,2,3,4,5,6,7,8,9,10,11] },
  { varName: 'rx', file: './Leads-BKOSi9zF.js', deps: [12,13,3,10,14,6,7] },
  { varName: 'CD', file: './Deals-BSbWjI7C.js', deps: [15,13,3,16] },
  { varName: 'RD', file: './Customers-TZt4O0P6.js', deps: [17,3,5,14] },
  { varName: 'OD', file: './Tasks-BPk4HPJq.js', deps: [18,19] },
  { varName: 'kD', file: './Meetings-wVMuh86k.js', deps: [20,21,22] },
  { varName: 'jD', file: './Reports-Yw-hSF8k.js', deps: [23] },
  { varName: 'rd', file: './Settings-DcmRBp2d.js', deps: [24,19,1,10] },
  { varName: 'MD', file: './CallAnalyzer-Bz3bOYfq.js', deps: [25] },
  { varName: 'ND', file: './Reminders-BhStIPXo.js', deps: [26,27,10] },
  { varName: 'lx', file: './ChatPage-fEWGabDw.js', deps: [28] },
  { varName: 'DD', file: './TodoPage-uNW6bCph.js', deps: [29] },
  { varName: 'zD', file: './NotesPage-DjgVb8GB.js', deps: [30,19] },
  { varName: 'ox', file: './ProjectsPage-CvX5uO5C.js', deps: [31] },
  { varName: 'VD', file: './CalendarPage-CIk1CtIY.js', deps: [32] },
  { varName: 'ux', file: './AccountingPage-3k6LXiEN.js', deps: [33] },
  { varName: 'UD', file: './InvoicesPage-CXPzZos4.js', deps: [34,11] },
  { varName: 'LD', file: './CampaignsPage-DEEzk6nW.js', deps: [35,6] },
  { varName: 'ko', file: './HRPage-8ZvnY9ZY.js', deps: [36,19] },
  { varName: 'BD', file: './SMSPage-CYHhovCb.js', deps: [37,38] },
  { varName: 'PD', file: './EmailPage-DDchW3aj.js', deps: [39,11] },
  { varName: 'HD', file: './GreetingsPage-wZyGz206.js', deps: [40,11] }
];

let fixes = 0;
lazyDefList.forEach(item => {
  const checkStr = `const ${item.varName}=rt.lazy`;
  if (!code.includes(checkStr)) {
    // Check if defined with _.lazy
    const legacyStr = `const ${item.varName}=_.lazy`;
    if (code.includes(legacyStr)) {
      code = code.replace(legacyStr, checkStr);
      fixes++;
      console.log(`Replaced legacy lazy: ${legacyStr} -> ${checkStr}`);
    } else {
      // Define explicitly using Ze helper
      const decl = `const ${item.varName}=rt.lazy(()=>Ze(()=>import("${item.file}"),__vite__mapDeps(${JSON.stringify(item.deps)})));`;
      const fdIdx = code.indexOf('function FD()');
      if (fdIdx !== -1) {
        code = code.substring(0, fdIdx) + decl + '\n' + code.substring(fdIdx);
        fixes++;
        console.log(`Injected missing lazy import: ${decl}`);
      }
    }
  }
});

console.log(`Audit complete. Fixed/injected ${fixes} lazy imports.`);
fs.writeFileSync(bundlePath, code, 'utf8');
