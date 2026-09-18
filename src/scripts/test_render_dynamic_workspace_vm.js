const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== TESTING DYNAMIC WORKSPACE RENDERING IN NODE VM ===');

// Check if all referenced identifiers inside DynamicWorkspaceComponent exist in global/module scope
const dwCode = code.substring(code.indexOf('function DynamicWorkspaceComponent()'), code.indexOf('function MyCRMsComponent()'));

console.log('Code length of DynamicWorkspaceComponent:', dwCode.length);

const referencedVars = [
  'li', 'rt', 'nav', 'ws', 'setWs', 'loading', 'setLoading', 'activeTab', 'setActiveTab',
  'records', 'setRecords', 'showRecordModal', 'setShowRecordModal', 'recordTitle',
  'setRecordTitle', 'recordFormData', 'setRecordFormData', 'statusMsg', 'setStatusMsg',
  'customModName', 'customFields', 'handleAddRecord', 'd'
];

referencedVars.forEach(v => {
  const isPresent = dwCode.includes(v);
  console.log(`Var '${v}': ${isPresent ? 'PRESENT' : 'MISSING'}`);
});
