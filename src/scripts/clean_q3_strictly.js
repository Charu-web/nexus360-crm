const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CLEANING Q3 STRICTLY WITHOUT BREAKING SYNTAX ===');

const q3Target = `Q3=async e=>{const t=(e.email||e.emailOrMobile||"").trim().toLowerCase(),n=e.password;try{const{data:a}=await Kt.post("/auth/login",{email:t,password:e.password,rememberMe:e.rememberMe});return a!=null&&a.accessToken?localStorage.setItem("accessToken",a.accessToken):localStorage.setItem("accessToken","demo-local-token"),a!=null&&a.user&&localStorage.setItem("leadflow_user",JSON.stringify(a.user)),a.user}catch{const s=zS().find(l=>l.email.toLowerCase()===t||l.phone&&l.phone.includes(t));if(s){if(s.password!==n)throw new Error("Invalid email/mobile or password.");const l={id:s.id,name:s.name,email:s.email,role:{id:"user-role",name:"User",permissions:["*"]}};return localStorage.setItem("accessToken","demo-token-"+s.id),localStorage.setItem("leadflow_user",JSON.stringify(l)),l}const r={...El,name:t.includes("@")?t.split("@")[0]:"Admin User",email:t||El.email};return localStorage.setItem("accessToken","demo-local-token"),localStorage.setItem("leadflow_user",JSON.stringify(r)),r}}`;

const q3Replacement = `Q3=async e=>{const t=(e.email||e.emailOrMobile||"").trim().toLowerCase(),n=e.password;const{data:a}=await Kt.post("/auth/login",{email:t,password:n,rememberMe:e.rememberMe});if(a&&a.accessToken){localStorage.setItem("accessToken",a.accessToken)}if(a&&a.user){localStorage.setItem("leadflow_user",JSON.stringify(a.user))}return a.user}`;

if (code.includes(q3Target)) {
  code = code.replace(q3Target, q3Replacement);
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Replaced Q3 login function cleanly with ZERO syntax error!');
} else {
  console.log('q3Target not found.');
}
