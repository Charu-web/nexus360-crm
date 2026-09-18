const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== REBUILDING CLEAN FD ROUTER FUNCTION ===');

const cleanFdFunction = `function FD(){return d.jsx(G5,{store:GC,children:d.jsx(w5,{basename:window.location.pathname.startsWith("/crmbusiness") ? "/crmbusiness" : "",children:d.jsx(rt.Suspense,{fallback:d.jsx(qD,{}),children:d.jsxs(p5,{children:[
d.jsx(oe,{path:"/settings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/general",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/account",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/web",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/lead",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/hrms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/integrations",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/lead-trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/attributes",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/templates",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/automation",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/settings/automation-rules",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"/custom-module/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),
d.jsx(oe,{path:"/records/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),
d.jsx(oe,{path:"/crm/:crmSlug",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),
d.jsx(oe,{path:"/my-crms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(MyCRMsComponent,{})})})})}),
d.jsx(oe,{path:"/my-crms/:crmId",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),
d.jsx(oe,{path:"/real-estate-crm*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),
d.jsx(oe,{path:"/sales-crm*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),
d.jsx(oe,{path:"/login",element:d.jsx(rO,{})}),
d.jsx(oe,{path:"/signup",element:d.jsx(Zg,{})}),
d.jsx(oe,{path:"/register",element:d.jsx(Zg,{})}),
d.jsx(oe,{path:"/verify-email",element:d.jsx(oO,{})}),
d.jsx(oe,{path:"/forgot-password",element:d.jsx(uO,{})}),
d.jsx(oe,{path:"/reset-password/:token",element:d.jsx(fO,{})}),
d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(CRMBuilderComponent,{})})})})}),
d.jsx(oe,{path:"/dashboard",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),
d.jsx(oe,{path:"/leads",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rx,{})})})}),
d.jsx(oe,{path:"/followups",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rx,{})})})}),
d.jsx(oe,{path:"/call-analyzer",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(MD,{})})})}),
d.jsx(oe,{path:"/reminders",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ND,{})})})}),
d.jsx(oe,{path:"/meetings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(kD,{})})})}),
d.jsx(oe,{path:"/chat",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(lx,{})})})}),
d.jsx(oe,{path:"/whatsapp",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(lx,{})})})}),
d.jsx(oe,{path:"/tasks",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(OD,{})})})}),
d.jsx(oe,{path:"/todo",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(DD,{})})})}),
d.jsx(oe,{path:"/notes",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(zD,{})})})}),
d.jsx(oe,{path:"/projects",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ox,{})})})}),
d.jsx(oe,{path:"/services",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ox,{})})})}),
d.jsx(oe,{path:"/calendar",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(VD,{})})})}),
d.jsx(oe,{path:"/accounting",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ux,{})})})}),
d.jsx(oe,{path:"/payroll",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ux,{})})})}),
d.jsx(oe,{path:"/customers",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(RD,{})})})}),
d.jsx(oe,{path:"/invoices",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(UD,{})})})}),
d.jsx(oe,{path:"/campaigns",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(LD,{})})})}),
d.jsx(oe,{path:"/greetings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(HD,{})})})}),
d.jsx(oe,{path:"/email",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(PD,{})})})}),
d.jsx(oe,{path:"/sms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(BD,{})})})}),
d.jsx(oe,{path:"/hr",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ko,{})})})}),
d.jsx(oe,{path:"/attendance",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AttendanceComponent,{})})})}),
d.jsx(oe,{path:"/leave",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(LeaveRequestsComponent,{})})})}),
d.jsx(oe,{path:"/recruitment",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ko,{})})})}),
d.jsx(oe,{path:"/reports",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(jD,{})})})}),
d.jsx(oe,{path:"/deals",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CD,{})})})}),
d.jsx(oe,{path:"/storage",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),
d.jsx(oe,{path:"/admin",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),
d.jsx(oe,{path:"*",element:d.jsx(_2,{to:"/dashboard",replace:!0})})
]})})})})}`;

const fdStart = code.indexOf('function FD()');
if (fdStart !== -1) {
  const bAStart = code.indexOf('bA.createRoot', fdStart);
  if (bAStart !== -1) {
    code = code.substring(0, fdStart) + cleanFdFunction + '\n' + code.substring(bAStart);
    fs.writeFileSync(bundlePath, code, 'utf8');
    console.log('[SUCCESS] Completely rebuilt clean FD router function!');
  }
}
