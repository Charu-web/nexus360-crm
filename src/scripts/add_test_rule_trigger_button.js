const fs = require('fs');
const path = require('path');

const settingsFile1 = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const settingsFile2 = path.join(__dirname, '../../assets/Settings-M1whXnWb.js');

function addTestTriggerButton(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  if (code.includes('Test Rule Trigger')) {
    console.log('Test Rule Trigger already present in:', path.basename(filePath));
    return;
  }

  // Insert Test Rule Trigger button alongside Edit/Delete buttons in AutomationRulesComponent
  const targetPattern = `children: "Delete Rule" })`;
  const replacement = `children: "Delete Rule" }),
  e.jsx("button", { type: "button", onClick: () => { notify("Simulated rule trigger execution for: " + rule.name); }, className: "px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] cursor-pointer transition", children: "⚡ Test Rule Trigger" })`;

  if (code.includes(targetPattern)) {
    code = code.replace(targetPattern, replacement);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Successfully added Test Rule Trigger button to:', path.basename(filePath));
  } else {
    console.error('Could not find target pattern in:', path.basename(filePath));
  }
}

addTestTriggerButton(settingsFile1);
addTestTriggerButton(settingsFile2);
