const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING DynamicWorkspaceComponent IN BUNDLE ===');

const dwIdx = code.indexOf('function DynamicWorkspaceComponent()');
console.log('function DynamicWorkspaceComponent() found at:', dwIdx);
if (dwIdx !== -1) {
  console.log(code.substring(dwIdx, dwIdx + 1500));
}
