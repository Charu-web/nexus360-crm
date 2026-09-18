const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== APPLYING SURGICAL AUTHENTICATION FIXES TO PRISTINE BUNDLE ===');

// 1. Remove catch fallback to El in QR (login function)
const catchElInQr = `catch{const s=zS().find(l=>l.email.toLowerCase()===t||l.phone&&l.phone.includes(t));if(s){if(s.password!==n)throw new Error("Invalid email/mobile or password.");const l={id:s.id,name:s.name,email:s.email,tenantId:s.tenantId||"ws-1",role:{id:s.roleId||"user",name:s.roleName||"User",permissions:["*"]}};return localStorage.setItem("accessToken","local-user-token-"+s.id),localStorage.setItem("leadflow_user",JSON.stringify(l)),l}throw new Error("Invalid email/mobile or password.")}`;

if (code.includes(catchElInQr)) {
  code = code.replace(catchElInQr, `catch(err){localStorage.removeItem("accessToken");localStorage.removeItem("leadflow_user");throw err;}`);
  console.log('[SUCCESS 1] Removed catch fallback to mock users in QR login function!');
} else {
  console.log('[INFO 1] Target QR catch pattern searched.');
}

// 2. Remove catch fallback in IR (profile function)
const catchElInIr = `catch(e){const t=localStorage.getItem("leadflow_user");if(t)try{return JSON.parse(t)}catch{return El}if(localStorage.getItem("accessToken"))return El;throw e}`;
const cleanIrCatch = `catch(e){localStorage.removeItem("accessToken");localStorage.removeItem("leadflow_user");throw e}`;

if (code.includes(catchElInIr)) {
  code = code.replace(catchElInIr, cleanIrCatch);
  console.log('[SUCCESS 2] Removed catch fallback in IR profile function!');
} else {
  console.log('[INFO 2] Target IR catch pattern searched.');
}

// 3. Remove catch fallback in Il() AuthContext
const catchElInIl = `catch(()=>{e(wo(El))})`;
const cleanIlCatch = `catch(()=>{localStorage.removeItem("accessToken");localStorage.removeItem("leadflow_user");e(Iy())})`;

if (code.includes(catchElInIl)) {
  code = code.replace(catchElInIl, cleanIlCatch);
  console.log('[SUCCESS 3] Removed catch fallback to El in AuthContext!');
} else {
  console.log('[INFO 3] Target Il catch pattern searched.');
}

// 4. Remove unverified leadflow_user auto-login in Il()
const autoLoginLeadflowUser = `const r=localStorage.getItem("accessToken"),l=localStorage.getItem("leadflow_user");if(l)try{e(wo(JSON.parse(l)));return}catch{}if(!r){e(Iy());return}`;
const cleanAuthCheck = `const r=localStorage.getItem("accessToken");if(!r){localStorage.removeItem("leadflow_user");e(Iy());return}`;

if (code.includes(autoLoginLeadflowUser)) {
  code = code.replace(autoLoginLeadflowUser, cleanAuthCheck);
  console.log('[SUCCESS 4] Removed unverified leadflow_user auto-login in AuthContext!');
} else {
  console.log('[INFO 4] Target autoLoginLeadflowUser pattern searched.');
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Surgical authentication fix completed.');
