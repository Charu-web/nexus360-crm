const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING "CREATE YOUR CRM" LINK IN LOGIN COMPONENT ===');

const rOIdx = code.indexOf('function rO(');
if (rOIdx !== -1) {
  const snippet = code.substring(rOIdx, rOIdx + 2000);
  console.log('Includes /register or /signup:', snippet.includes('/register') || snippet.includes('/signup'));
  console.log('Includes "Create":', snippet.includes('Create'));
}
