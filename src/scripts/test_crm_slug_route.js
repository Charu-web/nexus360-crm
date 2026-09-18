const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== TESTING CRM SLUG ROUTE IN BUNDLE ===');

const routeTarget = `path:"/crm/:crmSlug"`;
const dwTarget = `function DynamicWorkspaceComponent()`;

console.log('Route target exists:', code.includes(routeTarget));
console.log('DynamicWorkspaceComponent exists:', code.includes(dwTarget));

const dwIdx = code.indexOf(dwTarget);
if (dwIdx !== -1) {
  console.log('DynamicWorkspaceComponent snippet:');
  console.log(code.substring(dwIdx, dwIdx + 800));
}
