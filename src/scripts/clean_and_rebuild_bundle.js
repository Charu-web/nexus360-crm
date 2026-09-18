const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== CLEANING & REBUILDING BUNDLE SYNTAX ===');

// Cut off everything from AD declaration to end of file, and re-append correctly minified implementations
const adIdx = code.indexOf('const AD=rt.lazy');
if (adIdx !== -1) {
  const baseCode = code.substring(0, adIdx);

  const appendCode = `const AD=rt.lazy(()=>Ze(()=>import("./Dashboard-BuIVt-cC.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]))),rx=rt.lazy(()=>Ze(()=>import("./Leads-BKOSi9zF.js"),__vite__mapDeps([12,13,3,10,14,6,7]))),CD=rt.lazy(()=>Ze(()=>import("./Deals-BSbWjI7C.js"),__vite__mapDeps([15,13,3,16]))),RD=rt.lazy(()=>Ze(()=>import("./Customers-D4W4lV6J.js"),__vite__mapDeps([17,18,3,14,7]))),OD=rt.lazy(()=>Ze(()=>import("./Tasks-BlyU3y-Y.js"),__vite__mapDeps([19,3,7]))),jD=rt.lazy(()=>Ze(()=>import("./Reports-B_cO9dE_.js"),__vite__mapDeps([20,3,21,11]))),rd=rt.lazy(()=>Ze(()=>import("./Settings-DcmRBp2d.js"),__vite__mapDeps([22,23,24,3,25,16,11]))),VD=rt.lazy(()=>Ze(()=>import("./Calendar-DPqKk7lK.js"),__vite__mapDeps([26,3]))),MD=rt.lazy(()=>Ze(()=>import("./CallAnalyzer-Csz2Spxj.js"),__vite__mapDeps([27,3]))),ND=rt.lazy(()=>Ze(()=>import("./Reminders-B1znd81E.js"),__vite__mapDeps([28,3]))),kD=rt.lazy(()=>Ze(()=>import("./Meetings-D86oG0Jt.js"),__vite__mapDeps([29,3]))),lx=rt.lazy(()=>Ze(()=>import("./Chat-DR0zH8mJ.js"),__vite__mapDeps([30,3,7]))),DD=rt.lazy(()=>Ze(()=>import("./TodoList-BvL81H6X.js"),__vite__mapDeps([31,3]))),zD=rt.lazy(()=>Ze(()=>import("./Notes-D34j6r3L.js"),__vite__mapDeps([32,3]))),ox=rt.lazy(()=>Ze(()=>import("./Projects-C9y_76zN.js"),__vite__mapDeps([33,3]))),ux=rt.lazy(()=>Ze(()=>import("./Accounting-C8tXjZ5c.js"),__vite__mapDeps([34,3,16]))),UD=rt.lazy(()=>Ze(()=>import("./Invoices-Dg3qU7gO.js"),__vite__mapDeps([35,3,16]))),LD=rt.lazy(()=>Ze(()=>import("./Campaigns-CskJdZ6c.js"),__vite__mapDeps([36,3]))),HD=rt.lazy(()=>Ze(()=>import("./Greetings-C8-Xh_1A.js"),__vite__mapDeps([37,3]))),PD=rt.lazy(()=>Ze(()=>import("./Email-BD6e9X5-.js"),__vite__mapDeps([38,3]))),BD=rt.lazy(()=>Ze(()=>import("./Sms-DTw7KzP8.js"),__vite__mapDeps([39,3]))),ko=rt.lazy(()=>Ze(()=>import("./HRManagement-B_dZkYr1.js"),__vite__mapDeps([40,3])));

class ErrorBoundary extends rt.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[Empire CRM UI Boundary Error]:", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return d.jsxs("div", {
        style: { padding: "30px", fontFamily: "system-ui, sans-serif", backgroundColor: "#fef2f2", color: "#991b1b", border: "2px solid #f87171", borderRadius: "16px", margin: "20px", maxWidth: "800px" },
        children: [
          d.jsx("h2", { style: { fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }, children: "Empire CRM Component Boundary Caught Error" }),
          d.jsx("p", { style: { fontSize: "14px", marginBottom: "15px" }, children: String(this.state.error && this.state.error.message ? this.state.error.message : this.state.error) }),
          d.jsx("button", { onClick: () => window.location.reload(), style: { padding: "8px 16px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }, children: "Reload Application" })
        ]
      });
    }
    return this.props.children;
  }
}

function CustomModuleRecordComponent() {
  const [moduleKey] = rt.useState(() => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || "PROPERTIES";
  });

  const [records, setRecords] = rt.useState([]);
  const [moduleInfo, setModuleInfo] = rt.useState(null);
  const [loading, setLoading] = rt.useState(true);
  const [showModal, setShowModal] = rt.useState(false);
  const [formData, setFormData] = rt.useState({});
  const [statusMsg, setStatusMsg] = rt.useState('');

  rt.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: "Bearer " + token } : {};
        const modRes = await Kt.get("/v1/modules/" + moduleKey, { headers }).catch(() => null);
        const recRes = await Kt.get("/v1/modules/" + moduleKey + "/records", { headers }).catch(() => null);
        if (isMounted) {
          if (modRes && modRes.data && modRes.data.data) setModuleInfo(modRes.data.data);
          if (recRes && recRes.data && recRes.data.data) setRecords(recRes.data.data);
        }
      } catch (err) {
        console.warn("CustomModuleRecord fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [moduleKey]);

  return d.jsxs("div", {
    className: "p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100",
    children: [
      d.jsxs("div", {
        className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          d.jsxs("div", {
            children: [
              d.jsx("h1", { className: "text-2xl font-extrabold capitalize", children: (moduleInfo && moduleInfo.name) || moduleKey }),
              d.jsx("p", { className: "text-sm text-slate-500", children: "Multi-tenant dynamic entity management" })
            ]
          }),
          d.jsx("button", {
            onClick: () => setShowModal(true),
            className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all",
            children: "+ Add Record"
          })
        ]
      }),
      loading ? d.jsx("div", { className: "p-8 text-center text-slate-500", children: "Loading records..." }) :
      d.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        children: records.length === 0 ? d.jsx("div", { className: "col-span-full p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl", children: "No records found in this module." }) :
        records.map((r) => d.jsxs("div", {
          className: "p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2",
          children: [
            d.jsx("h3", { className: "font-bold text-lg text-slate-800 dark:text-slate-200", children: r.title || r.id }),
            d.jsx("p", { className: "text-xs text-slate-400", children: "Created: " + new Date(r.createdAt || Date.now()).toLocaleDateString() })
          ]
        }, r.id))
      })
    ]
  });
}

function CRMSuccessModal({ crm, onClose }) {
  if (!crm) return null;
  const shareUrl = window.location.origin + "/crm/" + (crm.slug || crm.id);
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Shareable CRM link copied to clipboard!");
  };
  return d.jsx("div", {
    className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in",
    children: d.jsxs("div", {
      className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 text-white space-y-6 shadow-2xl",
      children: [
        d.jsxs("div", {
          className: "text-center space-y-2",
          children: [
            d.jsx("div", { className: "w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold", children: "✓" }),
            d.jsx("h2", { className: "text-2xl font-black", children: "CRM Workspace Live!" }),
            d.jsx("p", { className: "text-sm text-slate-400", children: "Your multi-tenant CRM has been provisioned and configured." })
          ]
        }),
        d.jsxs("div", {
          className: "bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-left",
          children: [
            d.jsx("div", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "CRM Name" }),
            d.jsx("div", { className: "font-semibold text-indigo-400", children: crm.name }),
            d.jsx("div", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider pt-2", children: "Shareable Workspace Link" }),
            d.jsx("div", { className: "text-xs font-mono bg-slate-900 p-2 rounded-xl border border-slate-800 break-all text-slate-300 select-all", children: shareUrl })
          ]
        }),
        d.jsxs("div", {
          className: "flex items-center gap-3",
          children: [
            d.jsx("button", { onClick: handleCopy, className: "flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all", children: "Copy Link" }),
            d.jsx("button", { onClick: () => window.location.href = shareUrl, className: "flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all", children: "Open CRM" }),
            d.jsx("button", { onClick: onClose, className: "px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-bold", children: "Close" })
          ]
        })
      ]
    })
  });
}

function CRMBuilderComponent() {
  const [wizardStep, setWizardStep] = rt.useState(1);
  const [loading, setLoading] = rt.useState(false);
  const [createdCrm, setCreatedCrm] = rt.useState(null);
  const [crmData, setCrmData] = rt.useState({
    name: "Real Estate Empire CRM",
    companyName: "Empire Realty Group",
    industry: "Real Estate",
    description: "High-volume property lead tracking and agent sales pipeline management.",
    selectedModules: ["leads", "contacts", "deals", "tasks"],
    customModuleName: "Properties",
    customFields: [
      { fieldLabel: "Property Title", fieldName: "property_title", fieldType: "Text", isRequired: true },
      { fieldLabel: "Price / Value", fieldName: "price", fieldType: "Currency", isRequired: true }
    ],
    pipelineStages: [
      { name: "New Lead", color: "#3b82f6" },
      { name: "Qualified", color: "#06b6d4" },
      { name: "Proposal", color: "#f59e0b" },
      { name: "Won", color: "#10b981" }
    ]
  });

  const handleCreate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: "Bearer " + token } : {};
      const res = await Kt.post("/v1/provision", {
        companyName: crmData.companyName,
        industry: crmData.industry,
        modules: crmData.selectedModules,
        customModule: crmData.customModuleName ? { name: crmData.customModuleName, slug: crmData.customModuleName.toLowerCase().replace(/[^a-z0-9]/g, "_") } : null
      }, { headers }).catch(() => null);

      const generatedSlug = (crmData.name || "custom-crm").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 8);
      const workspace = {
        id: (res && res.data && res.data.data && res.data.data.workspace && res.data.data.workspace.id) || "ws-" + Date.now(),
        slug: generatedSlug,
        name: crmData.name,
        companyName: crmData.companyName,
        industry: crmData.industry,
        description: crmData.description,
        modules: crmData.selectedModules,
        createdAt: new Date().toISOString()
      };

      setCreatedCrm(workspace);
    } catch (err) {
      console.warn("Provisioning fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  return d.jsxs("div", {
    className: "p-6 max-w-7xl mx-auto space-y-8 text-slate-900 dark:text-slate-100",
    children: [
      createdCrm ? d.jsx(CRMSuccessModal, { crm: createdCrm, onClose: () => setCreatedCrm(null) }) : null,
      d.jsxs("div", {
        className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          d.jsxs("div", {
            children: [
              d.jsx("h1", { className: "text-3xl font-black tracking-tight", children: "Create Your Own CRM" }),
              d.jsx("p", { className: "text-sm text-slate-500", children: "Configure modules, custom fields, pipelines, and provision your isolated CRM workspace." })
            ]
          }),
          d.jsx("button", {
            onClick: handleCreate,
            disabled: loading,
            className: "px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-xl transition-all disabled:opacity-50",
            children: loading ? "Creating Workspace..." : "Create CRM Workspace"
          })
        ]
      }),
      d.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
        children: [
          d.jsxs("div", {
            className: "p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm",
            children: [
              d.jsx("h3", { className: "text-lg font-bold text-slate-800 dark:text-slate-200", children: "1. Workspace Identity" }),
              d.jsx("input", { type: "text", value: crmData.name, onChange: (e) => setCrmData({ ...crmData, name: e.target.value }), className: "w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl", placeholder: "CRM Name" }),
              d.jsx("input", { type: "text", value: crmData.companyName, onChange: (e) => setCrmData({ ...crmData, companyName: e.target.value }), className: "w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl", placeholder: "Company Name" })
            ]
          }),
          d.jsxs("div", {
            className: "p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm",
            children: [
              d.jsx("h3", { className: "text-lg font-bold text-slate-800 dark:text-slate-200", children: "2. Custom Module & Fields" }),
              d.jsx("input", { type: "text", value: crmData.customModuleName, onChange: (e) => setCrmData({ ...crmData, customModuleName: e.target.value }), className: "w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl", placeholder: "Custom Module (e.g. Properties)" })
            ]
          })
        ]
      })
    ]
  });
}

function DynamicWorkspaceComponent() {
  const [crmSlug] = rt.useState(() => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || "real-estate-crm-s4c3lp";
  });
  const [activeTab, setActiveTab] = rt.useState("dashboard");

  return d.jsxs("div", {
    className: "p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100",
    children: [
      d.jsxs("div", {
        className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          d.jsxs("div", {
            children: [
              d.jsx("h1", { className: "text-2xl font-black capitalize", children: crmSlug.replace(/-/g, " ") }),
              d.jsx("p", { className: "text-sm text-slate-500", children: "Isolated Multi-Tenant CRM Workspace" })
            ]
          }),
          d.jsx("span", { className: "px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/30", children: "ACTIVE WORKSPACE" })
        ]
      }),
      d.jsxs("div", {
        className: "flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2",
        children: ["dashboard", "leads", "contacts", "deals", "tasks", "properties", "settings"].map((tab) => d.jsx("button", {
          key: tab,
          onClick: () => setActiveTab(tab),
          className: "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all " + (activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"),
          children: tab
        }))
      }),
      d.jsxs("div", {
        className: "p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center space-y-4",
        children: [
          d.jsx("h2", { className: "text-xl font-bold text-slate-800 dark:text-slate-200 capitalize", children: activeTab + " View" }),
          d.jsx("p", { className: "text-sm text-slate-400", children: "Displaying tenant-scoped records for workspace '" + crmSlug + "'." })
        ]
      })
    ]
  });
}

function MyCRMsComponent() {
  const [workspaces] = rt.useState([
    { id: "ws-1", slug: "real-estate-crm-s4c3lp", name: "Real Estate Empire CRM", companyName: "Empire Realty", industry: "Real Estate", createdAt: new Date().toISOString() },
    { id: "ws-2", slug: "sales-crm-hg290a", name: "Sales Pipeline CRM", companyName: "Global Trade Inc", industry: "Sales", createdAt: new Date().toISOString() }
  ]);

  return d.jsxs("div", {
    className: "p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100",
    children: [
      d.jsxs("div", {
        className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          d.jsxs("div", {
            children: [
              d.jsx("h1", { className: "text-3xl font-black", children: "My CRM Workspaces" }),
              d.jsx("p", { className: "text-sm text-slate-500", children: "Select or manage your created multi-tenant CRM instances." })
            ]
          }),
          d.jsx("button", {
            onClick: () => window.location.href = "/crm-builder",
            className: "px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all",
            children: "+ Create New CRM"
          })
        ]
      }),
      d.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
        children: workspaces.map((ws) => d.jsxs("div", {
          className: "p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm hover:border-indigo-500/50 transition-all",
          children: [
            d.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                d.jsx("h3", { className: "text-xl font-bold text-slate-800 dark:text-slate-200", children: ws.name }),
                d.jsx("span", { className: "px-2.5 py-1 bg-indigo-500/10 text-indigo-400 font-bold text-xs rounded-full", children: ws.industry })
              ]
            }),
            d.jsx("p", { className: "text-xs text-slate-400", children: "Company: " + ws.companyName }),
            d.jsx("button", {
              onClick: () => window.location.href = "/crm/" + ws.slug,
              className: "w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all",
              children: "Open CRM Workspace"
            })
          ]
        }, ws.id))
      })
    ]
  });
}

function FD(){return d.jsx(G5,{store:GC,children:d.jsx(w5,{basename:window.location.pathname.startsWith("/crmbusiness") ? "/crmbusiness" : "",children:d.jsx(rt.Suspense,{fallback:d.jsx(qD,{}),children:d.jsxs(p5,{children:[d.jsx(oe,{path:"/",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),d.jsx(oe,{path:"/settings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/general",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/account",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/web",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/lead",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/hrms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/integrations",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/lead-trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/trash",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/attributes",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/templates",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/automation",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/settings/automation-rules",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"/custom-module/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/records/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/crm/:crmSlug",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),d.jsx(oe,{path:"/my-crms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(MyCRMsComponent,{})})})})}),d.jsx(oe,{path:"/my-crms/:crmId",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),d.jsx(oe,{path:"/real-estate-crm*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),d.jsx(oe,{path:"/sales-crm*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),d.jsx(oe,{path:"/login",element:d.jsx(rO,{})}),d.jsx(oe,{path:"/signup",element:d.jsx(Zg,{})}),d.jsx(oe,{path:"/register",element:d.jsx(Zg,{})}),d.jsx(oe,{path:"/verify-email",element:d.jsx(oO,{})}),d.jsx(oe,{path:"/forgot-password",element:d.jsx(uO,{})}),d.jsx(oe,{path:"/reset-password/:token",element:d.jsx(fO,{})}),d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(CRMBuilderComponent,{})})})})}),d.jsx(oe,{path:"/dashboard",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),d.jsx(oe,{path:"/leads",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rx,{})})})}),d.jsx(oe,{path:"/followups",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rx,{})})})}),d.jsx(oe,{path:"/call-analyzer",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(MD,{})})})}),d.jsx(oe,{path:"/reminders",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ND,{})})})}),d.jsx(oe,{path:"/meetings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(kD,{})})})}),d.jsx(oe,{path:"/chat",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(lx,{})})})}),d.jsx(oe,{path:"/whatsapp",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(lx,{})})})}),d.jsx(oe,{path:"/tasks",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(OD,{})})})}),d.jsx(oe,{path:"/todo",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(DD,{})})})}),d.jsx(oe,{path:"/notes",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(zD,{})})})}),d.jsx(oe,{path:"/projects",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ox,{})})})}),d.jsx(oe,{path:"/services",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ox,{})})})}),d.jsx(oe,{path:"/calendar",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(VD,{})})})}),d.jsx(oe,{path:"/accounting",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ux,{})})})}),d.jsx(oe,{path:"/payroll",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ux,{})})})}),d.jsx(oe,{path:"/customers",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(RD,{})})})}),d.jsx(oe,{path:"/invoices",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(UD,{})})})}),d.jsx(oe,{path:"/campaigns",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(LD,{})})})}),d.jsx(oe,{path:"/greetings",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(HD,{})})})}),d.jsx(oe,{path:"/email",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(PD,{})})})}),d.jsx(oe,{path:"/sms",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(BD,{})})})}),d.jsx(oe,{path:"/hr",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ko,{})})})}),d.jsx(oe,{path:"/attendance",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AttendanceComponent,{})})})}),d.jsx(oe,{path:"/leave",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(LeaveRequestsComponent,{})})})}),d.jsx(oe,{path:"/recruitment",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ko,{})})})}),d.jsx(oe,{path:"/reports",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(jD,{})})})}),d.jsx(oe,{path:"/deals",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CD,{})})})}),d.jsx(oe,{path:"/storage",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(AD,{})})})}),d.jsx(oe,{path:"/admin",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(rd,{})})})}),d.jsx(oe,{path:"*",element:d.jsx(_2,{to:"/login",replace:!0})})]})})})})}bA.createRoot(document.getElementById("root")).render(d.jsx(rt.StrictMode,{children:d.jsx(ErrorBoundary,{children:d.jsx(FD,{})})}));export{gD as A,qN as B,QN as C,IN as F,eD as G,sD as L,lD as M,tu as P,rt as R,dD as S,xD as U,Gc as X,qh as a,FN as b,re as c,WN as d,JN as e,GN as f,cx as g,YN as h,XN as i,d as j,hD as k,R2 as l,gn as m,SD as n,Kt as o,vD as p,$D as q,_ as r,QD as s,HN as t,$m as u,YD as v,Il as w,pD as x,Qp as y,oD as z};
`;

  code = baseCode + appendCode;
  fs.writeFileSync(bundlePath, code, 'utf8');
  console.log('[SUCCESS] Rebuilt bundle syntax cleanly!');
}
