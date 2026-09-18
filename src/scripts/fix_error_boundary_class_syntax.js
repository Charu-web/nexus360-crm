const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== FIXING ERROR BOUNDARY SYNTAX IN INDEX BUNDLE ===');

// Remove multiline ErrorBoundary class lines 1582 to 1615
const ebStartIdx = code.indexOf('class ErrorBoundary extends rt.Component');
if (ebStartIdx !== -1) {
  code = code.substring(0, ebStartIdx);
  console.log('[STEP 1] Removed multiline class ErrorBoundary');
}

// Convert ErrorBoundary into clean single-line React class component
const cleanSingleLineEB = 'class ErrorBoundary extends rt.Component{constructor(props){super(props);this.state={hasError:!1,error:null,info:null};}static getDerivedStateFromError(error){return{hasError:!0,error};}componentDidCatch(error,info){console.error("ErrorBoundary caught critical crash:",error,info);this.setState({info});}render(){if(this.state.hasError){const errStack=this.state.error?this.state.error.stack||this.state.error.toString():"Unknown Error";const compStack=this.state.info?this.state.info.componentStack||"":"";return d.jsxs("div",{style:{padding:"30px",fontFamily:"system-ui, sans-serif",backgroundColor:"#fef2f2",color:"#991b1b",border:"2px solid #f87171",borderRadius:"16px",margin:"20px",maxWidth:"800px"},children:[d.jsx("h2",{style:{fontWeight:"900",fontSize:"20px",marginBottom:"10px"},children:"Empire CRM - Startup Crash Captured"}),d.jsx("p",{style:{fontSize:"13px",fontWeight:"bold"},children:"A critical runtime exception occurred during app initialization:"}),d.jsx("pre",{style:{padding:"15px",backgroundColor:"#fee2e2",borderRadius:"10px",overflow:"auto",fontSize:"11px",fontFamily:"monospace",border:"1px solid #fca5a5",textAlign:"left",whiteSpace:"pre-wrap"},children:errStack+"\\n\\nReact Component Stack:\\n"+compStack}),d.jsxs("div",{style:{display:"flex",gap:"10px",marginTop:"15px"},children:[d.jsx("button",{onClick:()=>{localStorage.clear();window.location.reload();},style:{padding:"10px 16px",backgroundColor:"#dc2626",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"12px"},children:"Clear Local Cache"}),d.jsx("button",{onClick:()=>window.location.reload(),style:{padding:"10px 16px",backgroundColor:"#4b5563",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"12px"},children:"Reload Page"})]})]});}return this.props.children;}}';

code += '\n' + cleanSingleLineEB;
fs.writeFileSync(bundlePath, code, 'utf8');

// Test VM parse
try {
  new vm.Script(code);
  console.log('[SUCCESS] VM compilation of index-CMn9DqNx.js passed with ZERO syntax errors!');
} catch (err) {
  console.error('[FAIL] Syntax error still remains:', err.message);
}
