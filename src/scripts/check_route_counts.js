const fs = require('fs');
const curr = fs.readFileSync('assets/index-CMn9DqNx.js', 'utf8');

const settingsRouteCount = (curr.match(/path:"\/settings"/g) || []).length;
const dashboardRouteCount = (curr.match(/path:"\/dashboard"/g) || []).length;
const crmBuilderCount = (curr.match(/path:"\/crm-builder"/g) || []).length;
const settingsStarCount = (curr.match(/path:"\/settings\/\*"/g) || []).length;

console.log('/settings route occurrences:', settingsRouteCount);
console.log('/settings/* route occurrences:', settingsStarCount);
console.log('/dashboard route occurrences:', dashboardRouteCount);
console.log('/crm-builder route occurrences:', crmBuilderCount);

// Check if bundle is valid JS by looking for common parse issues
const openBraces = (curr.match(/\{/g) || []).length;
const closeBraces = (curr.match(/\}/g) || []).length;
console.log('Open braces:', openBraces, 'Close braces:', closeBraces);
console.log('Balance:', openBraces - closeBraces);
