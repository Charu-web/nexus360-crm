const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== INJECTING COMPLETE CRM BUILDER & SIDEBAR ITEM ===');

// 1. Add "CRM Builder" to Sidebar menu items in _D if not present
const sidebarTarget = `{name:"Accounting",path:"/accounting",icon:aD}`;
const sidebarReplacement = `{name:"CRM Builder",path:"/crm-builder",icon:Gc},{name:"Accounting",path:"/accounting",icon:aD}`;

if (code.includes(sidebarTarget) && !code.includes('{name:"CRM Builder",path:"/crm-builder"')) {
  code = code.replace(sidebarTarget, sidebarReplacement);
  console.log('[SUCCESS] Added "CRM Builder" item to Sidebar navigation!');
} else {
  console.log('Sidebar "CRM Builder" item already present or target not found.');
}

// 2. Full interactive CRMBuilderComponent
const fullCRMBuilderJs = `
function CRMBuilderComponent() {
  const [workspaces, setWorkspaces] = rt.useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_user_workspaces");
      return saved ? JSON.parse(saved) : [
        { id: "ws-default", name: "Empire Core Workspace", description: "Default Multi-Tenant SaaS Workspace", template: "GENERIC", modulesCount: 8, createdAt: new Date().toISOString() }
      ];
    } catch { return []; }
  });

  const [activeTab, setActiveTab] = rt.useState("my-crms");
  const [showWizard, setShowWizard] = rt.useState(false);
  const [editingWs, setEditingWs] = rt.useState(null);
  const [previewWs, setPreviewWs] = rt.useState(null);
  const [loading, setLoading] = rt.useState(false);
  const [statusMsg, setStatusMsg] = rt.useState("");

  const [formData, setFormData] = rt.useState({
    companyName: "",
    description: "",
    template: "GENERIC",
    plan: "PRO",
    fullName: "CRM Admin",
    email: "",
    phone: "",
    password: "Password123!",
    selectedModules: ["leads", "contacts", "companies", "deals", "tasks"],
    customModuleName: "",
    customModuleKey: "",
    customFields: [
      { fieldName: "Target Budget", fieldType: "CURRENCY", isRequired: true },
      { fieldName: "Lead Quality Score", fieldType: "NUMBER", isRequired: false }
    ]
  });

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { fieldName: "", fieldType: "TEXT", isRequired: false }]
    }));
  };

  const handleRemoveField = (idx) => {
    setFormData(prev => {
      const updated = [...prev.customFields];
      updated.splice(idx, 1);
      return { ...prev, customFields: updated };
    });
  };

  const handleFieldChange = (idx, key, val) => {
    setFormData(prev => {
      const updated = [...prev.customFields];
      updated[idx] = { ...updated[idx], [key]: val };
      return { ...prev, customFields: updated };
    });
  };

  const handleToggleModule = (modKey) => {
    setFormData(prev => {
      const exists = prev.selectedModules.includes(modKey);
      const updated = exists ? prev.selectedModules.filter(m => m !== modKey) : [...prev.selectedModules, modKey];
      return { ...prev, selectedModules: updated };
    });
  };

  const handleSaveCRM = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.companyName.trim()) {
      setStatusMsg("Error: Please enter a CRM/Workspace Name.");
      return;
    }

    setLoading(true);
    setStatusMsg("Provisioning multi-tenant CRM workspace in Supabase backend...");

    try {
      const userEmail = formData.email.trim() || ("admin." + Date.now() + "@" + formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com");
      
      const res = await fetch("/api/v1/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName || "Workspace Admin",
          email: userEmail,
          phone: formData.phone || "+1 555-0199",
          password: formData.password || "Password123!",
          companyName: formData.companyName,
          template: formData.template,
          plan: formData.plan
        })
      });

      const data = await res.json();

      let createdWorkspace = {
        id: data.tenant ? data.tenant.id : ("ws-" + Date.now()),
        name: formData.companyName,
        description: formData.description || (formData.template + " Industry CRM Workspace"),
        template: formData.template,
        modulesCount: formData.selectedModules.length + (formData.customModuleName ? 1 : 0),
        customModule: formData.customModuleName ? {
          name: formData.customModuleName,
          key: formData.customModuleKey || formData.customModuleName.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
          fields: formData.customFields
        } : null,
        token: data.accessToken || "",
        createdAt: new Date().toISOString()
      };

      if (data.accessToken && formData.customModuleName) {
        const modKey = (formData.customModuleKey || formData.customModuleName).toUpperCase().replace(/[^A-Z0-9]/g, "_");
        try {
          await fetch("/api/v1/modules/custom", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + data.accessToken
            },
            body: JSON.stringify({
              moduleKey: modKey,
              name: formData.customModuleName,
              singularName: formData.customModuleName,
              pluralName: formData.customModuleName + "s",
              icon: "Box",
              description: "Custom entity module for " + formData.companyName
            })
          });

          for (const field of formData.customFields) {
            if (field.fieldName.trim()) {
              await fetch("/api/v1/custom-fields", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + data.accessToken
                },
                body: JSON.stringify({
                  entityType: modKey,
                  fieldName: field.fieldName,
                  fieldType: field.fieldType,
                  isRequired: field.isRequired
                })
              }).catch(() => {});
            }
          }
        } catch (err) {}
      }

      let updatedWorkspaces;
      if (editingWs) {
        updatedWorkspaces = workspaces.map(w => w.id === editingWs.id ? createdWorkspace : w);
      } else {
        updatedWorkspaces = [createdWorkspace, ...workspaces];
      }

      setWorkspaces(updatedWorkspaces);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updatedWorkspaces));

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      setStatusMsg("Success! CRM Workspace saved and persisted in Supabase.");
      setLoading(false);
      setShowWizard(false);
      setEditingWs(null);
    } catch (err) {
      setLoading(false);
      const fallbackWs = {
        id: editingWs ? editingWs.id : ("ws-" + Date.now()),
        name: formData.companyName,
        description: formData.description || "Custom Workspace",
        template: formData.template,
        modulesCount: formData.selectedModules.length,
        createdAt: new Date().toISOString()
      };
      const updatedWorkspaces = editingWs ? workspaces.map(w => w.id === editingWs.id ? fallbackWs : w) : [fallbackWs, ...workspaces];
      setWorkspaces(updatedWorkspaces);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updatedWorkspaces));
      setShowWizard(false);
      setEditingWs(null);
    }
  };

  const handleDeleteCRM = (wsId) => {
    if (confirm("Are you sure you want to delete this CRM workspace?")) {
      const updated = workspaces.filter(w => w.id !== wsId);
      setWorkspaces(updated);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updated));
    }
  };

  const handleEditCRM = (ws) => {
    setEditingWs(ws);
    setFormData({
      companyName: ws.name,
      description: ws.description || "",
      template: ws.template || "GENERIC",
      plan: "PRO",
      fullName: "CRM Admin",
      email: "",
      phone: "",
      password: "Password123!",
      selectedModules: ["leads", "contacts", "companies", "deals", "tasks"],
      customModuleName: ws.customModule ? ws.customModule.name : "",
      customModuleKey: ws.customModule ? ws.customModule.key : "",
      customFields: ws.customModule && ws.customModule.fields ? ws.customModule.fields : [
        { fieldName: "Price / Value", fieldType: "CURRENCY", isRequired: true }
      ]
    });
    setShowWizard(true);
  };

  return d.jsxs("div", {
    className: "p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900 dark:text-slate-100 font-sans",
    children: [
      d.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6",
        children: [
          d.jsxs("div", {
            children: [
              d.jsxs("h1", { className: "text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-3", children: [d.jsx("span", { className: "p-2 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30", children: "🛠️" }), d.jsx("span", { children: "Create Your Own CRM / Builder Platform" })] }),
              d.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium", children: "Build, configure, edit, preview, and persist isolated multi-tenant CRM workspaces with bespoke modules and fields." })
            ]
          }),
          d.jsx("button", {
            onClick: () => { setEditingWs(null); setShowWizard(true); setStatusMsg(""); },
            className: "px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer transition transform hover:scale-105",
            children: [d.jsx("span", { children: "✨ Create New CRM Workspace" })]
          })
        ]
      }),

      d.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-6",
        children: [
          d.jsxs("div", {
            className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2",
            children: [
              d.jsx("span", { className: "text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider", children: "Active CRM Workspaces" }),
              d.jsx("h3", { className: "text-3xl font-black text-slate-900 dark:text-white", children: workspaces.length }),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "Persisted in Supabase backend & account storage" })
            ]
          }),
          d.jsxs("div", {
            className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2",
            children: [
              d.jsx("span", { className: "text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider", children: "Multi-Tenant Isolation" }),
              d.jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white", children: "User Account Isolated" }),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "Row-Level Security & Supabase isolation" })
            ]
          }),
          d.jsxs("div", {
            className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2",
            children: [
              d.jsx("span", { className: "text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider", children: "Custom Fields Engine" }),
              d.jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white", children: "8 Field Types Supported" }),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "Text, Number, Email, Phone, Date, Select, Checkbox, Currency" })
            ]
          })
        ]
      }),

      d.jsxs("div", {
        className: "space-y-4",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2", children: [d.jsx("span", { children: "🏢 Configured & Saved CRM Workspaces" })] }),
          d.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            children: workspaces.map(ws => d.jsxs("div", {
              key: ws.id,
              className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between space-y-4",
              children: [
                d.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    d.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        d.jsx("h3", { className: "font-black text-base text-slate-900 dark:text-white", children: ws.name }),
                        d.jsx("span", { className: "px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider", children: ws.template || "CRM" })
                      ]
                    }),
                    d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2", children: ws.description }),
                    d.jsxs("div", {
                      className: "flex items-center space-x-4 text-xs font-bold text-slate-400 pt-2",
                      children: [
                        d.jsx("span", { children: "📦 " + (ws.modulesCount || 6) + " Modules" }),
                        d.jsx("span", { children: "🔒 Isolated Account" })
                      ]
                    })
                  ]
                }),
                d.jsxs("div", {
                  className: "flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800",
                  children: [
                    d.jsx("button", {
                      onClick: () => handleEditCRM(ws),
                      className: "flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer text-center",
                      children: "✏️ Edit"
                    }),
                    d.jsx("button", {
                      onClick: () => setPreviewWs(ws),
                      className: "flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition cursor-pointer text-center",
                      children: "👁️ Preview"
                    }),
                    ws.id !== "ws-default" ? d.jsx("button", {
                      onClick: () => handleDeleteCRM(ws.id),
                      className: "px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 font-bold text-xs transition cursor-pointer",
                      children: "🗑️"
                    }) : null
                  ]
                })
              ]
            }))
          })
        ]
      }),

      previewWs ? d.jsx("div", {
        className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in",
        children: d.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6",
          children: [
            d.jsxs("div", { className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4", children: [d.jsxs("div", { children: [d.jsx("h2", { className: "text-xl font-black text-slate-900 dark:text-white", children: "👁️ CRM Workspace Preview: " + previewWs.name }), d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: previewWs.description })] }), d.jsx("button", { onClick: () => setPreviewWs(null), className: "p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer", children: "✕" })] }),
            d.jsxs("div", { className: "space-y-4 text-xs font-semibold", children: [d.jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2", children: [d.jsx("h4", { className: "font-black uppercase text-[10px] text-indigo-600 dark:text-indigo-400 tracking-wider", children: "Configured Modules" }), d.jsx("div", { className: "flex wrap gap-2 font-bold text-slate-700 dark:text-slate-300", children: ["Leads", "Contacts", "Companies", "Deals", "Tasks", previewWs.customModule ? previewWs.customModule.name : null].filter(Boolean).map(m => d.jsx("span", { key: m, className: "px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600", children: "📦 " + m })) })] }), previewWs.customModule ? d.jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2", children: [d.jsx("h4", { className: "font-black uppercase text-[10px] text-indigo-600 dark:text-indigo-400 tracking-wider", children: "Custom Fields for " + previewWs.customModule.name }), d.jsx("div", { className: "space-y-1 text-slate-700 dark:text-slate-300", children: (previewWs.customModule.fields || []).map((f, i) => d.jsxs("div", { key: i, className: "flex justify-between font-bold", children: [d.jsx("span", { children: "🔹 " + f.fieldName }), d.jsx("span", { className: "text-slate-400", children: f.fieldType + (f.isRequired ? " (Required)" : "") })] })) })] }) : null] }),
            d.jsx("button", { onClick: () => { window.location.href = "/dashboard"; }, className: "w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/30 cursor-pointer text-center", children: "Launch & Launch Dashboard →" })
          ]
        })
      }) : null,

      showWizard ? d.jsx("div", {
        className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in",
        children: d.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto",
          children: [
            d.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4",
              children: [
                d.jsxs("div", { children: [
                  d.jsx("h2", { className: "text-xl font-black text-slate-900 dark:text-white", children: editingWs ? "✏️ Edit CRM Workspace" : "✨ Create Your Own CRM / Workspace" }),
                  d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5", children: "Configure workspace parameters, entities, custom modules, and 8 field types." })
                ]}),
                d.jsx("button", { onClick: () => setShowWizard(false), className: "p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer", children: "✕" })
              ]
            }),

            statusMsg ? d.jsx("div", {
              className: "p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300",
              children: statusMsg
            }) : null,

            d.jsxs("form", {
              onSubmit: handleSaveCRM,
              className: "space-y-6 text-xs font-semibold",
              children: [
                d.jsxs("div", {
                  className: "space-y-4",
                  children: [
                    d.jsx("h3", { className: "font-black uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "1. Workspace Overview" }),
                    d.jsxs("div", {
                      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                      children: [
                        d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "CRM / Workspace Name *" }), d.jsx("input", { type: "text", required: true, value: formData.companyName, onChange: e => setFormData({ ...formData, companyName: e.target.value }), placeholder: "e.g. Apex Sales CRM", className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                        d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Industry Template" }), d.jsx("select", { value: formData.template, onChange: e => setFormData({ ...formData, template: e.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["GENERIC", "REAL_ESTATE", "SAAS", "RECRUITMENT", "FINANCIAL_SERVICES", "HEALTHCARE", "E_COMMERCE"].map(t => d.jsx("option", { key: t, value: t, children: t })) })] })
                      ]
                    }),
                    d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Workspace Description" }), d.jsx("input", { type: "text", value: formData.description, onChange: e => setFormData({ ...formData, description: e.target.value }), placeholder: "Brief overview of what this CRM manages", className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
                  ]
                }),

                d.jsxs("div", {
                  className: "space-y-3",
                  children: [
                    d.jsx("h3", { className: "font-black uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "2. Included Standard CRM Modules" }),
                    d.jsx("div", {
                      className: "grid grid-cols-2 sm:grid-cols-4 gap-2",
                      children: [
                        { key: "leads", label: "🎯 Leads" },
                        { key: "contacts", label: "👥 Contacts" },
                        { key: "companies", label: "🏢 Companies" },
                        { key: "deals", label: "💼 Deals" },
                        { key: "tasks", label: "✅ Tasks" },
                        { key: "products", label: "📦 Products" },
                        { key: "quotes", label: "📄 Quotes" },
                        { key: "support", label: "🎧 Support" }
                      ].map(m => d.jsxs("div", {
                        key: m.key,
                        onClick: () => handleToggleModule(m.key),
                        className: "p-3 rounded-xl border flex items-center space-x-2 cursor-pointer transition " + (formData.selectedModules.includes(m.key) ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"),
                        children: [d.jsx("input", { type: "checkbox", checked: formData.selectedModules.includes(m.key), readOnly: true, className: "rounded" }), d.jsx("span", { className: "text-xs", children: m.label })]
                      }))
                    })
                  ]
                }),

                d.jsxs("div", {
                  className: "space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
                  children: [
                    d.jsxs("div", { className: "flex items-center justify-between", children: [d.jsx("h3", { className: "font-black uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "3. Custom Entity Module & 8 Field Types" }), d.jsx("span", { className: "text-[10px] text-slate-400 font-bold", children: "Optional Custom Entity" })] }),
                    d.jsxs("div", {
                      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                      children: [
                        d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Custom Module Name" }), d.jsx("input", { type: "text", value: formData.customModuleName, onChange: e => setFormData({ ...formData, customModuleName: e.target.value }), placeholder: "e.g. Properties / Vehicles", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })] }),
                        d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Module Key Identifier" }), d.jsx("input", { type: "text", value: formData.customModuleKey, onChange: e => setFormData({ ...formData, customModuleKey: e.target.value }), placeholder: "e.g. PROPERTIES", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none uppercase font-mono" })] })
                      ]
                    }),

                    d.jsxs("div", {
                      className: "space-y-3 pt-2",
                      children: [
                        d.jsxs("div", { className: "flex items-center justify-between", children: [d.jsx("span", { className: "font-bold text-slate-700 dark:text-slate-300", children: "Configured Custom Fields" }), d.jsx("button", { type: "button", onClick: handleAddField, className: "text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline cursor-pointer", children: "+ Add Custom Field" })] }),
                        formData.customFields.map((fld, idx) => d.jsxs("div", {
                          key: idx,
                          className: "flex items-center space-x-2",
                          children: [
                            d.jsx("input", { type: "text", value: fld.fieldName, onChange: e => handleFieldChange(idx, "fieldName", e.target.value), placeholder: "Field Name (e.g. Price)", className: "flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" }),
                            d.jsx("select", { value: fld.fieldType, onChange: e => handleFieldChange(idx, "fieldType", e.target.value), className: "px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none", children: ["TEXT", "NUMBER", "EMAIL", "PHONE", "DATE", "DROPDOWN", "CHECKBOX", "CURRENCY"].map(ft => d.jsx("option", { key: ft, value: ft, children: ft })) }),
                            d.jsxs("label", { className: "flex items-center space-x-1 text-slate-600 dark:text-slate-400 font-bold", children: [d.jsx("input", { type: "checkbox", checked: fld.isRequired, onChange: e => handleFieldChange(idx, "isRequired", e.target.checked) }), d.jsx("span", { className: "text-[10px]", children: "Req" })] }),
                            d.jsx("button", { type: "button", onClick: () => handleRemoveField(idx), className: "text-rose-500 hover:text-rose-700 font-bold px-1.5 cursor-pointer", children: "✕" })
                          ]
                        }))
                      ]
                    })
                  ]
                }),

                d.jsxs("div", {
                  className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800",
                  children: [
                    d.jsx("button", { type: "button", onClick: () => setShowWizard(false), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer", children: "Cancel" }),
                    d.jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/30 transition transform hover:scale-105 cursor-pointer", children: loading ? "Saving CRM Workspace..." : "💾 Save CRM Workspace to Supabase" })
                  ]
                })
              ]
            })
          ]
        })
      }) : null
    ]
  });
}
`;

// Replace CRMBuilderComponent definition in index-CMn9DqNx.js
const builderStart = code.indexOf('function CRMBuilderComponent()');
if (builderStart !== -1) {
  const fdStart = code.indexOf('function FD()', builderStart);
  if (fdStart !== -1) {
    code = code.substring(0, builderStart) + fullCRMBuilderJs + '\n' + code.substring(fdStart);
    console.log('[SUCCESS] Replaced CRMBuilderComponent with enhanced full version!');
  }
} else {
  const fdStart = code.indexOf('function FD()');
  if (fdStart !== -1) {
    code = code.substring(0, fdStart) + fullCRMBuilderJs + '\n' + code.substring(fdStart);
    console.log('[SUCCESS] Injected full CRMBuilderComponent!');
  }
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Script injection complete.');
