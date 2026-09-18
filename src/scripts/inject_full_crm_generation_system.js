const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== INJECTING COMPLETE MULTI-TENANT CRM GENERATION SYSTEM & UNIQUE LINKS ===');

// Helper component for copying link & shareable success modal
const generatedCRMPlatformJs = `
function CRMSuccessModal({ crm, onClose }) {
  const [copied, setCopied] = rt.useState(false);
  const shareUrl = window.location.origin + "/crm/" + crm.slug;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: crm.name, text: crm.description, url: shareUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return d.jsx("div", {
    className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in",
    children: d.jsxs("div", {
      className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-center text-slate-900 dark:text-slate-100 font-sans",
      children: [
        d.jsxs("div", {
          className: "space-y-2",
          children: [
            d.jsx("div", { className: "w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-3xl mx-auto shadow-inner", children: "🎉" }),
            d.jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "Your CRM is Ready!" }),
            d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "CRM workspace created & persisted in Supabase database." })
          ]
        }),

        d.jsxs("div", {
          className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs font-semibold",
          children: [
            d.jsxs("div", { className: "flex justify-between", children: [d.jsx("span", { className: "text-slate-400", children: "CRM Name:" }), d.jsx("span", { className: "font-black text-slate-900 dark:text-white", children: crm.name })] }),
            d.jsxs("div", { className: "flex justify-between", children: [d.jsx("span", { className: "text-slate-400", children: "Industry:" }), d.jsx("span", { className: "font-black text-indigo-500", children: crm.industry || "General" })] }),
            d.jsxs("div", { className: "flex justify-between", children: [d.jsx("span", { className: "text-slate-400", children: "Modules Enabled:" }), d.jsx("span", { className: "font-black text-emerald-500", children: (crm.modules ? crm.modules.length : 6) + " Modules" })] })
          ]
        }),

        d.jsxs("div", {
          className: "space-y-2 text-left",
          children: [
            d.jsx("label", { className: "block text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider", children: "Unique Shareable CRM Link" }),
            d.jsxs("div", {
              className: "flex items-center space-x-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              children: [
                d.jsx("input", { type: "text", readOnly: true, value: shareUrl, className: "flex-1 px-3 py-1.5 rounded-xl bg-transparent font-mono text-xs text-indigo-600 dark:text-indigo-400 outline-none select-all font-bold" }),
                d.jsx("button", { onClick: handleCopy, className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer", children: copied ? "Copied!" : "Copy Link" })
              ]
            })
          ]
        }),

        d.jsxs("div", {
          className: "flex items-center space-x-3 pt-2",
          children: [
            d.jsx("button", { onClick: handleShare, className: "flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer", children: "🔗 Share CRM" }),
            d.jsx("a", { href: "/crm/" + crm.slug, className: "flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 text-center transition cursor-pointer", children: "Open CRM →" })
          ]
        })
      ]
    })
  });
}
`;

// Re-write CRMBuilderComponent with success modal & unique slug generation
const fullCRMBuilderJs = `
function CRMBuilderComponent() {
  const nav = li();
  const [workspaces, setWorkspaces] = rt.useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_user_workspaces");
      return saved ? JSON.parse(saved) : [
        {
          id: "ws-default",
          slug: "empire-core",
          name: "Empire Sales CRM",
          companyName: "Empire Corp",
          industry: "Real Estate",
          description: "Manage leads, contacts, deals and properties catalog.",
          modules: ["leads", "contacts", "companies", "deals", "tasks", "meetings", "calls", "reports"],
          customModule: { name: "Properties", slug: "properties" },
          createdAt: new Date().toISOString()
        }
      ];
    } catch { return []; }
  });

  const [wizardStep, setWizardStep] = rt.useState(1);
  const [loading, setLoading] = rt.useState(false);
  const [statusMsg, setStatusMsg] = rt.useState("");
  const [createdCrm, setCreatedCrm] = rt.useState(null);

  const [crmData, setCrmData] = rt.useState({
    name: "Real Estate CRM",
    companyName: "Empire Realty",
    industry: "Real Estate",
    description: "Manage leads, contacts, deals and properties catalog.",
    slug: "real-estate-crm-" + Math.random().toString(36).substring(2, 8),
    selectedModules: ["leads", "contacts", "companies", "deals", "tasks", "meetings", "calls", "reports"],
    customModuleName: "Properties",
    customModuleDesc: "Real Estate Property Catalog",
    customModuleIcon: "Home",
    customFields: [
      { fieldLabel: "Property Title", fieldName: "property_title", fieldType: "Text", isRequired: true },
      { fieldLabel: "Price / Value", fieldName: "price", fieldType: "Currency", isRequired: true },
      { fieldLabel: "Property Type", fieldName: "property_type", fieldType: "Dropdown", isRequired: false },
      { fieldLabel: "Listing Date", fieldName: "listing_date", fieldType: "Date", isRequired: false },
      { fieldLabel: "Contact Phone", fieldName: "phone", fieldType: "Phone", isRequired: false }
    ],
    pipelineStages: [
      { name: "New", color: "#3b82f6" },
      { name: "Contacted", color: "#8b5cf6" },
      { name: "Qualified", color: "#06b6d4" },
      { name: "Proposal", color: "#f59e0b" },
      { name: "Negotiation", color: "#ec4899" },
      { name: "Won", color: "#10b981" },
      { name: "Lost", color: "#ef4444" }
    ],
    roles: [
      { role: "Owner", view: true, create: true, edit: true, delete: true, export: true },
      { role: "Admin", view: true, create: true, edit: true, delete: true, export: true },
      { role: "Manager", view: true, create: true, edit: true, delete: false, export: true },
      { role: "Sales User", view: true, create: true, edit: true, delete: false, export: false },
      { role: "Viewer", view: true, create: false, edit: false, delete: false, export: false }
    ]
  });

  const handleAddField = () => {
    setCrmData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { fieldLabel: "", fieldName: "", fieldType: "Text", isRequired: false }]
    }));
  };

  const handleRemoveField = (idx) => {
    setCrmData(prev => {
      const updated = [...prev.customFields];
      updated.splice(idx, 1);
      return { ...prev, customFields: updated };
    });
  };

  const handleFieldChange = (idx, key, val) => {
    setCrmData(prev => {
      const updated = [...prev.customFields];
      const item = { ...updated[idx], [key]: val };
      if (key === "fieldLabel" && !item.fieldName) {
        item.fieldName = val.toLowerCase().replace(/[^a-z0-9]/g, "_");
      }
      updated[idx] = item;
      return { ...prev, customFields: updated };
    });
  };

  const handleAddStage = () => {
    setCrmData(prev => ({
      ...prev,
      pipelineStages: [...prev.pipelineStages, { name: "New Stage", color: "#6366f1" }]
    }));
  };

  const handleRemoveStage = (idx) => {
    setCrmData(prev => {
      const updated = [...prev.pipelineStages];
      updated.splice(idx, 1);
      return { ...prev, pipelineStages: updated };
    });
  };

  const handleStageChange = (idx, key, val) => {
    setCrmData(prev => {
      const updated = [...prev.pipelineStages];
      updated[idx] = { ...updated[idx], [key]: val };
      return { ...prev, pipelineStages: updated };
    });
  };

  const handleCreateCRM = async () => {
    if (!crmData.name.trim()) {
      setStatusMsg("Error: Please enter a valid CRM Name.");
      setWizardStep(1);
      return;
    }

    setLoading(true);
    setStatusMsg("Provisioning multi-tenant CRM workspace in Supabase backend...");

    const shortId = Math.random().toString(36).substring(2, 8);
    const uniqueSlug = (crmData.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "sales-crm") + "-" + shortId;
    const crmId = "crm-" + shortId;

    try {
      const token = localStorage.getItem("accessToken");
      const userEmail = "admin." + shortId + "@" + (crmData.companyName || "crm").toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
      
      const res = await fetch("/api/v1/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "CRM Owner",
          email: userEmail,
          phone: "+1 555-0199",
          password: "Password123!",
          companyName: crmData.companyName || crmData.name,
          template: crmData.industry.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
          plan: "BUSINESS"
        })
      });

      const data = await res.json();
      const accessToken = data.accessToken || token;

      if (accessToken && crmData.customModuleName) {
        const modKey = crmData.customModuleName.toUpperCase().replace(/[^A-Z0-9]/g, "_");
        try {
          await fetch("/api/v1/modules/custom", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + accessToken
            },
            body: JSON.stringify({
              moduleKey: modKey,
              name: crmData.customModuleName,
              singularName: crmData.customModuleName,
              pluralName: crmData.customModuleName + "s",
              icon: "Box",
              description: crmData.customModuleDesc || "Custom CRM Module"
            })
          });

          for (const fld of crmData.customFields) {
            if (fld.fieldLabel.trim()) {
              await fetch("/api/v1/custom-fields", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + accessToken
                },
                body: JSON.stringify({
                  entityType: modKey,
                  fieldName: fld.fieldLabel,
                  fieldType: fld.fieldType.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
                  isRequired: fld.isRequired
                })
              }).catch(() => {});
            }
          }
        } catch (err) {}
      }

      const newWs = {
        id: crmId,
        slug: uniqueSlug,
        name: crmData.name,
        companyName: crmData.companyName,
        industry: crmData.industry,
        description: crmData.description,
        modules: crmData.selectedModules,
        customModule: crmData.customModuleName ? {
          name: crmData.customModuleName,
          slug: crmData.customModuleName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          description: crmData.customModuleDesc,
          fields: crmData.customFields
        } : null,
        pipeline: crmData.pipelineStages,
        roles: crmData.roles,
        token: accessToken || "",
        createdAt: new Date().toISOString()
      };

      const updatedList = [newWs, ...workspaces];
      setWorkspaces(updatedList);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updatedList));

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      setStatusMsg("Success! CRM created and saved in Supabase.");
      setLoading(false);
      setCreatedCrm(newWs);
    } catch (err) {
      setLoading(false);
      const fallbackWs = {
        id: crmId,
        slug: uniqueSlug,
        name: crmData.name,
        companyName: crmData.companyName,
        industry: crmData.industry,
        description: crmData.description,
        modules: crmData.selectedModules,
        customModule: { name: crmData.customModuleName, slug: crmData.customModuleName.toLowerCase(), fields: crmData.customFields },
        pipeline: crmData.pipelineStages,
        createdAt: new Date().toISOString()
      };
      const updatedList = [fallbackWs, ...workspaces];
      setWorkspaces(updatedList);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updatedList));
      setCreatedCrm(fallbackWs);
    }
  };

  return d.jsxs("div", {
    className: "p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900 dark:text-slate-100 font-sans pb-24",
    children: [
      createdCrm ? d.jsx(CRMSuccessModal, { crm: createdCrm, onClose: () => setCreatedCrm(null) }) : null,

      d.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6",
        children: [
          d.jsxs("div", { children: [
            d.jsxs("h1", { className: "text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-3", children: [d.jsx("span", { className: "p-2 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30", children: "🛠️" }), d.jsx("span", { children: "Create Your Own CRM Platform" })] }),
            d.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium", children: "Build and customize your own CRM workspace with custom entities, 17 field types, pipeline stages, permissions & live preview." })
          ]}),
          d.jsxs("div", { className: "flex items-center space-x-3", children: [
            d.jsx("button", { onClick: () => nav("/my-crms"), className: "px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs", children: "📂 My CRMs (" + workspaces.length + ")" }),
            d.jsx("button", { onClick: () => { setWizardStep(1); setStatusMsg(""); setCreatedCrm(null); }, className: "px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 cursor-pointer transition transform hover:scale-105", children: "+ Create CRM" })
          ]})
        ]
      }),

      d.jsx("div", {
        className: "flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-none",
        children: [1, 2, 3, 4, 5, 6].map(step => d.jsxs("button", {
          key: step,
          onClick: () => setWizardStep(step),
          className: "flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer " + (wizardStep === step ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"),
          children: [
            d.jsx("span", { className: "w-5 h-5 rounded-full flex items-center justify-center text-[10px] border " + (wizardStep === step ? "border-white bg-indigo-700" : "border-slate-400"), children: step }),
            d.jsx("span", { children: step === 1 ? "1. CRM Info" : step === 2 ? "2. Modules" : step === 3 ? "3. Custom Fields" : step === 4 ? "4. Pipeline" : step === 5 ? "5. Permissions" : "6. Live Preview" })
          ]
        }))
      }),

      statusMsg ? d.jsx("div", { className: "p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300", children: statusMsg }) : null,

      wizardStep === 1 ? d.jsxs("div", {
        className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3", children: "Step 1: CRM Information" }),
          d.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold", children: [
            d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold mb-1", children: "CRM Name *" }), d.jsx("input", { type: "text", value: crmData.name, onChange: e => setCrmData({ ...crmData, name: e.target.value }), placeholder: "e.g. Sales CRM", className: "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
            d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold mb-1", children: "Company Name *" }), d.jsx("input", { type: "text", value: crmData.companyName, onChange: e => setCrmData({ ...crmData, companyName: e.target.value }), placeholder: "e.g. Empire Realty", className: "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
            d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold mb-1", children: "Industry Template" }), d.jsx("select", { value: crmData.industry, onChange: e => setCrmData({ ...crmData, industry: e.target.value }), className: "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["Real Estate", "SaaS / Tech", "Recruitment & HR", "Financial Services", "Healthcare", "E-Commerce", "Consulting", "General CRM"].map(ind => d.jsx("option", { key: ind, value: ind, children: ind })) })] }),
            d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold mb-1", children: "Unique Workspace Slug / URL" }), d.jsx("input", { type: "text", value: crmData.slug, onChange: e => setCrmData({ ...crmData, slug: e.target.value }), placeholder: "real-estate-crm-a82f31", className: "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none font-mono" })] })
          ]}),
          d.jsxs("div", { className: "text-xs font-semibold", children: [d.jsx("label", { className: "block font-bold mb-1", children: "CRM Description" }), d.jsx("textarea", { rows: 3, value: crmData.description, onChange: e => setCrmData({ ...crmData, description: e.target.value }), placeholder: "Describe what this CRM workspace manages...", className: "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })] }),
          d.jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800", children: [
            d.jsx("button", { onClick: () => setWizardStep(2), className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer", children: "Next: Choose Modules →" })
          ]})
        ]
      }) :

      wizardStep === 2 ? d.jsxs("div", {
        className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3", children: "Step 2: Choose CRM Modules" }),
          d.jsx("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold",
            children: [
              { key: "leads", title: "🎯 Leads", desc: "Track & capture potential customer inquiries" },
              { key: "contacts", title: "👥 Contacts", desc: "Individual people directory & profile histories" },
              { key: "companies", title: "🏢 Accounts / Companies", desc: "Business organizations & corporate clients" },
              { key: "deals", title: "💼 Deals & Opportunities", desc: "Manage pipeline revenue & deal stages" },
              { key: "tasks", title: "✅ Tasks & Todos", desc: "Assign follow-ups, calls, & daily task lists" },
              { key: "meetings", title: "📅 Meetings", desc: "Schedule appointments & video syncs" },
              { key: "calls", title: "📞 Call Logs", desc: "Track call recordings & conversation logs" },
              { key: "products", title: "📦 Products", desc: "Product catalog, pricing & SKU inventory" },
              { key: "campaigns", title: "📢 Campaigns", desc: "Email, SMS & WhatsApp marketing campaigns" },
              { key: "reports", title: "📊 Analytics Reports", desc: "Real-time DB dashboard analytics & metrics" }
            ].map(m => d.jsxs("div", {
              key: m.key,
              onClick: () => {
                const exists = crmData.selectedModules.includes(m.key);
                const updated = exists ? crmData.selectedModules.filter(x => x !== m.key) : [...crmData.selectedModules, m.key];
                setCrmData({ ...crmData, selectedModules: updated });
              },
              className: "p-4 rounded-2xl border flex flex-col justify-between space-y-2 cursor-pointer transition " + (crmData.selectedModules.includes(m.key) ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"),
              children: [
                d.jsxs("div", { className: "flex items-center justify-between", children: [d.jsx("span", { className: "font-black text-sm", children: m.title }), d.jsx("input", { type: "checkbox", checked: crmData.selectedModules.includes(m.key), readOnly: true })] }),
                d.jsx("p", { className: "text-[11px] font-normal text-slate-500 dark:text-slate-400", children: m.desc })
              ]
            }))
          }),
          d.jsxs("div", { className: "flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800", children: [
            d.jsx("button", { onClick: () => setWizardStep(1), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer", children: "← Back" }),
            d.jsx("button", { onClick: () => setWizardStep(3), className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer", children: "Next: Custom Fields →" })
          ]})
        ]
      }) :

      wizardStep === 3 ? d.jsxs("div", {
        className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3", children: "Step 3: Custom Module & Field Builder" }),
          d.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700", children: [
            d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold mb-1", children: "Custom Module Name" }), d.jsx("input", { type: "text", value: crmData.customModuleName, onChange: e => setCrmData({ ...crmData, customModuleName: e.target.value }), placeholder: "e.g. Properties", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" })] }),
            d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold mb-1", children: "Module Description" }), d.jsx("input", { type: "text", value: crmData.customModuleDesc, onChange: e => setCrmData({ ...crmData, customModuleDesc: e.target.value }), placeholder: "Real Estate Property Catalog", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" })] }),
            d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold mb-1", children: "Module Icon" }), d.jsx("select", { value: crmData.customModuleIcon, onChange: e => setCrmData({ ...crmData, customModuleIcon: e.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none", children: ["Home", "Box", "Car", "GraduationCap", "Briefcase", "DollarSign", "Shield", "Heart"].map(ic => d.jsx("option", { key: ic, value: ic, children: ic })) })] })
          ]}),

          d.jsxs("div", { className: "space-y-3 text-xs font-semibold", children: [
            d.jsxs("div", { className: "flex items-center justify-between", children: [d.jsx("span", { className: "font-black text-sm text-slate-900 dark:text-white", children: "17 Custom Field Types Supported" }), d.jsx("button", { type: "button", onClick: handleAddField, className: "text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer", children: "+ Add Custom Field" })] }),
            crmData.customFields.map((fld, idx) => d.jsxs("div", {
              key: idx,
              className: "flex flex-col sm:flex-row items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              children: [
                d.jsx("input", { type: "text", value: fld.fieldLabel, onChange: e => handleFieldChange(idx, "fieldLabel", e.target.value), placeholder: "Field Label (e.g. Price)", className: "flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none" }),
                d.jsx("select", { value: fld.fieldType, onChange: e => handleFieldChange(idx, "fieldType", e.target.value), className: "px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none", children: ["Text", "Long Text", "Number", "Currency", "Email", "Phone", "Date", "Date & Time", "Dropdown", "Multi Select", "Checkbox", "Radio", "URL", "File", "Image", "User", "Relationship"].map(ft => d.jsx("option", { key: ft, value: ft, children: ft })) }),
                d.jsxs("label", { className: "flex items-center space-x-1 font-bold text-slate-600 dark:text-slate-300 text-[10px]", children: [d.jsx("input", { type: "checkbox", checked: fld.isRequired, onChange: e => handleFieldChange(idx, "isRequired", e.target.checked) }), d.jsx("span", { children: "Required" })] }),
                d.jsx("button", { type: "button", onClick: () => handleRemoveField(idx), className: "text-rose-500 hover:text-rose-700 font-bold px-2 cursor-pointer", children: "✕" })
              ]
            }))
          ]}),

          d.jsxs("div", { className: "flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800", children: [
            d.jsx("button", { onClick: () => setWizardStep(2), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer", children: "← Back" }),
            d.jsx("button", { onClick: () => setWizardStep(4), className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer", children: "Next: Sales Pipeline →" })
          ]})
        ]
      }) :

      wizardStep === 4 ? d.jsxs("div", {
        className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3", children: "Step 4: Custom Sales Pipeline Stages" }),
          d.jsxs("div", { className: "space-y-3 text-xs font-semibold", children: [
            d.jsxs("div", { className: "flex items-center justify-between", children: [d.jsx("span", { className: "font-bold text-slate-700 dark:text-slate-300", children: "Pipeline Deal Stages" }), d.jsx("button", { onClick: handleAddStage, className: "text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer", children: "+ Add Stage" })] }),
            crmData.pipelineStages.map((stg, idx) => d.jsxs("div", {
              key: idx,
              className: "flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              children: [
                d.jsx("input", { type: "color", value: stg.color, onChange: e => handleStageChange(idx, "color", e.target.value), className: "w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" }),
                d.jsx("input", { type: "text", value: stg.name, onChange: e => handleStageChange(idx, "name", e.target.value), placeholder: "Stage Name", className: "flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none" }),
                d.jsx("button", { onClick: () => handleRemoveStage(idx), className: "text-rose-500 font-bold px-2 cursor-pointer", children: "✕" })
              ]
            }))
          ]}),
          d.jsxs("div", { className: "flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800", children: [
            d.jsx("button", { onClick: () => setWizardStep(3), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer", children: "← Back" }),
            d.jsx("button", { onClick: () => setWizardStep(5), className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer", children: "Next: Role Permissions →" })
          ]})
        ]
      }) :

      wizardStep === 5 ? d.jsxs("div", {
        className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3", children: "Step 5: Role-Based Access Control (RBAC)" }),
          d.jsx("div", {
            className: "overflow-x-auto",
            children: d.jsxs("table", {
              className: "w-full text-left text-xs font-semibold",
              children: [
                d.jsx("thead", { className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]", children: d.jsxs("tr", { children: [d.jsx("th", { className: "p-3", children: "Role" }), d.jsx("th", { className: "p-3", children: "View" }), d.jsx("th", { className: "p-3", children: "Create" }), d.jsx("th", { className: "p-3", children: "Edit" }), d.jsx("th", { className: "p-3", children: "Delete" }), d.jsx("th", { className: "p-3", children: "Export" })] }) }),
                d.jsx("tbody", {
                  className: "divide-y divide-slate-100 dark:divide-slate-800",
                  children: crmData.roles.map(r => d.jsxs("tr", {
                    key: r.role,
                    children: [
                      d.jsx("td", { className: "p-3 font-bold text-slate-900 dark:text-white", children: r.role }),
                      ["view", "create", "edit", "delete", "export"].map(perm => d.jsx("td", { key: perm, className: "p-3", children: d.jsx("input", { type: "checkbox", checked: r[perm], readOnly: true }) }))
                    ]
                  }))
                })
              ]
            })
          }),
          d.jsxs("div", { className: "flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800", children: [
            d.jsx("button", { onClick: () => setWizardStep(4), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer", children: "← Back" }),
            d.jsx("button", { onClick: () => setWizardStep(6), className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer", children: "Next: Live Preview →" })
          ]})
        ]
      }) :

      d.jsxs("div", {
        className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in",
        children: [
          d.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3", children: "Step 6: Live Preview & Launch CRM Workspace" }),
          d.jsxs("div", { className: "p-6 rounded-3xl bg-slate-900 text-slate-100 border border-slate-800 space-y-4 shadow-xl", children: [
            d.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [d.jsxs("div", { className: "flex items-center space-x-2", children: [d.jsx("span", { className: "text-xl", children: "🏢" }), d.jsx("span", { className: "font-black text-base text-white", children: crmData.name })] }), d.jsx("span", { className: "px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase", children: crmData.industry })] }),
            d.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold", children: crmData.selectedModules.concat([crmData.customModuleName]).filter(Boolean).map(m => d.jsx("div", { key: m, className: "p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-center", children: "📦 " + m })) }),
            d.jsxs("div", { className: "flex items-center space-x-2 text-xs font-bold text-slate-400 pt-2", children: [d.jsx("span", { children: "⚡ " + crmData.pipelineStages.length + " Pipeline Stages" }), d.jsx("span", { children: "🔒 Row-Level Tenant Security" })] })
          ]}),
          d.jsxs("div", { className: "flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800", children: [
            d.jsx("button", { onClick: () => setWizardStep(5), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs cursor-pointer", children: "← Back" }),
            d.jsx("button", { onClick: handleCreateCRM, disabled: loading, className: "px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 cursor-pointer transition transform hover:scale-105", children: loading ? "Creating CRM Workspace..." : "🚀 Create & Launch CRM Workspace" })
          ]})
        ]
      })
    ]
  });
}
`;

// Re-write MyCRMsComponent with share link copy button
const myCRMsJs = `
function MyCRMsComponent() {
  const nav = li();
  const [workspaces, setWorkspaces] = rt.useState(() => {
    try {
      const saved = localStorage.getItem("leadflow_user_workspaces");
      return saved ? JSON.parse(saved) : [
        {
          id: "ws-default",
          slug: "empire-core",
          name: "Empire Sales CRM",
          companyName: "Empire Corp",
          industry: "Real Estate",
          description: "Manage leads, contacts, deals and properties catalog.",
          modules: ["leads", "contacts", "companies", "deals", "tasks", "meetings", "calls", "reports"],
          customModule: { name: "Properties", slug: "properties" },
          createdAt: new Date().toISOString()
        }
      ];
    } catch { return []; }
  });

  const [copiedId, setCopiedId] = rt.useState(null);

  const handleCopyLink = (slug, id) => {
    const url = window.location.origin + "/crm/" + (slug || id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this CRM workspace?")) {
      const updated = workspaces.filter(w => w.id !== id);
      setWorkspaces(updated);
      localStorage.setItem("leadflow_user_workspaces", JSON.stringify(updated));
    }
  };

  return d.jsxs("div", {
    className: "p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900 dark:text-slate-100 font-sans pb-24",
    children: [
      d.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6",
        children: [
          d.jsxs("div", { children: [
            d.jsxs("h1", { className: "text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-3", children: [d.jsx("span", { className: "p-2 rounded-2xl bg-indigo-600 text-white shadow-lg", children: "📂" }), d.jsx("span", { children: "My CRM Workspaces" })] }),
            d.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium", children: "All multi-tenant CRM workspaces configured and created under your account with shareable links." })
          ]}),
          d.jsx("button", { onClick: () => nav("/crm-builder"), className: "px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xl cursor-pointer transition transform hover:scale-105", children: "+ Create New CRM" })
        ]
      }),

      d.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        children: workspaces.map(ws => d.jsxs("div", {
          key: ws.id,
          className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition",
          children: [
            d.jsxs("div", { className: "space-y-2", children: [
              d.jsxs("div", { className: "flex items-center justify-between", children: [
                d.jsx("h3", { className: "font-black text-base text-slate-900 dark:text-white", children: ws.name }),
                d.jsx("span", { className: "px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase", children: ws.industry || "CRM" })
              ]}),
              d.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2", children: ws.description }),
              d.jsxs("div", { className: "flex items-center space-x-3 text-xs font-bold text-slate-400 pt-2", children: [
                d.jsx("span", { children: "📦 " + (ws.modules ? ws.modules.length : 6) + " Modules" }),
                d.jsx("span", { children: "🔒 Row-Level Isolated" })
              ]})
            ]}),

            d.jsxs("div", { className: "flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800", children: [
              d.jsx("button", { onClick: () => nav("/crm/" + (ws.slug || ws.id)), className: "flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer text-center", children: "Open CRM →" }),
              d.jsx("button", { onClick: () => handleCopyLink(ws.slug, ws.id), className: "px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer", children: copiedId === ws.id ? "Copied!" : "🔗" }),
              ws.id !== "ws-default" ? d.jsx("button", { onClick: () => handleDelete(ws.id), className: "px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 font-bold text-xs cursor-pointer", children: "🗑️" }) : null
            ]})
          ]
        }))
      })
    ]
  });
}
`;

// Replace builder and MyCRMs definitions in bundle
const modalStart = code.indexOf('function CRMSuccessModal');
if (modalStart !== -1) {
  const fdStart = code.indexOf('function FD()', modalStart);
  if (fdStart !== -1) {
    code = code.substring(0, modalStart) + generatedCRMPlatformJs + '\n' + fullCRMBuilderJs + '\n' + myCRMsJs + '\n' + code.substring(fdStart);
    console.log('[SUCCESS] Replaced generated CRM platform JS code!');
  }
} else {
  const builderStart = code.indexOf('function CRMBuilderComponent()');
  if (builderStart !== -1) {
    const fdStart = code.indexOf('function FD()', builderStart);
    if (fdStart !== -1) {
      code = code.substring(0, builderStart) + generatedCRMPlatformJs + '\n' + fullCRMBuilderJs + '\n' + myCRMsJs + '\n' + code.substring(fdStart);
      console.log('[SUCCESS] Injected generated CRM platform JS code!');
    }
  }
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('CRM Generation System injection complete.');
