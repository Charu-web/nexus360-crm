const fs = require('fs');
const path = require('path');
const vm = require('vm');

const pristinePath = path.join(__dirname, '../../../empire_crm_multitenant_saas_deploy/assets/index-CMn9DqNx.js');
const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');

if (fs.existsSync(pristinePath)) {
  fs.copyFileSync(pristinePath, bundlePath);
  console.log('[RESTORE] Restored pristine index-CMn9DqNx.js');
}

let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING DOUBLE-QUOTE IMPORT SYNTAX ERROR (import("" -> import(") ===');

// 1. Clean Q3 Login Function (Remove mock fallbacks)
const q3Target = `Q3=async e=>{const t=(e.email||e.emailOrMobile||"").trim().toLowerCase(),n=e.password;try{const{data:a}=await Kt.post("/auth/login",{email:t,password:e.password,rememberMe:e.rememberMe});return a!=null&&a.accessToken?localStorage.setItem("accessToken",a.accessToken):localStorage.setItem("accessToken","demo-local-token"),a!=null&&a.user&&localStorage.setItem("leadflow_user",JSON.stringify(a.user)),a.user}catch{const s=zS().find(l=>l.email.toLowerCase()===t||l.phone&&l.phone.includes(t));if(s){if(s.password!==n)throw new Error("Invalid email/mobile or password.");const l={id:s.id,name:s.name,email:s.email,role:{id:"user-role",name:"User",permissions:["*"]}};return localStorage.setItem("accessToken","demo-token-"+s.id),localStorage.setItem("leadflow_user",JSON.stringify(l)),l}const r={...El,name:t.includes("@")?t.split("@")[0]:"Admin User",email:t||El.email};return localStorage.setItem("accessToken","demo-local-token"),localStorage.setItem("leadflow_user",JSON.stringify(r)),r}}`;

const q3Replacement = `Q3=async e=>{const t=(e.email||e.emailOrMobile||"").trim().toLowerCase(),n=e.password;const{data:a}=await Kt.post("/auth/login",{email:t,password:n,rememberMe:e.rememberMe});if(a&&a.accessToken){localStorage.setItem("accessToken",a.accessToken)}if(a&&a.user){localStorage.setItem("leadflow_user",JSON.stringify(a.user))}return a.user}`;

if (code.includes(q3Target)) {
  code = code.replace(q3Target, q3Replacement);
  console.log('[SUCCESS 1] Replaced Q3 login function!');
}

// 2. Convert relative dynamic imports to root-absolute /assets/ paths WITH PROPER SINGLE QUOTES
const importRegex = /import\((['"])\.\/([^'"]+)\1\)/g;
let importCount = 0;
code = code.replace(importRegex, (match, p1, p2) => {
  importCount++;
  return `import("/assets/${p2}")`;
});
console.log(`[SUCCESS 2] Converted ${importCount} relative dynamic imports to root-absolute import("/assets/file.js")!`);

// 3. Enhance Login Page link ("New to Empire CRM? Create Your CRM →")
const oldLinkStr = 'children:["New on our platform?"," ",d.jsx(Os,{to:"/signup",className:"crm-create-account-link",id:"crm-create-account-link",children:"Create an account"})]';
const newLinkStr = 'children:["New to Empire CRM?"," ",d.jsx(Os,{to:"/register",className:"crm-create-account-link font-bold text-indigo-600 hover:text-indigo-500",id:"crm-create-account-link",children:"Create Your CRM →"})]';

if (code.includes(oldLinkStr)) {
  code = code.replace(oldLinkStr, newLinkStr);
  console.log('[SUCCESS 3] Enhanced Login page link!');
}

// 4. Update Zg signup component to redirect to /create-crm
const oldZgRedirect = 'try{await t({emailOrMobile:p.email.trim(),password:p.password}),e("/dashboard",{replace:!0})}';
const newZgRedirect = 'try{await t({emailOrMobile:p.email.trim(),password:p.password}),e("/create-crm",{replace:!0})}';

if (code.includes(oldZgRedirect)) {
  code = code.replace(oldZgRedirect, newZgRedirect);
  console.log('[SUCCESS 4] Updated Zg signup component!');
}

// 5. Register /create-crm, /create-company, /crm/:slug, /settings/general, and explicit path:"/" in FD router
const targetFdRoute = 'd.jsx(oe,{path:"/dashboard",';
const replacementFdRoute = 'd.jsx(oe,{path:"/",element:d.jsx(rO,{})}),d.jsx(oe,{path:"/create-crm",element:d.jsx(CreateCrmComponent,{})}),d.jsx(oe,{path:"/create-company",element:d.jsx(CreateCrmComponent,{})}),d.jsx(oe,{path:"/crm/:slug",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),d.jsx(oe,{path:"/settings/general",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/dashboard",';

if (code.includes(targetFdRoute)) {
  code = code.replace(targetFdRoute, replacementFdRoute);
  console.log('[SUCCESS 5] Registered explicit path:"/", /create-crm, /crm/:slug routes in FD router!');
}

// 6. Map /register and /signup to CreateCrmComponent
const oldSignupRoute = 'd.jsx(oe,{path:"/signup",element:d.jsx(Zg,{})}),d.jsx(oe,{path:"/register",element:d.jsx(Zg,{})})';
const newSignupRoute = 'd.jsx(oe,{path:"/signup",element:d.jsx(CreateCrmComponent,{})}),d.jsx(oe,{path:"/register",element:d.jsx(CreateCrmComponent,{})})';

if (code.includes(oldSignupRoute)) {
  code = code.replace(oldSignupRoute, newSignupRoute);
  console.log('[SUCCESS 6] Mapped /register and /signup routes to CreateCrmComponent!');
}

// 7. Update pristine root render statement to use AppErrorBoundary
const pristineRender = 'bA.createRoot(document.getElementById("root")).render(d.jsx(rt.StrictMode,{children:d.jsx(ErrorBoundary,{children:d.jsx(FD,{})})}));';
const updatedRender = 'bA.createRoot(document.getElementById("root")).render(d.jsx(rt.StrictMode,{children:d.jsx(AppErrorBoundary,{children:d.jsx(FD,{})})}));';

if (code.includes(pristineRender)) {
  code = code.replace(pristineRender, updatedRender);
  console.log('[SUCCESS 7] Updated root render statement to use AppErrorBoundary!');
}

// 8. Define CreateCrmComponent and AppErrorBoundary right BEFORE bA.createRoot
const createRootIdx = code.indexOf('bA.createRoot');
if (createRootIdx !== -1) {
  const beforeMount = code.substring(0, createRootIdx);
  const afterMount = code.substring(createRootIdx);

  const createCrmFn = 'function CreateCrmComponent(){const nav=li();const {user}=Il();const [step,setStep]=rt.useState("form");const [fName,setFName]=rt.useState("");const [cName,setCName]=rt.useState("");const [email,setEmail]=rt.useState("");const [phone,setPhone]=rt.useState("");const [pass,setPass]=rt.useState("");const [cPass,setCPass]=rt.useState("");const [ind,setInd]=rt.useState("Real Estate");const [web,setWeb]=rt.useState("");const [err,setErr]=rt.useState(null);const [loading,setLoading]=rt.useState(!1);const [successData,setSuccessData]=rt.useState(null);const [copied,setCopied]=rt.useState(!1);rt.useEffect(()=>{const stored=localStorage.getItem("leadflow_user");if(stored){try{const u=JSON.parse(stored);if(u.fullName||u.name)setFName(u.fullName||u.name);if(u.email)setEmail(u.email);if(u.phone)setPhone(u.phone);}catch{}}},[]);const handleSubmit=async(e)=>{e.preventDefault();if(!fName.trim()){setErr("Full Name is required.");return;}if(!cName.trim()){setErr("Company Name is required.");return;}if(!email.trim()||!/\\S+@\\S+\\.\\S+/.test(email.trim())){setErr("Valid Email is required.");return;}if(!phone.trim()){setErr("Mobile Number is required.");return;}if(!pass||pass.length<8){setErr("Password must be at least 8 characters.");return;}if(pass!==cPass){setErr("Passwords do not match.");return;}setErr(null);setLoading(!0);try{const slug=cName.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"my-crm";const reqPayload={fullName:fName.trim(),companyName:cName.trim(),companySlug:slug,email:email.trim(),phone:phone.trim(),password:pass,industry:ind,website:web.trim(),enabledModules:["LEADS","CONTACTS","CUSTOMERS","DEALS","TASKS","FOLLOWUPS","REPORTS"]};const res=await fetch("/api/v1/provision",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(reqPayload)});const data=await res.json();if(!res.ok||!data.success){throw new Error(data.message||"Failed to create CRM workspace.");}if(data.accessToken)localStorage.setItem("accessToken",data.accessToken);if(data.user)localStorage.setItem("leadflow_user",JSON.stringify(data.user));const generatedSlug=(data.data&&data.data.workspace&&data.data.workspace.slug)||slug;const crmUrl=window.location.origin+"/crm/"+generatedSlug;setSuccessData({companyName:cName.trim(),crmName:cName.trim()+" CRM",slug:generatedSlug,crmUrl:crmUrl});setStep("success");}catch(hErr){setErr(hErr.message||"An error occurred while setting up your CRM.");}finally{setLoading(!1);}};const copyLink=()=>{if(successData&&successData.crmUrl){navigator.clipboard.writeText(successData.crmUrl);setCopied(!0);setTimeout(()=>setCopied(!1),3000);}};if(step==="success"&&successData){return d.jsx("div",{className:"w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative font-sans",children:d.jsxs("div",{className:"w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6",children:[d.jsx("div",{className:"w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-4xl",children:"🎉"}),d.jsx("h1",{className:"text-3xl font-extrabold text-white tracking-tight",children:"Your CRM is Ready!"}),d.jsx("p",{className:"text-slate-400 text-sm",children:"Your workspace has been created and your unique CRM link is live."}),d.jsxs("div",{className:"bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3",children:[d.jsxs("div",{children:[d.jsx("span",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wider",children:"CRM Workspace"}),d.jsx("p",{className:"text-lg font-bold text-white",children:successData.crmName})]}),d.jsxs("div",{children:[d.jsx("span",{className:"text-xs font-semibold text-slate-500 uppercase tracking-wider",children:"Unique CRM Link"}),d.jsx("p",{className:"text-sm font-mono text-indigo-400 break-all select-all",children:successData.crmUrl})]})]}),d.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-3 pt-2",children:[d.jsx("button",{onClick:copyLink,className:"w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-200 border border-slate-700 text-sm",children:copied?"Copied! ✓":"Copy Link"}),d.jsx("a",{href:"/crm/"+successData.slug,className:"w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 text-sm",children:"Open CRM"}),d.jsx("a",{href:"/dashboard",className:"w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/30 text-sm",children:"Continue to Dashboard"})]})]})});}return d.jsxs("div",{className:"w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative font-sans",children:[d.jsxs(Os,{to:"/login",className:"absolute top-6 left-6 text-slate-400 hover:text-white font-semibold text-sm flex items-center gap-2 transition-colors",children:[d.jsx("span",{children:"←"})," Back to Login"]}),d.jsxs("div",{className:"w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 my-8",children:[d.jsxs("div",{className:"text-center space-y-2",children:[d.jsx("div",{className:"inline-flex items-center justify-center w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-2 text-indigo-400 font-extrabold text-xl",children:"E"}),d.jsx("h1",{className:"text-3xl font-extrabold text-white tracking-tight",children:"Create Your CRM"}),d.jsx("p",{className:"text-slate-400 text-sm",children:"Set up your multi-tenant workspace and start managing your business."})]}),err&&d.jsx("div",{className:"p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold text-center",children:err}),d.jsxs("form",{onSubmit:handleSubmit,className:"space-y-5",noValidate:!0,children:[d.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Full Name *"}),d.jsx("input",{type:"text",value:fName,onChange:(e)=>setFName(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm",placeholder:"Jane Doe",required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Company Name *"}),d.jsx("input",{type:"text",value:cName,onChange:(e)=>setCName(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm",placeholder:"ABC Technologies",required:!0})]})]}),d.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Email Address *"}),d.jsx("input",{type:"email",value:email,onChange:(e)=>setEmail(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm",placeholder:"jane@company.com",required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Mobile Number *"}),d.jsx("input",{type:"tel",value:phone,onChange:(e)=>setPhone(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm",placeholder:"+1 (555) 000-0000",required:!0})]})]}),d.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Password *"}),d.jsx("input",{type:"password",value:pass,onChange:(e)=>setPass(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm",placeholder:"••••••••",required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Confirm Password *"}),d.jsx("input",{type:"password",value:cPass,onChange:(e)=>setCPass(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm",placeholder:"••••••••",required:!0})]})]}),d.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Industry (Optional)"}),d.jsxs("select",{value:ind,onChange:(e)=>setInd(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm",children:[d.jsx("option",{value:"Real Estate",children:"Real Estate"}),d.jsx("option",{value:"Technology",children:"Technology & Software"}),d.jsx("option",{value:"Financial Services",children:"Financial Services"}),d.jsx("option",{value:"Healthcare",children:"Healthcare & Medical"}),d.jsx("option",{value:"Retail",children:"Retail & E-commerce"}),d.jsx("option",{value:"Consulting",children:"Professional Consulting"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2",children:"Company Website (Optional)"}),d.jsx("input",{type:"url",value:web,onChange:(e)=>setWeb(e.target.value),className:"w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm",placeholder:"https://example.com"})})]})]}),d.jsx("button",{type:"submit",disabled:loading,className:"w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 text-sm tracking-wide uppercase mt-4 disabled:opacity-50 disabled:cursor-not-allowed",children:loading?"Creating Your CRM...":"Create My CRM"})]})]}),d.jsx("div",{className:"text-center pt-4 text-xs text-slate-500 font-medium",children:"Securely powered by Supabase Auth & Multi-Tenant Engine"})]})]});}';

  const appErrorBoundaryFn = 'class AppErrorBoundary extends rt.Component{constructor(props){super(props);this.state={hasError:!1,error:null,info:null};}static getDerivedStateFromError(error){return{hasError:!0,error};}componentDidCatch(error,info){console.error("AppErrorBoundary caught crash:",error,info);this.setState({info});}render(){if(this.state.hasError){return d.jsx("div",{className:"w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative font-sans",children:d.jsxs("div",{className:"w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6",children:[d.jsx("div",{className:"w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400 font-extrabold text-2xl",children:"!"}),d.jsx("h1",{className:"text-2xl font-extrabold text-white tracking-tight",children:"Empire CRM - Application Recovery"}),d.jsx("p",{className:"text-slate-400 text-sm",children:this.state.error?this.state.error.message||"A runtime rendering exception occurred.":"Unable to render component."}),d.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-3 pt-2",children:[d.jsx("button",{onClick:()=>{localStorage.clear();window.location.href="/login";},className:"w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 text-sm",children:"Clear Cache & Return to Login"}),d.jsx("button",{onClick:()=>window.location.reload(),className:"w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-200 text-sm",children:"Reload Page"})]})]})});}return this.props.children;}}';

  code = beforeMount + '\n' + createCrmFn + '\n' + appErrorBoundaryFn + '\n' + afterMount;
  console.log('[SUCCESS 8] Placed CreateCrmComponent and AppErrorBoundary BEFORE bA.createRoot mount statement!');
}

fs.writeFileSync(bundlePath, code, 'utf8');

// Test VM compile
try {
  new vm.Script(code);
  console.log('====================================================');
  console.log(' [PASS] Node VM compiled index-CMn9DqNx.js with ZERO SYNTAX ERRORS!');
  console.log('====================================================');
} catch (err) {
  console.error('[FAIL] Syntax error:', err.message);
}
