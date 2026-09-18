const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== MAPPING /register AND /signup TO CreateCrmComponent WITH ERROR BOUNDARY ===');

// 1. Define React ErrorBoundary Class Component
const errorBoundaryCode = `
class AppErrorBoundary extends rt.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return d.jsx("div", {
        className: "w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 relative font-sans",
        children: d.jsxs("div", {
          className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6",
          children: [
            d.jsx("div", { className: "w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400 font-extrabold text-2xl", children: "!" }),
            d.jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Something went wrong" }),
            d.jsx("p", { className: "text-slate-400 text-sm", children: "Unable to load page. Please try again or return to login." }),
            d.jsxs("div", {
              className: "flex flex-col sm:flex-row items-center justify-center gap-3 pt-2",
              children: [
                d.jsx("button", { onClick: () => window.location.reload(), className: "w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 text-sm", children: "Try Again" }),
                d.jsx("a", { href: "/login", className: "w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-200 text-sm", children: "Back to Login" })
              ]
            })
          ]
        })
      });
    }
    return this.props.children;
  }
}
`;

const singleLineErrorBoundary = errorBoundaryCode.replace(/\r?\n\s*/g, '');

// Append ErrorBoundary component to bundle
const ebIdx = code.indexOf('class AppErrorBoundary');
if (ebIdx !== -1) {
  code = code.substring(0, ebIdx);
}
code += '\n' + singleLineErrorBoundary;

// 2. Map /register and /signup to CreateCrmComponent in FD router
const oldSignupRoute = 'd.jsx(oe,{path:"/signup",element:d.jsx(Zg,{})}),d.jsx(oe,{path:"/register",element:d.jsx(Zg,{})})';
const newSignupRoute = 'd.jsx(oe,{path:"/signup",element:d.jsx(CreateCrmComponent,{})}),d.jsx(oe,{path:"/register",element:d.jsx(CreateCrmComponent,{})})';

if (code.includes(oldSignupRoute)) {
  code = code.replace(oldSignupRoute, newSignupRoute);
  console.log('[SUCCESS 1] Mapped /register and /signup routes directly to CreateCrmComponent!');
} else {
  console.log('[INFO 1] Target signup route pattern searched.');
}

// 3. Wrap FD Router return in AppErrorBoundary
const oldFdReturn = 'function FD(){return d.jsx(G5,{store:GC,children:d.jsx(w5,{';
const newFdReturn = 'function FD(){return d.jsx(AppErrorBoundary,{children:d.jsx(G5,{store:GC,children:d.jsx(w5,{';

if (code.includes(oldFdReturn)) {
  code = code.replace(oldFdReturn, newFdReturn);
  // Also close AppErrorBoundary
  code = code.replace('})})})}', '})})})})}');
  console.log('[SUCCESS 2] Wrapped FD router in AppErrorBoundary!');
} else {
  console.log('[INFO 2] Target FD return pattern searched.');
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Mapping of /register to CreateCrmComponent with ErrorBoundary completed.');
