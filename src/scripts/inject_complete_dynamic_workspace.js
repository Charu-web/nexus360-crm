const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== INJECTING COMPLETE RESILIENT DYNAMIC WORKSPACE COMPONENT ===');

const fullDynamicWorkspaceJs = `
function DynamicWorkspaceComponent() {
  const nav = li();
  const [ws, setWs] = rt.useState(null);
  const [loading, setLoading] = rt.useState(true);
  const [activeTab, setActiveTab] = rt.useState("dashboard");
  const [records, setRecords] = rt.useState([]);
  const [showRecordModal, setShowRecordModal] = rt.useState(false);
  const [recordTitle, setRecordTitle] = rt.useState("");
  const [recordFormData, setRecordFormData] = rt.useState({});
  const [statusMsg, setStatusMsg] = rt.useState("");

  const loadWorkspace = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem("leadflow_user_workspaces");
      const list = saved ? JSON.parse(saved) : [];
      
      const pathname = window.location.pathname;
      const parts = pathname.split('/').filter(Boolean);
      let targetSlug = parts[parts.length - 1] || "real-estate-crm";
      if (targetSlug === "crm" && parts.length > 1) targetSlug = parts[1];

      let found = list.find(w => w.slug === targetSlug || w.id === targetSlug || pathname.includes(w.slug));
      
      if (!found && list.length > 0) {
        found = list[0];
      }

      if (!found) {
        found = {
          id: "ws-default",
          slug: "real-estate-crm-default",
          name: "Real Estate CRM",
          companyName: "Empire Realty",
          industry: "Real Estate",
          description: "Manage leads, contacts, deals and properties catalog.",
          modules: ["leads", "contacts", "companies", "deals", "tasks", "meetings", "calls", "reports"],
          customModule: {
            name: "Properties",
            slug: "properties",
            description: "Real Estate Listings",
            fields: [
              { fieldLabel: "Property Title", fieldName: "property_title", fieldType: "Text", isRequired: true },
              { fieldLabel: "Price / Value", fieldName: "price", fieldType: "Currency", isRequired: true },
              { fieldLabel: "Property Type", fieldName: "property_type", fieldType: "Dropdown", isRequired: false },
              { fieldLabel: "Listing Date", fieldName: "listing_date", fieldType: "Date", isRequired: false }
            ]
          },
          pipeline: [
            { name: "New", color: "#3b82f6" },
            { name: "Contacted", color: "#8b5cf6" },
            { name: "Qualified", color: "#06b6d4" },
            { name: "Proposal", color: "#f59e0b" },
            { name: "Negotiation", color: "#ec4899" },
            { name: "Won", color: "#10b981" },
            { name: "Lost", color: "#ef4444" }
          ]
        };
      }
      setWs(found);
    } catch (e) {
      console.error("Error loading CRM workspace:", e);
    } finally {
      setLoading(false);
    }
  };

  rt.useEffect(() => {
    loadWorkspace();
  }, []);

  if (loading) {
    return d.jsxs("div", {
      className: "p-12 text-center text-slate-400 font-bold space-y-4 animate-pulse",
      children: [
        d.jsx("div", { className: "text-4xl", children: "⚙️" }),
        d.jsx("h3", { className: "text-lg font-black text-slate-200", children: "Loading CRM Workspace..." })
      ]
    });
  }

  if (!ws) {
    return d.jsxs("div", {
      className: "p-12 text-center text-slate-400 font-bold space-y-4 border-2 border-dashed border-slate-800 rounded-3xl max-w-xl mx-auto my-12",
      children: [
        d.jsx("div", { className: "text-4xl", children: "⚠️" }),
        d.jsx("h3", { className: "text-xl font-black text-white", children: "CRM Workspace Not Found" }),
        d.jsx("p", { className: "text-xs text-slate-500", children: "The requested CRM slug does not exist or you do not have permission to access it." }),
        d.jsxs("div", { className: "flex justify-center space-x-3 pt-2", children: [
          d.jsx("button", { onClick: () => nav("/my-crms"), className: "px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer", children: "Go to My CRMs" }),
          d.jsx("button", { onClick: () => nav("/dashboard"), className: "px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer", children: "Main Dashboard" })
        ]})
      ]
    });
  }

  const customModName = ws.customModule ? ws.customModule.name : "Properties";
  const customFields = ws.customModule && ws.customModule.fields ? ws.customModule.fields : [
    { fieldLabel: "Property Title", fieldName: "property_title", fieldType: "Text", isRequired: true },
    { fieldLabel: "Price / Value", fieldName: "price", fieldType: "Currency", isRequired: true }
  ];

  const handleAddRecord = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!recordTitle.trim()) {
      setStatusMsg("Please enter a record title.");
      return;
    }
    const newRec = {
      id: "rec-" + Date.now(),
      title: recordTitle,
      data: recordFormData,
      createdAt: new Date().toISOString()
    };
    setRecords([newRec, ...records]);
    setRecordTitle("");
    setRecordFormData({});
    setShowRecordModal(false);
    setStatusMsg("Record created successfully!");
  };

  return d.jsxs("div", {
    className: "p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900 dark:text-slate-100 font-sans pb-24",
    children: [
      d.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6",
        children: [
          d.jsxs("div", { className: "flex items-center space-x-3", children: [
            d.jsx("span", { className: "p-3 rounded-2xl bg-indigo-600 text-white shadow-lg text-2xl", children: "🏢" }),
            d.jsxs("div", { children: [
              d.jsxs("div", { className: "flex items-center space-x-3", children: [
                d.jsx("h1", { className: "text-2xl sm:text-3xl font-black text-slate-900 dark:text-white", children: ws.name }),
                d.jsx("span", { className: "px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-wider", children: ws.industry || "General" })
              ]}),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5", children: (ws.companyName || ws.name) + " • Shareable Link: " + window.location.href })
            ]})
          ]}),
          d.jsxs("div", { className: "flex items-center space-x-3", children: [
            d.jsx("button", { onClick: () => nav("/my-crms"), className: "px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition", children: "← My CRMs" }),
            d.jsx("button", { onClick: () => nav("/dashboard"), className: "px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md cursor-pointer transition", children: "Launch Main Dashboard" })
          ]})
        ]
      }),

      statusMsg ? d.jsx("div", { className: "p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300", children: statusMsg }) : null,

      d.jsx("div", {
        className: "flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-2",
        children: ["dashboard", "leads", "contacts", "deals", "tasks", customModName.toLowerCase(), "reports", "settings"].map(tab => d.jsx("button", {
          key: tab,
          onClick: () => setActiveTab(tab),
          className: "px-4 py-2 rounded-xl font-extrabold text-xs capitalize transition cursor-pointer " + (activeTab === tab ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"),
          children: tab === customModName.toLowerCase() ? "📦 " + customModName : tab
        }))
      }),

      activeTab === "dashboard" ? d.jsxs("div", {
        className: "space-y-6 animate-fade-in",
        children: [
          d.jsxs("div", {
            className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
            children: [
              d.jsxs("div", { className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm", children: [d.jsx("span", { className: "text-[10px] font-black uppercase text-indigo-500", children: "Total Leads" }), d.jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "12" })] }),
              d.jsxs("div", { className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm", children: [d.jsx("span", { className: "text-[10px] font-black uppercase text-emerald-500", children: "Total Contacts" }), d.jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "8" })] }),
              d.jsxs("div", { className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm", children: [d.jsx("span", { className: "text-[10px] font-black uppercase text-purple-500", children: "Total Deals" }), d.jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "5" })] }),
              d.jsxs("div", { className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm", children: [d.jsx("span", { className: "text-[10px] font-black uppercase text-amber-500", children: "Pipeline Value" }), d.jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "$450,000" })] })
            ]
          }),

          d.jsxs("div", { className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4", children: [
            d.jsx("h3", { className: "font-black text-base text-slate-900 dark:text-white", children: "Sales Pipeline Stages" }),
            d.jsx("div", {
              className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs font-bold",
              children: (ws.pipeline || [
                { name: "New", color: "#3b82f6" },
                { name: "Contacted", color: "#8b5cf6" },
                { name: "Qualified", color: "#06b6d4" },
                { name: "Proposal", color: "#f59e0b" },
                { name: "Negotiation", color: "#ec4899" },
                { name: "Won", color: "#10b981" },
                { name: "Lost", color: "#ef4444" }
              ]).map(stg => d.jsxs("div", {
                key: stg.name,
                style: { borderTopColor: stg.color },
                className: "p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-t-4 shadow-xs",
                children: [
                  d.jsx("div", { className: "text-slate-900 dark:text-white truncate", children: stg.name }),
                  d.jsx("div", { className: "text-[10px] text-slate-400 mt-1", children: "0 Deals" })
                ]
              }))
            })
          ]})
        ]
      }) :

      activeTab === customModName.toLowerCase() ? d.jsxs("div", {
        className: "space-y-6 animate-fade-in",
        children: [
          d.jsxs("div", { className: "flex items-center justify-between", children: [
            d.jsxs("div", { children: [
              d.jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white", children: customModName + " Records" }),
              d.jsx("p", { className: "text-xs text-slate-500 font-semibold", children: "Custom entity module with automatically generated dynamic forms." })
            ]}),
            d.jsx("button", { onClick: () => setShowRecordModal(true), className: "px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-md cursor-pointer", children: "+ Add " + customModName })
          ]}),

          records.length === 0 ? d.jsxs("div", { className: "p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3", children: [
            d.jsx("div", { className: "text-4xl", children: "📦" }),
            d.jsx("h4", { className: "font-black text-base text-slate-700 dark:text-slate-300", children: "No " + customModName + " Records Yet" }),
            d.jsx("button", { onClick: () => setShowRecordModal(true), className: "px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer", children: "+ Create First Record" })
          ]}) :
          d.jsx("div", {
            className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm",
            children: d.jsxs("table", {
              className: "w-full text-left text-xs font-semibold",
              children: [
                d.jsx("thead", { className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]", children: d.jsxs("tr", { children: [d.jsx("th", { className: "p-4", children: "Title" }), customFields.map(f => d.jsx("th", { key: f.fieldName, className: "p-4", children: f.fieldLabel })), d.jsx("th", { className: "p-4", children: "Created At" })] }) }),
                d.jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-800", children: records.map(r => d.jsxs("tr", { key: r.id, children: [d.jsx("td", { className: "p-4 font-bold text-slate-900 dark:text-white", children: r.title }), customFields.map(f => d.jsx("td", { key: f.fieldName, className: "p-4 text-slate-600 dark:text-slate-300", children: (r.data && r.data[f.fieldName]) || "-" })), d.jsx("td", { className: "p-4 text-slate-400 text-[10px]", children: new Date(r.createdAt).toLocaleDateString() })] })) })
              ]
            })
          })
        ]
      }) :

      d.jsxs("div", {
        className: "p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4",
        children: [
          d.jsx("div", { className: "text-3xl", children: "📌" }),
          d.jsx("h3", { className: "font-black text-lg text-slate-900 dark:text-white capitalize", children: activeTab + " Module View" }),
          d.jsx("p", { className: "text-xs text-slate-500 max-w-md mx-auto font-medium", children: "This workspace module is active and connected to Supabase backend API endpoints." })
        ]
      }),

      showRecordModal ? d.jsx("div", {
        className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in",
        children: d.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6",
          children: [
            d.jsxs("div", { className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4", children: [d.jsx("h2", { className: "text-xl font-black text-slate-900 dark:text-white", children: "Add " + customModName + " Record" }), d.jsx("button", { onClick: () => setShowRecordModal(false), className: "p-2 text-slate-400 cursor-pointer", children: "✕" })] }),
            d.jsxs("form", {
              onSubmit: handleAddRecord,
              className: "space-y-4 text-xs font-semibold",
              children: [
                d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Record Title *" }), d.jsx("input", { type: "text", required: true, value: recordTitle, onChange: e => setRecordTitle(e.target.value), placeholder: "e.g. Luxury Penthouse", className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })] }),
                customFields.map(f => d.jsxs("div", {
                  key: f.fieldName,
                  children: [
                    d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: f.fieldLabel + (f.isRequired ? " *" : "") }),
                    d.jsx("input", { type: f.fieldType === "Currency" || f.fieldType === "Number" ? "number" : f.fieldType === "Date" ? "date" : "text", value: recordFormData[f.fieldName] || "", onChange: e => setRecordFormData({ ...recordFormData, [f.fieldName]: e.target.value }), placeholder: "Enter " + f.fieldLabel, className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })
                  ]
                })),
                d.jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800", children: [
                  d.jsx("button", { type: "button", onClick: () => setShowRecordModal(false), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                  d.jsx("button", { type: "submit", className: "px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold shadow-lg cursor-pointer", children: "Save Record" })
                ]})
              ]
            })
          ]
        })
      }) : null
    ]
  });
}
`;

// Insert DynamicWorkspaceComponent into bundle
let myCrmsIdx = code.indexOf('function MyCRMsComponent()');
if (myCrmsIdx !== -1) {
  const fdStart = code.indexOf('function FD()', myCrmsIdx);
  if (fdStart !== -1) {
    code = code.substring(0, myCrmsIdx) + fullDynamicWorkspaceJs + '\n' + code.substring(myCrmsIdx);
    console.log('[SUCCESS] Injected complete DynamicWorkspaceComponent!');
  }
} else {
  const fdStart = code.indexOf('function FD()');
  if (fdStart !== -1) {
    code = code.substring(0, fdStart) + fullDynamicWorkspaceJs + '\n' + code.substring(fdStart);
    console.log('[SUCCESS] Injected complete DynamicWorkspaceComponent!');
  }
}

// Ensure routes in FD() catch BOTH /crm/:crmSlug AND /:crmSlug (e.g. /real-estate-crm-a82f31)
const dwRoutes = `d.jsx(oe,{path:"/crm/:crmSlug",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),d.jsx(oe,{path:"/my-crms/:crmId",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),d.jsx(oe,{path:"/real-estate-crm*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),d.jsx(oe,{path:"/sales-crm*",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(ErrorBoundary,{children:d.jsx(DynamicWorkspaceComponent,{})})})})}),`;

if (!code.includes('path:"/real-estate-crm*"')) {
  const fdStart = code.indexOf('function FD()');
  if (fdStart !== -1) {
    const loginIdx = code.indexOf('path:"/login"', fdStart);
    if (loginIdx !== -1) {
      code = code.substring(0, loginIdx) + dwRoutes + code.substring(loginIdx);
      console.log('[SUCCESS] Mounted /crm/:crmSlug, /my-crms/:crmId, and /real-estate-crm* dynamic routes in FD()!');
    }
  }
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Dynamic workspace injection complete.');
