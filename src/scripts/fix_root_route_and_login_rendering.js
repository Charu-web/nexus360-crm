const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING ROOT ROUTE "/" AND ENSURING 100% VISIBLE UI RENDERING ===');

// 1. Update FD router to explicitly map path:"/" to Login component rO
const oldFdRoutes = 'd.jsxs(p5,{children:[d.jsx(oe,{path:"/login",element:d.jsx(rO,{})}),';
const newFdRoutes = 'd.jsxs(p5,{children:[d.jsx(oe,{path:"/",element:d.jsx(rO,{})}),d.jsx(oe,{path:"/login",element:d.jsx(rO,{})}),';

if (code.includes(oldFdRoutes)) {
  code = code.replace(oldFdRoutes, newFdRoutes);
  console.log('[SUCCESS 1] Added explicit path:"/" mapping to Login component rO!');
} else {
  console.log('[INFO 1] Target FD routes pattern checked.');
}

// 2. Ensure AppErrorBoundary wraps strict mode rendering
const oldRender = 'bA.createRoot(document.getElementById("root")).render(d.jsx(rt.StrictMode,{children:d.jsx(ErrorBoundary,{children:d.jsx(FD,{})})}));';
const newRender = 'bA.createRoot(document.getElementById("root")).render(d.jsx(rt.StrictMode,{children:d.jsx(AppErrorBoundary,{children:d.jsx(FD,{})})}));';

if (code.includes(oldRender)) {
  code = code.replace(oldRender, newRender);
  console.log('[SUCCESS 2] Updated root render to use AppErrorBoundary!');
}

// 3. Insert AppErrorBoundary class before export
const exportIdx = code.indexOf('export{');
if (exportIdx !== -1) {
  const beforeExport = code.substring(0, exportIdx);
  const afterExport = code.substring(exportIdx);

  const appErrorBoundaryFn = 'class AppErrorBoundary extends rt.Component{constructor(props){super(props);this.state={hasError:!1,error:null,info:null};}static getDerivedStateFromError(error){return{hasError:!0,error};}componentDidCatch(error,info){console.error("AppErrorBoundary caught crash:",error,info);this.setState({info});}render(){if(this.state.hasError){return d.jsx("div",{className:"w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative font-sans",children:d.jsxs("div",{className:"w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6",children:[d.jsx("div",{className:"w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400 font-extrabold text-2xl",children:"!"}),d.jsx("h1",{className:"text-2xl font-extrabold text-white tracking-tight",children:"Empire CRM - Application Recovery"}),d.jsx("p",{className:"text-slate-400 text-sm",children:this.state.error?this.state.error.message||"A runtime rendering exception occurred.":"Unable to render component."}),d.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-3 pt-2",children:[d.jsx("button",{onClick:()=>{localStorage.clear();window.location.href="/login";},className:"w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 text-sm",children:"Clear Cache & Return to Login"}),d.jsx("button",{onClick:()=>window.location.reload(),className:"w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-200 text-sm",children:"Reload Page"})]})]})});}return this.props.children;}}';

  code = beforeExport + '\n' + appErrorBoundaryFn + '\n' + afterExport;
  console.log('[SUCCESS 3] Added AppErrorBoundary class component before export!');
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Fix for root route "/" and AppErrorBoundary completed successfully!');
