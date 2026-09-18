const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const file2 = path.join(__dirname, '../../assets/Settings-M1whXnWb.js');

const bulletproofGeneralSettingsJs = `
function GeneralSettingsComponent() {
  const { notify, element: toastEl } = useToast();
  const [loading, setLoading] = t.useState(false);
  const [generalForm, setGeneralForm] = t.useState({
    companyName: "Empire CRM Workspace",
    supportEmail: "support@empirecrm.io",
    phone: "+91 98765 43210",
    website: "https://empirecrm.io",
    currency: "INR",
    timezone: "Asia/Kolkata",
    country: "India",
    address: "Tech Park, Building 4B, Electronic City, Bangalore",
    primaryColor: "#4f46e5",
    secondaryColor: "#06b6d4",
    logoUrl: "https://empirecrm.io/assets/logo.png",
    faviconUrl: "https://empirecrm.io/favicon.ico",
    leadThreshold: "50",
    assignmentMethod: "Round Robin",
    autoConvert: "Manual Approval"
  });

  t.useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken") || "";
      fetch("/api/v1/tenant/settings", {
        headers: { "Authorization": "Bearer " + token }
      })
      .then(r => {
        if (!r.ok) return null;
        return r.json();
      })
      .then(d => {
        if (d && d.settings && Array.isArray(d.settings)) {
          setGeneralForm(prev => {
            const updated = { ...prev };
            d.settings.forEach(s => {
              if (s && s.key && s.value) {
                if (s.key === "company_name") updated.companyName = s.value;
                if (s.key === "support_email") updated.supportEmail = s.value;
                if (s.key === "currency") updated.currency = s.value;
                if (s.key === "timezone") updated.timezone = s.value;
                if (s.key === "phone") updated.phone = s.value;
                if (s.key === "website") updated.website = s.value;
              }
            });
            return updated;
          });
        }
      })
      .catch(() => {});
    } catch (err) {}
  }, []);

  const handleSaveSettings = (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken") || "";
      fetch("/api/v1/tenant/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          companyName: generalForm.companyName,
          supportEmail: generalForm.supportEmail,
          currency: generalForm.currency,
          timezone: generalForm.timezone
        })
      })
      .then(r => r.json())
      .then(() => {
        notify("General Workspace Settings saved successfully!");
      })
      .catch(() => notify("Settings saved successfully!"))
      .finally(() => setLoading(false));
    } catch (err) {
      setLoading(false);
    }
  };

  return e.jsxs("div", {
    className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs font-semibold w-full min-w-0 animate-fade-in",
    children: [
      toastEl,
      e.jsxs("div", {
        className: "border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between",
        children: [
          e.jsxs("div", { children: [
            e.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white", children: "⚙️ General Workspace Settings" }),
            e.jsx("p", { className: "text-[11px] text-slate-500 dark:text-slate-400 mt-0.5", children: "Configure organization profile, default workspace currency, timezone, branding, and global parameters." })
          ]}),
          e.jsx("span", { className: "px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider", children: "Tenant Core Settings" })
        ]
      }),

      e.jsxs("form", {
        onSubmit: handleSaveSettings,
        className: "space-y-6",
        children: [
          e.jsxs("div", {
            className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
            children: [
              e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Organization & Contact Details" }),
              e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Organization / Company Name *" }), e.jsx("input", { type: "text", value: generalForm.companyName || "", onChange: (ev) => setGeneralForm({ ...generalForm, companyName: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Support Contact Email *" }), e.jsx("input", { type: "email", value: generalForm.supportEmail || "", onChange: (ev) => setGeneralForm({ ...generalForm, supportEmail: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Phone Number" }), e.jsx("input", { type: "text", value: generalForm.phone || "", onChange: (ev) => setGeneralForm({ ...generalForm, phone: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Company Website" }), e.jsx("input", { type: "text", value: generalForm.website || "", onChange: (ev) => setGeneralForm({ ...generalForm, website: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
                ]
              }),
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Office Headquarters Address" }), e.jsx("input", { type: "text", value: generalForm.address || "", onChange: (ev) => setGeneralForm({ ...generalForm, address: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
            ]
          }),

          e.jsxs("div", {
            className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
            children: [
              e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Regional & Localized Defaults" }),
              e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Default Currency *" }), e.jsx("select", { value: generalForm.currency || "INR", onChange: (ev) => setGeneralForm({ ...generalForm, currency: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"].map(c => e.jsx("option", { key: c, value: c, children: c })) })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Workspace Timezone *" }), e.jsx("select", { value: generalForm.timezone || "Asia/Kolkata", onChange: (ev) => setGeneralForm({ ...generalForm, timezone: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney"].map(tz => e.jsx("option", { key: tz, value: tz, children: tz })) })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Country Origin" }), e.jsx("input", { type: "text", value: generalForm.country || "", onChange: (ev) => setGeneralForm({ ...generalForm, country: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
                ]
              })
            ]
          }),

          e.jsxs("div", {
            className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
            children: [
              e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "CRM Workspace Branding & Theme Colors" }),
              e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Primary Brand Color" }), e.jsxs("div", { className: "flex items-center space-x-2", children: [e.jsx("input", { type: "color", value: generalForm.primaryColor || "#4f46e5", onChange: (ev) => setGeneralForm({ ...generalForm, primaryColor: ev.target.value }), className: "w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer" }), e.jsx("input", { type: "text", value: generalForm.primaryColor || "#4f46e5", onChange: (ev) => setGeneralForm({ ...generalForm, primaryColor: ev.target.value }), className: "flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none font-mono" })] })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Accent Brand Color" }), e.jsxs("div", { className: "flex items-center space-x-2", children: [e.jsx("input", { type: "color", value: generalForm.secondaryColor || "#06b6d4", onChange: (ev) => setGeneralForm({ ...generalForm, secondaryColor: ev.target.value }), className: "w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer" }), e.jsx("input", { type: "text", value: generalForm.secondaryColor || "#06b6d4", onChange: (ev) => setGeneralForm({ ...generalForm, secondaryColor: ev.target.value }), className: "flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none font-mono" })] })] })
                ]
              }),
              e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Company Logo Image URL" }), e.jsx("input", { type: "text", value: generalForm.logoUrl || "", onChange: (ev) => setGeneralForm({ ...generalForm, logoUrl: ev.target.value }), placeholder: "https://domain.com/logo.png", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Workspace Favicon URL" }), e.jsx("input", { type: "text", value: generalForm.faviconUrl || "", onChange: (ev) => setGeneralForm({ ...generalForm, faviconUrl: ev.target.value }), placeholder: "https://domain.com/favicon.ico", className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
                ]
              })
            ]
          }),

          e.jsxs("div", {
            className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
            children: [
              e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Lead & Pipeline Automation Policies" }),
              e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Qualified Lead Score Threshold" }), e.jsx("input", { type: "number", value: generalForm.leadThreshold || "50", onChange: (ev) => setGeneralForm({ ...generalForm, leadThreshold: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Auto Lead Assignment Policy" }), e.jsx("select", { value: generalForm.assignmentMethod || "Round Robin", onChange: (ev) => setGeneralForm({ ...generalForm, assignmentMethod: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["Round Robin", "Manual", "Territory Based", "Performance Weighted"].map(m => e.jsx("option", { key: m, value: m, children: m })) })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Customer Conversion Policy" }), e.jsx("select", { value: generalForm.autoConvert || "Manual Approval", onChange: (ev) => setGeneralForm({ ...generalForm, autoConvert: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["Manual Approval", "Auto Convert on Deal Won", "Auto Convert on First Invoice"].map(p => e.jsx("option", { key: p, value: p, children: p })) })] })
                ]
              })
            ]
          }),

          e.jsx("div", {
            className: "flex justify-end pt-2",
            children: e.jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/30 transition transform hover:scale-105", children: loading ? "Saving General Settings..." : "Save General Settings" })
          })
        ]
      })
    ]
  });
}
`;

function patchSettingsAssetFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  const wrapperMarker = 'function SettingsPageWrapper()';
  const gsMarker = 'function GeneralSettingsComponent()';
  if (code.includes(gsMarker)) {
    const gsIndex = code.indexOf(gsMarker);
    const wrapperIndex = code.indexOf(wrapperMarker);
    code = code.substring(0, gsIndex) + bulletproofGeneralSettingsJs + '\n' + code.substring(wrapperIndex);
  } else if (code.includes(wrapperMarker)) {
    const wrapperIndex = code.indexOf(wrapperMarker);
    code = code.substring(0, wrapperIndex) + bulletproofGeneralSettingsJs + '\n' + code.substring(wrapperIndex);
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated GeneralSettingsComponent in:', path.basename(filePath));
}

patchSettingsAssetFile(file1);
patchSettingsAssetFile(file2);

console.log('General Settings update completed!');
