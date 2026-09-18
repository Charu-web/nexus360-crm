const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

const targetSnippet = `e(PC());I3().then(o=>e(wo(o))).catch(()=>{localStorage.removeItem("accessToken");localStorage.removeItem("leadflow_user");e(Iy())})`;
const replacementSnippet = `e(PC());const tId=setTimeout(()=>{localStorage.removeItem("accessToken");e(Iy());},4000);I3().then(o=>{clearTimeout(tId);e(wo(o))}).catch(()=>{clearTimeout(tId);localStorage.removeItem("accessToken");localStorage.removeItem("leadflow_user");e(Iy())})`;

if (code.includes(targetSnippet)) {
  code = code.replace(targetSnippet, replacementSnippet);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('Successfully enhanced useAuth resilience with 4s timeout fallback!');
} else {
  console.log('Target snippet already updated or not found.');
}
