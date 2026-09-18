const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== INSPECTING REGISTRATION SUCCESS HANDLER AND ROUTES ===');

// Check for signup/register component function Zg
const zgIdx = code.indexOf('function Zg(');
if (zgIdx !== -1) {
  console.log('Zg function found at index:', zgIdx);
  console.log(code.substring(zgIdx, zgIdx + 1200));
}
