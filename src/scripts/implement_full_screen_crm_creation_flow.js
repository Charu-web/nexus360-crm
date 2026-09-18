const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== IMPLEMENTING FULL-SCREEN CRM CREATION & SUCCESS SCREEN FLOW ===');

const createCrmFullComponentCode = `
function CreateCrmComponent(){
  const nav = li();
  const { user } = Il();
  const [step, setStep] = rt.useState('form'); // 'form' | 'success'
  const [fName, setFName] = rt.useState('');
  const [cName, setCName] = rt.useState('');
  const [email, setEmail] = rt.useState('');
  const [phone, setPhone] = rt.useState('');
  const [pass, setPass] = rt.useState('');
  const [cPass, setCPass] = rt.useState('');
  const [ind, setInd] = rt.useState('Real Estate');
  const [web, setWeb] = rt.useState('');
  const [logo, setLogo] = rt.useState('');
  const [err, setErr] = rt.useState(null);
  const [loading, setLoading] = rt.useState(!1);
  const [successData, setSuccessData] = rt.useState(null);
  const [copied, setCopied] = rt.useState(!1);

  rt.useEffect(() => {
    const stored = localStorage.getItem('leadflow_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.fullName || u.name) setFName(u.fullName || u.name);
        if (u.email) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
      } catch {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fName.trim()) { setErr('Full Name is required.'); return; }
    if (!cName.trim()) { setErr('Company Name is required.'); return; }
    if (!email.trim() || !/\\S+@\\S+\\.\\S+/.test(email.trim())) { setErr('Valid Email is required.'); return; }
    if (!phone.trim()) { setErr('Mobile Number is required.'); return; }
    if (!pass || pass.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (pass !== cPass) { setErr('Passwords do not match.'); return; }

    setErr(null);
    setLoading(!0);

    try {
      const slug = cName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'my-crm';
      const reqPayload = {
        fullName: fName.trim(),
        companyName: cName.trim(),
        companySlug: slug,
        email: email.trim(),
        phone: phone.trim(),
        password: pass,
        industry: ind,
        website: web.trim(),
        logoUrl: logo.trim(),
        enabledModules: ['LEADS', 'CONTACTS', 'CUSTOMERS', 'DEALS', 'TASKS', 'FOLLOWUPS', 'REPORTS']
      };

      const res = await fetch('/api/v1/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqPayload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create CRM workspace.');
      }

      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data.user) localStorage.setItem('leadflow_user', JSON.stringify(data.user));

      const generatedSlug = (data.data && data.data.workspace && data.data.workspace.slug) || slug;
      const crmUrl = window.location.origin + '/crm/' + generatedSlug;

      setSuccessData({
        companyName: cName.trim(),
        crmName: cName.trim() + ' CRM',
        slug: generatedSlug,
        crmUrl: crmUrl
      });
      setStep('success');
    } catch (hErr) {
      setErr(hErr.message || 'An error occurred while setting up your CRM.');
    } finally {
      setLoading(!1);
    }
  };

  const copyLink = () => {
    if (successData && successData.crmUrl) {
      navigator.clipboard.writeText(successData.crmUrl);
      setCopied(!0);
      setTimeout(() => setCopied(!1), 3000);
    }
  };

  if (step === 'success' && successData) {
    return d.jsx("div", {
      className: "w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative font-sans",
      children: d.jsxs("div", {
        className: "w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6",
        children: [
          d.jsx("div", { className: "w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-4xl", children: "🎉" }),
          d.jsx("h1", { className: "text-3xl font-extrabold text-white tracking-tight", children: "Your CRM is Ready!" }),
          d.jsx("p", { className: "text-slate-400 text-sm", children: "Your workspace has been created and your unique CRM link is live." }),
          d.jsxs("div", {
            className: "bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3",
            children: [
              d.jsxs("div", { children: [d.jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "CRM Workspace" }), d.jsx("p", { className: "text-lg font-bold text-white", children: successData.crmName })] }),
              d.jsxs("div", { children: [d.jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Unique CRM Link" }), d.jsx("p", { className: "text-sm font-mono text-indigo-400 break-all select-all", children: successData.crmUrl })] })
            ]
          }),
          d.jsxs("div", {
            className: "flex flex-col sm:flex-row items-center justify-center gap-3 pt-2",
            children: [
              d.jsx("button", { onClick: copyLink, className: "w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-200 border border-slate-700 text-sm", children: copied ? "Copied! ✓" : "Copy Link" }),
              d.jsx("a", { href: "/crm/" + successData.slug, className: "w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 text-sm", children: "Open CRM" }),
              d.jsx("a", { href: "/dashboard", className: "w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/30 text-sm", children: "Continue to Dashboard" })
            ]
          })
        ]
      })
    });
  }

  return d.jsxs("div", {
    className: "w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative font-sans",
    children: [
      d.jsxs(Os, { to: "/login", className: "absolute top-6 left-6 text-slate-400 hover:text-white font-semibold text-sm flex items-center gap-2 transition-colors", children: [d.jsx("span", { children: "←" }), " Back to Login"] }),
      d.jsxs("div", {
        className: "w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 my-8",
        children: [
          d.jsxs("div", {
            className: "text-center space-y-2",
            children: [
              d.jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-2 text-indigo-400 font-extrabold text-xl", children: "E" }),
              d.jsx("h1", { className: "text-3xl font-extrabold text-white tracking-tight", children: "Create Your CRM" }),
              d.jsx("p", { className: "text-slate-400 text-sm", children: "Set up your multi-tenant workspace and start managing your business." })
            ]
          }),
          err && d.jsx("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold text-center", children: err }),
          d.jsxs("form", {
            onSubmit: handleSubmit, className: "space-y-5", noValidate: !0,
            children: [
              d.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                children: [
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Full Name *" }), d.jsx("input", { type: "text", value: fName, onChange: (e) => setFName(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm", placeholder: "Jane Doe", required: !0 })] }),
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Company Name *" }), d.jsx("input", { type: "text", value: cName, onChange: (e) => setCName(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm", placeholder: "ABC Technologies", required: !0 })] })
                ]
              }),
              d.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                children: [
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Email Address *" }), d.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm", placeholder: "jane@company.com", required: !0 })] }),
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Mobile Number *" }), d.jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm", placeholder: "+1 (555) 000-0000", required: !0 })] })
                ]
              }),
              d.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                children: [
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Password *" }), d.jsx("input", { type: "password", value: pass, onChange: (e) => setPass(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm", placeholder: "••••••••", required: !0 })] }),
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Confirm Password *" }), d.jsx("input", { type: "password", value: cPass, onChange: (e) => setCPass(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm", placeholder: "••••••••", required: !0 })] })
                ]
              }),
              d.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                children: [
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Industry (Optional)" }), d.jsxs("select", { value: ind, onChange: (e) => setInd(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-sm", children: [d.jsx("option", { value: "Real Estate", children: "Real Estate" }), d.jsx("option", { value: "Technology", children: "Technology & Software" }), d.jsx("option", { value: "Financial Services", children: "Financial Services" }), d.jsx("option", { value: "Healthcare", children: "Healthcare & Medical" }), d.jsx("option", { value: "Retail", children: "Retail & E-commerce" }), d.jsx("option", { value: "Consulting", children: "Professional Consulting" })] })] }),
                  d.jsxs("div", { children: [d.jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2", children: "Company Website (Optional)" }), d.jsx("input", { type: "url", value: web, onChange: (e) => setWeb(e.target.value), className: "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm", placeholder: "https://example.com" })] })
                ]
              }),
              d.jsx("button", { type: "submit", disabled: loading, className: "w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 text-sm tracking-wide uppercase mt-4 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? "Creating Your CRM..." : "Create My CRM" })
            ]
          }),
          d.jsx("div", { className: "text-center pt-4 text-xs text-slate-500 font-medium", children: "Securely powered by Supabase Auth & Multi-Tenant Engine" })
        ]
      })
    ]
  });
}
`;

const singleLineComponent = createCrmFullComponentCode.replace(/\r?\n\s*/g, '');

// Replace existing CreateCrmComponent in bundle
const cIdx = code.indexOf('function CreateCrmComponent()');
if (cIdx !== -1) {
  code = code.substring(0, cIdx);
}

code += '\n' + singleLineComponent;

// Also add /crm/:slug route in FD router if missing
const crmSlugRoute = 'd.jsx(oe,{path:"/crm/:slug",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),';
if (!code.includes('/crm/:slug')) {
  const targetFdRoute = 'd.jsx(oe,{path:"/dashboard",';
  code = code.replace(targetFdRoute, crmSlugRoute + targetFdRoute);
  console.log('[SUCCESS 1] Added /crm/:slug route to FD router!');
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Successfully updated full-screen CreateCrmComponent and success screen!');
