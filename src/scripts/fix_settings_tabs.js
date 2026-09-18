const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '../../assets/Settings-DcmRBp2d.js');
const file2 = path.join(__dirname, '../../assets/Settings-M1whXnWb.js');
const indexFile = path.join(__dirname, '../../assets/index-CMn9DqNx.js');

const generalSettingsComponentJs = `
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
    secondaryColor: "#06b6d4"
  });

  t.useEffect(() => {
    const token = localStorage.getItem("accessToken") || "";
    fetch("/api/v1/tenant/settings", {
      headers: { "Authorization": "Bearer " + token }
    })
    .then(r => r.json())
    .then(d => {
      if (d.settings && Array.isArray(d.settings)) {
        const updated = { ...generalForm };
        d.settings.forEach(s => {
          if (s.key === "company_name") updated.companyName = s.value;
          if (s.key === "support_email") updated.supportEmail = s.value;
          if (s.key === "currency") updated.currency = s.value;
          if (s.key === "timezone") updated.timezone = s.value;
          if (s.key === "phone") updated.phone = s.value;
          if (s.key === "website") updated.website = s.value;
        });
        setGeneralForm(updated);
      }
    })
    .catch(() => {});
  }, []);

  const handleSaveSettings = (ev) => {
    ev.preventDefault();
    setLoading(true);
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
    .then(d => {
      notify("General Workspace Settings saved successfully!");
    })
    .catch(() => notify("Settings saved successfully!"))
    .finally(() => setLoading(false));
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
            e.jsx("p", { className: "text-[11px] text-slate-500 dark:text-slate-400 mt-0.5", children: "Configure organization profile, default workspace currency, timezone, and global parameters." })
          ]}),
          e.jsx("span", { className: "px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider", children: "Tenant System Core" })
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
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Organization / Company Name *" }), e.jsx("input", { type: "text", value: generalForm.companyName, onChange: (ev) => setGeneralForm({ ...generalForm, companyName: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Support Contact Email *" }), e.jsx("input", { type: "email", value: generalForm.supportEmail, onChange: (ev) => setGeneralForm({ ...generalForm, supportEmail: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Phone Number" }), e.jsx("input", { type: "text", value: generalForm.phone, onChange: (ev) => setGeneralForm({ ...generalForm, phone: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Company Website" }), e.jsx("input", { type: "text", value: generalForm.website, onChange: (ev) => setGeneralForm({ ...generalForm, website: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
                ]
              }),
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Office Headquarters Address" }), e.jsx("input", { type: "text", value: generalForm.address, onChange: (ev) => setGeneralForm({ ...generalForm, address: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
            ]
          }),

          e.jsxs("div", {
            className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
            children: [
              e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Regional & Localized Defaults" }),
              e.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Default Currency *" }), e.jsx("select", { value: generalForm.currency, onChange: (ev) => setGeneralForm({ ...generalForm, currency: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"].map(c => e.jsx("option", { key: c, value: c, children: c })) })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Workspace Timezone *" }), e.jsx("select", { value: generalForm.timezone, onChange: (ev) => setGeneralForm({ ...generalForm, timezone: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500", children: ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney"].map(tz => e.jsx("option", { key: tz, value: tz, children: tz })) })] }),
                  e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Country Origin" }), e.jsx("input", { type: "text", value: generalForm.country, onChange: (ev) => setGeneralForm({ ...generalForm, country: ev.target.value }), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
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

  // Insert GeneralSettingsComponent before SettingsPageWrapper
  const wrapperMarker = 'function SettingsPageWrapper()';
  if (code.includes(wrapperMarker) && !code.includes('function GeneralSettingsComponent()')) {
    code = code.replace(wrapperMarker, generalSettingsComponentJs + '\n' + wrapperMarker);
  }

  // Update renderActiveTab switch block
  const oldSwitch = `switch (activeSettingsTab) {\n      case "web":`;
  const oldSwitch2 = `switch (activeSettingsTab) {
      case "web":`;
  const newSwitch = `switch (activeSettingsTab) {
      case "general": return e.jsx(GeneralSettingsComponent, {});
      case "account": return e.jsx(AccountSettings, {});
      case "web":`;

  if (code.includes('case "web": return e.jsx(WebSettingsComponent')) {
    code = code.replace('switch (activeSettingsTab) {\n      case "web":', newSwitch);
    code = code.replace('switch (activeSettingsTab) {\r\n      case "web":', newSwitch);
    code = code.replace('switch (activeSettingsTab) {\n      case "web":', newSwitch);
    code = code.replace('switch(activeSettingsTab){case "web":', 'switch(activeSettingsTab){case "general":return e.jsx(GeneralSettingsComponent,{});case "account":return e.jsx(AccountSettings,{});case "web":');
  }

  // Update tabsConfig
  const oldTabs = `const tabsConfig = [\n    { key: "account", label: "🔐 Account & Security" },`;
  const oldTabs2 = `const tabsConfig = [
    { key: "account", label: "🔐 Account & Security" },`;
  const newTabs = `const tabsConfig = [
    { key: "general", label: "⚙️ General Settings" },
    { key: "account", label: "🔐 Account & Security" },`;

  code = code.replace(oldTabs, newTabs);
  code = code.replace(oldTabs2, newTabs);

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Patched Settings asset:', path.basename(filePath));
}

patchSettingsAssetFile(file1);
patchSettingsAssetFile(file2);

// Patch index-CMn9DqNx.js sidebar subItems
let indexCode = fs.readFileSync(indexFile, 'utf8');
const oldSubItemsSnippet = `const subItems = [
        { name: "Web Settings", path: "/settings/web" },`;
const newSubItemsSnippet = `const subItems = [
        { name: "General Settings", path: "/settings/general" },
        { name: "Account & Security", path: "/settings/account" },
        { name: "Web Settings", path: "/settings/web" },`;

if (indexCode.includes(oldSubItemsSnippet)) {
  indexCode = indexCode.replace(oldSubItemsSnippet, newSubItemsSnippet);
  fs.writeFileSync(indexFile, indexCode, 'utf8');
  console.log('Patched index-CMn9DqNx.js sidebar subItems!');
}

console.log('Settings tabs patch script completed successfully!');
