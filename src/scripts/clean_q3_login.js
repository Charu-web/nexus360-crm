const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CLEANING Q3 LOGIN FUNCTION IN BUNDLE ===');

const q3Start = code.indexOf('Q3=async e=>{');
console.log('Q3=async e=>{ found at:', q3Start);

if (q3Start !== -1) {
  const catchStart = code.indexOf('catch{const s=zS()', q3Start);
  if (catchStart !== -1) {
    const endCatch = code.indexOf('throw new Error("Invalid email/mobile or password.")}', catchStart);
    if (endCatch !== -1) {
      const fullCatch = code.substring(catchStart, endCatch + 'throw new Error("Invalid email/mobile or password.")}'.length);
      const cleanCatch = 'catch(err){localStorage.removeItem("accessToken");localStorage.removeItem("leadflow_user");throw err;}';
      code = code.replace(fullCatch, cleanCatch);
      
      // Also remove fallback to "demo-local-token"
      code = code.replace(':localStorage.setItem("accessToken","demo-local-token")', '');

      fs.writeFileSync(bundlePath, code, 'utf8');
      console.log('[SUCCESS] Cleaned Q3 login function! Removed all mock user fallbacks and demo tokens.');
    }
  }
}
