const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

const crmBuilderJs = `
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
  const [wizardStep, setWizardStep] = rt.useState(1);
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
    customFields: [{ fieldName: "Price / Value", fieldType: "CURRENCY", isRequired: true }]
  });

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { fieldName: "", fieldType: "TEXT", isRequired: false }]
    }));
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

  const handleCreateCRM = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.companyName.trim()) {
      setStatusMsg("Error: Please enter a CRM/Workspace Name.");
      return;
    }

    setLoading(true);
    setStatusMsg("Provisioning multi-tenant CRM workspace in Supabase...");

    try {
      const userEmail = formData.email.trim() || ("admin." + Date.now() + "@" + formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com");
      
      // 1. Backend provisioning API call
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
        token: data.accessToken || "",
        createdAt: new Date().toISOString()
      };

      // 2. If token present and custom module defined, create custom module persistently
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

          // Add custom fields
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

      // 3. Save persistently in local workspaces list
      const updatedWorkspaces = [createdWorkspace, ...workspaces];
      setWorkspaces(updatedWorkspaces);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updatedWorkspaces));

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      setStatusMsg("Success! CRM Workspace created successfully.");
      setLoading(false);
      setShowWizard(false);
      setWizardStep(1);
      setActiveTab("my-crms");
    } catch (err) {
      setLoading(false);
      // Fallback local persistence if network fails
      const fallbackWs = {
        id: "ws-" + Date.now(),
        name: formData.companyName,
        description: formData.description || "Custom Workspace",
        template: formData.template,
        modulesCount: formData.selectedModules.length,
        createdAt: new Date().toISOString()
      };
      const updatedWorkspaces = [fallbackWs, ...workspaces];
      setWorkspaces(updatedWorkspaces);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updatedWorkspaces));
      setShowWizard(false);
      setActiveTab("my-crms");
    }
  };

  return d.jsxs("div", {
    className: "p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900 dark:text-slate-100 font-sans",
    children: [
      d.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6",
        children: [
          d.jsxs("div", {
            children: [
              d.jsxs("h1", { className: "text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-3", children: [d.jsx("span", { className: "p-2 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30", children: "🛠️" }), d.jsx("span", { children: "Create Your Own CRM Platform" })] }),
              d.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium", children: "Build, configure, and isolate custom multi-tenant CRM workspaces with bespoke modules, fields, and pipelines." })
            ]
          }),
          d.jsx("button", {
            onClick: () => { setShowWizard(true); setWizardStep(1); setStatusMsg(""); },
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
              d.jsx("span", { className: "text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider", children: "Isolated Workspaces" }),
              d.jsx("h3", { className: "text-3xl font-black text-slate-900 dark:text-white", children: workspaces.length }),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "Active CRM instances owned by your account" })
            ]
          }),
          d.jsxs("div", {
            className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2",
            children: [
              d.jsx("span", { className: "text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider", children: "Security & Privacy" }),
              d.jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white", children: "Strict Multi-Tenant" }),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "Row-Level Security & Supabase isolation" })
            ]
          }),
          d.jsxs("div", {
            className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2",
            children: [
              d.jsx("span", { className: "text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider", children: "Custom Engine" }),
              d.jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white", children: "Dynamic Schema" }),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "Add custom modules, fields & pipelines anytime" })
            ]
          })
        ]
      }),

      d.jsxs("div", {
        className: "space-y-4",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2", children: [d.jsx("span", { children: "🏢 Your Configured CRM Workspaces" })] }),
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
                        d.jsx("span", { children: "🔒 Row-Level Tenant" })
                      ]
                    })
                  ]
                }),
                d.jsx("button", {
                  onClick: () => {
                    if (ws.token) localStorage.getItem("accessToken");
                    window.location.href = "/dashboard";
                  },
                  className: "w-full py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer text-center",
                  children: "Launch CRM Workspace →"
                })
              }
            }))
          })
        ]
      }),

      showWizard ? d.jsx("div", {
        className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in",
        children: d.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto",
          children: [
            d.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4",
              children: [
                d.jsxs("div", { children: [
                  d.jsx("h2", { className: "text-xl font-black text-slate-900 dark:text-white", children: "✨ Create Your Own CRM / Workspace" }),
                  d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5", children: "Configure workspace parameters, entities, custom modules, and fields." })
                ]}),
                d.jsx("button", { onClick: () => setShowWizard(false), className: "p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer", children: "✕" })
              ]
            }),

            statusMsg ? d.jsx("div", {
              className: "p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300",
              children: statusMsg
            }) : null,

            d.jsxs("form", {
              onSubmit: handleCreateCRM,
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
                        d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Industry Template" }), d.jsx("select", { value: formData.template, onChange: e => setFormData({ ...formData, template: e.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["GENERIC", "REAL_ESTATE", "SAAS", "RECRUITMENT", "FINANCIAL_SERVICES", "HEALTHCARE"].map(t => d.jsx("option", { key: t, value: t, children: t })) })] })
                      ]
                    }),
                    d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Workspace Description" }), d.jsx("input", { type: "text", value: formData.description, onChange: e => setFormData({ ...formData, description: e.target.value }), placeholder: "Brief overview of what this CRM manages", className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
                  ]
                }),

                d.jsxs("div", {
                  className: "space-y-3",
                  children: [
                    d.jsx("h3", { className: "font-black uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "2. Standard Included CRM Modules" }),
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
                    d.jsxs("div", { className: "flex items-center justify-between", children: [d.jsx("h3", { className: "font-black uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "3. Custom Entity Module & Custom Fields" }), d.jsx("span", { className: "text-[10px] text-slate-400 font-bold", children: "Optional" })] }),
                    d.jsxs("div", {
                      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                      children: [
                        d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Custom Module Name" }), d.jsx("input", { type: "text", value: formData.customModuleName, onChange: e => setFormData({ ...formData, customModuleName: e.target.value }), placeholder: "e.g. Properties / Vehicles", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })] }),
                        d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Module Identifier Key" }), d.jsx("input", { type: "text", value: formData.customModuleKey, onChange: e => setFormData({ ...formData, customModuleKey: e.target.value }), placeholder: "e.g. PROPERTIES", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none uppercase font-mono" })] })
                      ]
                    }),

                    formData.customModuleName ? d.jsxs("div", {
                      className: "space-y-3 pt-2",
                      children: [
                        d.jsxs("div", { className: "flex items-center justify-between", children: [d.jsx("span", { className: "font-bold text-slate-700 dark:text-slate-300", children: "Custom Fields Definition" }), d.jsx("button", { type: "button", onClick: handleAddField, className: "text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline cursor-pointer", children: "+ Add Custom Field" })] }),
                        formData.customFields.map((fld, idx) => d.jsxs("div", {
                          key: idx,
                          className: "flex items-center space-x-2",
                          children: [
                            d.jsx("input", { type: "text", value: fld.fieldName, onChange: e => handleFieldChange(idx, "fieldName", e.target.value), placeholder: "Field Name (e.g. Price)", className: "flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" }),
                            d.jsx("select", { value: fld.fieldType, onChange: e => handleFieldChange(idx, "fieldType", e.target.value), className: "px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none", children: ["TEXT", "NUMBER", "CURRENCY", "DATE", "SELECT", "CHECKBOX"].map(ft => d.jsx("option", { key: ft, value: ft, children: ft })) }),
                            d.jsxs("label", { className: "flex items-center space-x-1 text-slate-600 dark:text-slate-400 font-bold", children: [d.jsx("input", { type: "checkbox", checked: fld.isRequired, onChange: e => handleFieldChange(idx, "isRequired", e.target.checked) }), d.jsx("span", { className: "text-[10px]", children: "Req" })] })
                          ]
                        }))
                      ]
                    }) : null
                  ]
                }),

                d.jsxs("div", {
                  className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800",
                  children: [
                    d.jsx("button", { type: "button", onClick: () => setShowWizard(false), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer", children: "Cancel" }),
                    d.jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/30 transition transform hover:scale-105 cursor-pointer", children: loading ? "Creating CRM Workspace..." : "🚀 Provision & Launch CRM Workspace" })
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

// Insert CRMBuilderComponent before FD() function
const fdIdx = code.indexOf('function FD()');
if (fdIdx !== -1 && !code.includes('function CRMBuilderComponent()')) {
  code = code.substring(0, fdIdx) + crmBuilderJs + '\n' + code.substring(fdIdx);
  console.log('[SUCCESS] Injected CRMBuilderComponent definition!');
} else {
  console.log('CRMBuilderComponent already injected or FD not found.');
}

// Ensure /crm-builder route calls CRMBuilderComponent
const crmBuilderRoute = `d.jsx(oe,{path:"/crm-builder",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CRMBuilderComponent,{})})})}),`;
if (code.includes('path:"/crm-builder"')) {
  code = code.replace(/d\.jsx\(oe,\{path:"\/crm-builder"[^}]+\}\}\)\)\}\),/g, crmBuilderRoute);
  console.log('[SUCCESS] Updated /crm-builder route in FD()!');
} else if (fdIdx !== -1) {
  const loginIdx = code.indexOf('path:"/login"', fdIdx);
  if (loginIdx !== -1) {
    code = code.substring(0, loginIdx) + crmBuilderRoute + code.substring(loginIdx);
    console.log('[SUCCESS] Mounted /crm-builder route in FD()!');
  }
}

// Add "✨ Create Your Own CRM" button to ED TopBar component
const topbarTarget = `d.jsxs("div",{className:"flex items-center space-x-3",children:[`;
const topbarButton = `d.jsxs("div",{className:"flex items-center space-x-3",children:[d.jsx("a",{href:"/crm-builder",className:"hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 hover:scale-105 transition cursor-pointer",title:"Create Your Own CRM Platform",children:[d.jsx("span",{children:"✨ Create CRM"})]}),`;

if (code.includes(topbarTarget) && !code.includes('Create Your Own CRM Platform')) {
  code = code.replace(topbarTarget, topbarButton);
  console.log('[SUCCESS] Added "✨ Create CRM" button to TopBar (ED)!');
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('CRM Builder injection script completed!');
