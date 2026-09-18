const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING REAL AUTHENTICATION FLOW & REMOVING ALL MOCK LOGIN BYPASSES ===');

// 1. Fix QR (login function): Remove catch fallback to El/demo-local-token
const oldQrSnippet = code.substring(code.indexOf('QR=async e=>'), code.indexOf('QR=async e=>') + 600);
console.log('Original QR snippet:');
console.log(oldQrSnippet);

// Replace QR with strict implementation that NEVER catches 401/errors to return fake users
const cleanQrFunction = `QR=async e=>{const t=(e.email||e.emailOrMobile||"").trim().toLowerCase(),n=e.password;const{data:a}=await Kt.post("/auth/login",{email:t,password:n,rememberMe:e.rememberMe});if(a&&a.accessToken){localStorage.setItem("accessToken",a.accessToken)}if(a&&a.user){localStorage.setItem("leadflow_user",JSON.stringify(a.user))}return a.user}`;

const qrStart = code.indexOf('QR=async e=>');
if (qrStart !== -1) {
  const nextFnStart = code.indexOf('IR=async', qrStart);
  if (nextFnStart !== -1) {
    // Find boundary of QR
    const boundary = code.indexOf('},IR=async', qrStart);
    if (boundary !== -1) {
      code = code.substring(0, qrStart) + cleanQrFunction + code.substring(boundary);
      console.log('[SUCCESS] Replaced QR login function with strict backend-verified authentication!');
    }
  }
}

// 2. Fix IR (get profile function): Remove fallback to El on error
const cleanIrFunction = `IR=async()=>{const token=localStorage.getItem("accessToken");if(!token)throw new Error("No token");const{data:e}=await Kt.get("/auth/me");if(e&&e.user)return e.user;throw new Error("Invalid session")}`;

const irStart = code.indexOf('IR=async()=>');
if (irStart !== -1) {
  const boundary = code.indexOf('},VS=async', irStart);
  if (boundary !== -1) {
    code = code.substring(0, irStart) + cleanIrFunction + code.substring(boundary);
    console.log('[SUCCESS] Replaced IR profile verification function with strict token verification!');
  }
}

// 3. Fix Il (AuthContext effect): Remove catch fallback to El
const ilStart = code.indexOf('function Il()');
if (ilStart !== -1) {
  const ilEnd = code.indexOf('return{user:t', ilStart);
  if (ilEnd !== -1) {
    const catchElStr = 'catch(()=>{e(wo(El))})';
    const catchCleanStr = 'catch(()=>{localStorage.removeItem("accessToken");localStorage.removeItem("leadflow_user");e(Iy())})';
    if (code.includes(catchElStr)) {
      code = code.replace(catchElStr, catchCleanStr);
      console.log('[SUCCESS] Replaced AuthContext catch fallback to clear session instead of setting El!');
    }
  }
}

// 4. Remove automatic leadflow_user restoration without token verification in Il()
const leadflowUserAutoLogin = `const r=localStorage.getItem("accessToken"),l=localStorage.getItem("leadflow_user");if(l)try{e(wo(JSON.parse(l)));return}catch{}if(!r){e(Iy());return}`;
const cleanTokenValidation = `const r=localStorage.getItem("accessToken");if(!r){localStorage.removeItem("leadflow_user");e(Iy());return}`;

if (code.includes(leadflowUserAutoLogin)) {
  code = code.replace(leadflowUserAutoLogin, cleanTokenValidation);
  console.log('[SUCCESS] Removed unverified leadflow_user auto-login in AuthContext!');
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Real authentication flow fix script completed.');
