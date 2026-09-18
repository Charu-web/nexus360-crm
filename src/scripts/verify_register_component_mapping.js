const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CHECKING ROUTER FOR /register AND /create-crm ===');

const registerRouteIdx = code.indexOf('path:"/register"');
console.log('path:"/register" found at:', registerRouteIdx);

if (registerRouteIdx !== -1) {
  console.log(code.substring(registerRouteIdx - 50, registerRouteIdx + 150));
}
