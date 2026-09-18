const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../../assets/index-CMn9DqNx.js');
let code = fs.readFileSync(bundlePath, 'utf8');

console.log('=== INJECTING CustomModuleRecordComponent FOR PUBLISHED CRM MODULES ===');

const customModuleRecordJs = `
function CustomModuleRecordComponent() {
  const [moduleKey, setModuleKey] = rt.useState(() => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || "PROPERTIES";
  });

  const [records, setRecords] = rt.useState([]);
  const [fields, setFields] = rt.useState([]);
  const [loading, setLoading] = rt.useState(true);
  const [showModal, setShowModal] = rt.useState(false);
  const [recordTitle, setRecordTitle] = rt.useState("");
  const [formData, setFormData] = rt.useState({});
  const [statusMsg, setStatusMsg] = rt.useState("");

  const token = localStorage.getItem("accessToken");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch custom fields for this module
      const resFields = await fetch("/api/v1/custom-fields/" + moduleKey, {
        headers: token ? { "Authorization": "Bearer " + token } : {}
      });
      const dataFields = await resFields.json();
      if (dataFields.fields) setFields(dataFields.fields);

      // Fetch records for this module
      const resRecs = await fetch("/api/v1/records/" + moduleKey, {
        headers: token ? { "Authorization": "Bearer " + token } : {}
      });
      const dataRecs = await resRecs.json();
      if (dataRecs.records) setRecords(dataRecs.records);
    } catch (e) {
      console.error("Error fetching custom module records:", e);
    } finally {
      setLoading(false);
    }
  };

  rt.useEffect(() => {
    fetchData();
  }, [moduleKey]);

  const handleCreateRecord = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!recordTitle.trim()) {
      setStatusMsg("Please enter a record title.");
      return;
    }

    try {
      const res = await fetch("/api/v1/records/" + moduleKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: JSON.stringify({
          title: recordTitle,
          data: formData
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg("Record created successfully!");
        setShowModal(false);
        setRecordTitle("");
        setFormData({});
        fetchData();
      } else {
        setStatusMsg("Error: " + (data.message || "Failed to create record"));
      }
    } catch (err) {
      setStatusMsg("Failed to connect to backend server.");
    }
  };

  return d.jsxs("div", {
    className: "p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900 dark:text-slate-100 font-sans",
    children: [
      d.jsxs("div", {
        className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6",
        children: [
          d.jsxs("div", { children: [
            d.jsxs("h1", { className: "text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-3", children: [d.jsx("span", { className: "p-2 rounded-2xl bg-indigo-600 text-white shadow-lg", children: "📦" }), d.jsx("span", { children: moduleKey + " Module Records" })] }),
            d.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium", children: "Custom published CRM entity module powered by Supabase dynamic schema engine." })
          ]}),
          d.jsx("button", {
            onClick: () => { setShowModal(true); setStatusMsg(""); },
            className: "px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl flex items-center space-x-2 cursor-pointer transition transform hover:scale-105",
            children: "+ Add New " + moduleKey + " Record"
          })
        ]
      }),

      statusMsg ? d.jsx("div", { className: "p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300", children: statusMsg }) : null,

      loading ? d.jsx("div", { className: "p-12 text-center text-slate-400 font-bold", children: "Loading records from Supabase database..." }) :
      records.length === 0 ? d.jsxs("div", { className: "p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3", children: [d.jsx("div", { className: "text-4xl", children: "📭" }), d.jsx("h3", { className: "font-black text-base text-slate-700 dark:text-slate-300", children: "No Records Found" }), d.jsx("p", { className: "text-xs text-slate-500", children: "Click '+ Add New Record' to create your first record in " + moduleKey })] }) :
      d.jsx("div", {
        className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm",
        children: d.jsxs("table", {
          className: "w-full text-left text-xs font-semibold",
          children: [
            d.jsx("thead", {
              className: "bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]",
              children: d.jsxs("tr", {
                children: [
                  d.jsx("th", { className: "p-4", children: "Record Title" }),
                  fields.map(f => d.jsx("th", { key: f.id || f.fieldName, className: "p-4", children: f.fieldName })),
                  d.jsx("th", { className: "p-4", children: "Created At" })
                ]
              })
            }),
            d.jsx("tbody", {
              className: "divide-y divide-slate-100 dark:divide-slate-800",
              children: records.map(r => d.jsxs("tr", {
                key: r.id,
                className: "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition",
                children: [
                  d.jsx("td", { className: "p-4 font-bold text-slate-900 dark:text-white", children: r.title }),
                  fields.map(f => d.jsx("td", { key: f.id || f.fieldName, className: "p-4 text-slate-600 dark:text-slate-300", children: (r.data && r.data[f.fieldName.toLowerCase().replace(/[^a-z0-9]/g, "_")]) || "-" })),
                  d.jsx("td", { className: "p-4 text-slate-400 text-[10px]", children: new Date(r.createdAt || Date.now()).toLocaleDateString() })
                ]
              }))
            })
          ]
        })
      }),

      showModal ? d.jsx("div", {
        className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in",
        children: d.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6",
          children: [
            d.jsxs("div", { className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4", children: [d.jsx("h2", { className: "text-xl font-black text-slate-900 dark:text-white", children: "New " + moduleKey + " Record" }), d.jsx("button", { onClick: () => setShowModal(false), className: "p-2 text-slate-400 cursor-pointer", children: "✕" })] }),
            d.jsxs("form", {
              onSubmit: handleCreateRecord,
              className: "space-y-4 text-xs font-semibold",
              children: [
                d.jsxs("div", { children: [d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: "Record Title *" }), d.jsx("input", { type: "text", required: true, value: recordTitle, onChange: e => setRecordTitle(e.target.value), placeholder: "e.g. Luxury Penthouse", className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })] }),
                fields.map(f => {
                  const key = f.fieldName.toLowerCase().replace(/[^a-z0-9]/g, "_");
                  return d.jsxs("div", {
                    key: f.id || f.fieldName,
                    children: [
                      d.jsx("label", { className: "block font-bold text-slate-700 dark:text-slate-300 mb-1", children: f.fieldName + (f.isRequired ? " *" : "") }),
                      f.fieldType === "CHECKBOX" ? d.jsx("input", { type: "checkbox", checked: !!formData[key], onChange: e => setFormData({ ...formData, [key]: e.target.checked }), className: "rounded" }) :
                      f.fieldType === "DATE" ? d.jsx("input", { type: "date", value: formData[key] || "", onChange: e => setFormData({ ...formData, [key]: e.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" }) :
                      f.fieldType === "NUMBER" || f.fieldType === "CURRENCY" ? d.jsx("input", { type: "number", value: formData[key] || "", onChange: e => setFormData({ ...formData, [key]: e.target.value }), placeholder: "Enter " + f.fieldName, className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" }) :
                      d.jsx("input", { type: "text", value: formData[key] || "", onChange: e => setFormData({ ...formData, [key]: e.target.value }), placeholder: "Enter " + f.fieldName, className: "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" })
                    ]
                  });
                }),
                d.jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800", children: [
                  d.jsx("button", { type: "button", onClick: () => setShowModal(false), className: "px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
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

// Insert CustomModuleRecordComponent definition before FD()
const builderStart = code.indexOf('function CRMBuilderComponent()');
if (builderStart !== -1 && !code.includes('function CustomModuleRecordComponent()')) {
  code = code.substring(0, builderStart) + customModuleRecordJs + '\n' + code.substring(builderStart);
  console.log('[SUCCESS] Injected CustomModuleRecordComponent definition!');
}

// Mount routes in FD()
const customRoutes = `d.jsx(oe,{path:"/custom-module/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),d.jsx(oe,{path:"/records/:moduleKey",element:d.jsx(ve,{children:d.jsx(ge,{children:d.jsx(CustomModuleRecordComponent,{})})})}),`;

if (!code.includes('path:"/custom-module/:moduleKey"')) {
  const fdStart = code.indexOf('function FD()');
  if (fdStart !== -1) {
    const loginIdx = code.indexOf('path:"/login"', fdStart);
    if (loginIdx !== -1) {
      code = code.substring(0, loginIdx) + customRoutes + code.substring(loginIdx);
      console.log('[SUCCESS] Mounted /custom-module/:moduleKey and /records/:moduleKey routes in FD()!');
    }
  }
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Custom module record component script complete.');
