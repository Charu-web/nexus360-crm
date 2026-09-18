import { c, w as se, r as t, j as e, a as te, x as ae, f as le, X as re, n as D, p as oe, M as de } from "./index-Ftt5f73P.js";
import { S as ne } from "./square-pen-Cqfm8O-A.js";
import { R as ie } from "./rotate-ccw-DjshX79R.js";
import { E as y } from "./eye-aYyo--4G.js";

// EyeOff icon
const S = c("EyeOff", [
  ["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49", key: "ct8e1f" }],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143", key: "13bj9a" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
]);

// Key icon
const ce = c("Key", [
  ["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }],
  ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }],
  ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]
]);

// Laptop icon
const xe = c("Laptop", [
  ["path", { d: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16", key: "tarvll" }]
]);

// SlidersVertical icon
const me = c("SlidersVertical", [
  ["line", { x1: "4", x2: "4", y1: "21", y2: "14", key: "1p332r" }],
  ["line", { x1: "4", x2: "4", y1: "10", y2: "3", key: "gb41h5" }],
  ["line", { x1: "12", x2: "12", y1: "21", y2: "12", key: "hf2csr" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "3", key: "1kfi7u" }],
  ["line", { x1: "20", x2: "20", y1: "21", y2: "16", key: "1lhrwl" }],
  ["line", { x1: "20", x2: "20", y1: "12", y2: "3", key: "16vvfq" }],
  ["line", { x1: "2", x2: "6", y1: "14", y2: "14", key: "1uebub" }],
  ["line", { x1: "10", x2: "14", y1: "8", y2: "8", key: "1yglbp" }],
  ["line", { x1: "18", x2: "22", y1: "16", y2: "16", key: "1jxqpz" }]
]);

// Smartphone icon
const O = c("Smartphone", [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
]);

// Default permissions data
const i = {
  "Super Admin": [
    { module: "Leads Management", permissions: [{ name: "Create Leads", allowed: true }, { name: "Update Status", allowed: true }, { name: "Assign Reps", allowed: true }, { name: "Delete Leads", allowed: true }] },
    { module: "Deals & Pipeline", permissions: [{ name: "Move Stages", allowed: true }, { name: "View Revenue", allowed: true }, { name: "Modify Deal Value", allowed: true }] },
    { module: "Customers & LTV", permissions: [{ name: "View Accounts", allowed: true }, { name: "Export CSV", allowed: true }, { name: "Manage LTV Status", allowed: true }] },
    { module: "Tasks & Calendar", permissions: [{ name: "Schedule Calls", allowed: true }, { name: "Assign Tasks", allowed: true }, { name: "Mark Complete", allowed: true }] },
    { module: "Finance & Invoices", permissions: [{ name: "Issue Invoices", allowed: true }, { name: "Process Payments", allowed: true }, { name: "Export Audit Logs", allowed: true }] }
  ],
  "Sales Lead": [
    { module: "Leads Management", permissions: [{ name: "Create Leads", allowed: true }, { name: "Update Status", allowed: true }, { name: "Assign Reps", allowed: true }, { name: "Delete Leads", allowed: false }] },
    { module: "Deals & Pipeline", permissions: [{ name: "Move Stages", allowed: true }, { name: "View Revenue", allowed: true }, { name: "Modify Deal Value", allowed: true }] },
    { module: "Customers & LTV", permissions: [{ name: "View Accounts", allowed: true }, { name: "Export CSV", allowed: true }, { name: "Manage LTV Status", allowed: false }] },
    { module: "Tasks & Calendar", permissions: [{ name: "Schedule Calls", allowed: true }, { name: "Assign Tasks", allowed: true }, { name: "Mark Complete", allowed: true }] },
    { module: "Finance & Invoices", permissions: [{ name: "Issue Invoices", allowed: true }, { name: "Process Payments", allowed: false }, { name: "Export Audit Logs", allowed: false }] }
  ],
  "Support Agent": [
    { module: "Leads Management", permissions: [{ name: "Create Leads", allowed: true }, { name: "Update Status", allowed: true }, { name: "Assign Reps", allowed: false }, { name: "Delete Leads", allowed: false }] },
    { module: "Deals & Pipeline", permissions: [{ name: "Move Stages", allowed: false }, { name: "View Revenue", allowed: false }, { name: "Modify Deal Value", allowed: false }] },
    { module: "Customers & LTV", permissions: [{ name: "View Accounts", allowed: true }, { name: "Export CSV", allowed: false }, { name: "Manage LTV Status", allowed: false }] },
    { module: "Tasks & Calendar", permissions: [{ name: "Schedule Calls", allowed: true }, { name: "Assign Tasks", allowed: false }, { name: "Mark Complete", allowed: true }] },
    { module: "Finance & Invoices", permissions: [{ name: "Issue Invoices", allowed: false }, { name: "Process Payments", allowed: false }, { name: "Export Audit Logs", allowed: false }] }
  ],
  "Staff Member": [
    { module: "Leads Management", permissions: [{ name: "Create Leads", allowed: true }, { name: "Update Status", allowed: false }, { name: "Assign Reps", allowed: false }, { name: "Delete Leads", allowed: false }] },
    { module: "Deals & Pipeline", permissions: [{ name: "Move Stages", allowed: false }, { name: "View Revenue", allowed: false }, { name: "Modify Deal Value", allowed: false }] },
    { module: "Customers & LTV", permissions: [{ name: "View Accounts", allowed: true }, { name: "Export CSV", allowed: false }, { name: "Manage LTV Status", allowed: false }] },
    { module: "Tasks & Calendar", permissions: [{ name: "Schedule Calls", allowed: true }, { name: "Assign Tasks", allowed: false }, { name: "Mark Complete", allowed: true }] },
    { module: "Finance & Invoices", permissions: [{ name: "Issue Invoices", allowed: false }, { name: "Process Payments", allowed: false }, { name: "Export Audit Logs", allowed: false }] }
  ]
};

const ue = [
  { id: "s1", device: "Windows PC • Chrome 124", ip: "192.168.1.42", location: "Primary Session (Current)", isCurrent: true, lastActive: "Active Now" },
  { id: "s2", device: "iPhone 15 Pro • Safari 17.4", ip: "10.0.0.88", location: "Mobile App • London, UK", isCurrent: false, lastActive: "2 hours ago" }
];

// Helper to render local status toasts
const useToast = () => {
  const [toast, setToast] = t.useState(null);
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };
  const element = toast ? e.jsxs("div", {
    className: "fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce",
    children: [
      e.jsx(te, { className: "w-4 h-4 text-emerald-300 flex-shrink-0" }),
      e.jsx("span", { children: toast })
    ]
  }) : null;
  return { notify, element };
};

/* === TAB 1: ACCOUNT & SECURITY SETTINGS === */
function AccountSettings() {
  const { notify, element: toastEl } = useToast();
  const [user, setUser] = t.useState(() => {
    const s = localStorage.getItem("leadflow_user");
    return s ? JSON.parse(s) : { name: "Admin User", email: "admin@empirecrm.io", role: "Super Admin", phone: "+91 98765 43210" };
  });

  const [oldPass, setOldPass] = t.useState("");
  const [newPass, setNewPass] = t.useState("");
  const [confirmPass, setConfirmPass] = t.useState("");
  const [passError, setPassError] = t.useState("");
  const [isChangingPass, setIsChangingPass] = t.useState(false);

  const [sessions, setSessions] = t.useState(() => {
    const s = localStorage.getItem("leadflow_sessions");
    return s ? JSON.parse(s) : [
      { id: "sess-1", browser: "Chrome / Windows 11", ip: "103.21.124.8", lastActive: "Active Now", current: true },
      { id: "sess-2", browser: "Safari / macOS Ventura", ip: "49.36.192.14", lastActive: "2 hours ago", current: false }
    ];
  });

  const handlePasswordChange = (ev) => {
    ev.preventDefault();
    setPassError("");
    if (!oldPass) { setPassError("Please enter your current password."); return; }
    if (!newPass || newPass.length < 6) { setPassError("New password must be at least 6 characters."); return; }
    if (newPass !== confirmPass) { setPassError("New password and confirm password do not match."); return; }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      notify("Security password updated successfully!");
    }, 600);
  };

  const terminateSession = (sessId) => {
    const updated = sessions.filter(s => s.id !== sessId);
    setSessions(updated);
    localStorage.setItem("leadflow_sessions", JSON.stringify(updated));
    notify("Session terminated successfully.");
  };

  return e.jsxs("div", {
    className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs font-semibold w-full min-w-0",
    children: [
      toastEl,
      e.jsx("div", {
        className: "border-b border-slate-200 dark:border-slate-800 pb-3",
        children: e.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white", children: "Account Security & Credentials" })
      }),

      // Profile Information
      e.jsxs("div", {
        className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
        children: [
          e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Profile Information" }),
          e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-4",
            children: [
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-500 mb-1", children: "Full Name" }), e.jsx("input", { type: "text", readOnly: true, value: user.name, className: "w-full px-4 py-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })] }),
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-500 mb-1", children: "Email Address" }), e.jsx("input", { type: "email", readOnly: true, value: user.email, className: "w-full px-4 py-2.5 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" })] })
            ]
          })
        ]
      }),

      // Password Change
      e.jsxs("form", {
        onSubmit: handlePasswordChange,
        className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
        children: [
          e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Change Password" }),
          e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-4",
            children: [
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Current Password *" }), e.jsx("input", { type: "password", value: oldPass, onChange: (ev) => setOldPass(ev.target.value), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "New Password *" }), e.jsx("input", { type: "password", value: newPass, onChange: (ev) => setNewPass(ev.target.value), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] }),
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Confirm New Password *" }), e.jsx("input", { type: "password", value: confirmPass, onChange: (ev) => setConfirmPass(ev.target.value), className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" })] })
            ]
          }),
          passError && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold", children: passError }),
          e.jsx("div", {
            className: "flex justify-end pt-2",
            children: e.jsx("button", { type: "submit", disabled: isChangingPass, className: "px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-sm", children: isChangingPass ? "Updating Password..." : "Update Password" })
          })
        ]
      }),

      // Active Sessions
      e.jsxs("div", {
        className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
        children: [
          e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Active Logged In Sessions" }),
          e.jsx("div", {
            className: "space-y-2",
            children: sessions.map(sess => e.jsxs("div", {
              className: "flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              children: [
                e.jsxs("div", { children: [e.jsxs("div", { className: "font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2", children: [e.jsx("span", { children: sess.browser }), sess.current && e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold", children: "CURRENT SESSION" })] }), e.jsx("div", { className: "text-[10px] text-slate-400 mt-0.5", children: `IP: ${sess.ip} • Last active ${sess.lastActive}` })] }),
                !sess.current && e.jsx("button", { type: "button", onClick: () => terminateSession(sess.id), className: "px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 font-bold hover:bg-rose-500/20 cursor-pointer", children: "Revoke" })
              ]
            }, sess.id))
          })
        ]
      })
    ]
  });
}

/* === TAB 2: WEB SETTINGS === */
function WebSettingsComponent() {
  const { notify, element: toastEl } = useToast();
  const [isSaving, setIsSaving] = t.useState(false);
  const [errors, setErrors] = t.useState({});

  const [webData, setWebData] = t.useState(() => {
    const s = localStorage.getItem("leadflow_web_settings");
    return s ? JSON.parse(s) : {
      companyName: "Empire IT Xpert",
      websiteUrl: "https://empireitxpert.in",
      email: "info@empireitxpert.in",
      phone: "+91 99132 99865",
      address: "102, Shanti Complex, Sector 15, Noida, UP, India",
      fbLink: "https://facebook.com/empireitxpert",
      twLink: "https://twitter.com/empireitxpert",
      liLink: "https://linkedin.com/company/empireitxpert",
      instaLink: "https://instagram.com/empireitxpert"
    };
  });

  t.useEffect(() => {
    const saved = localStorage.getItem("leadflow_web_settings");
    if (saved) {
      try {
        setWebData(JSON.parse(saved));
      } catch (err) {}
    }
  }, []);

  const normalizeUrl = (urlStr) => {
    if (!urlStr || !urlStr.trim()) return "";
    let trimmed = urlStr.trim();
    if (!new RegExp('^https?://', 'i').test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!webData.companyName || !webData.companyName.trim()) {
      newErrors.companyName = "Company Name is required.";
    }

    if (!webData.email || !webData.email.trim()) {
      newErrors.email = "Support Email is required.";
    } else if (!new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$').test(webData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. info@domain.com).";
    }

    if (webData.websiteUrl && webData.websiteUrl.trim()) {
      const urlCandidate = normalizeUrl(webData.websiteUrl);
      if (!new RegExp('^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$', 'i').test(webData.websiteUrl.trim()) && !new RegExp('^https?://', 'i').test(urlCandidate)) {
        newErrors.websiteUrl = "Please enter a valid website URL.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validateForm()) {
      notify("Please fix validation errors before saving.");
      return;
    }

    setIsSaving(true);

    const formattedData = {
      ...webData,
      companyName: webData.companyName.trim(),
      email: webData.email.trim(),
      phone: (webData.phone || "").trim(),
      address: (webData.address || "").trim(),
      websiteUrl: normalizeUrl(webData.websiteUrl),
      fbLink: normalizeUrl(webData.fbLink),
      twLink: normalizeUrl(webData.twLink),
      liLink: normalizeUrl(webData.liLink),
      instaLink: normalizeUrl(webData.instaLink)
    };

    setTimeout(() => {
      try {
        localStorage.setItem("leadflow_web_settings", JSON.stringify(formattedData));
        setWebData(formattedData);
        setIsSaving(false);
        notify("Web Appearance & Corporate Settings saved successfully!");
      } catch (err) {
        setIsSaving(false);
        notify("Failed to save settings. Please try again.");
      }
    }, 600);
  };

  return e.jsxs("form", {
    onSubmit: onSubmit,
    noValidate: true,
    className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs font-semibold w-full min-w-0",
    children: [
      toastEl,
      e.jsx("div", {
        className: "border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white", children: "Corporate & Web Settings" }),
            e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mt-0.5", children: "Manage company identity, contact channels, and social media profile URLs." })
          ]
        })
      }),

      // Company Info Section
      e.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-5",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Company Name *" }),
              e.jsx("input", {
                type: "text",
                required: true,
                value: webData.companyName,
                onChange: (ev) => {
                  setWebData({ ...webData, companyName: ev.target.value });
                  if (errors.companyName) setErrors({ ...errors, companyName: null });
                },
                placeholder: "e.g. Empire IT Xpert",
                className: `w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border ${errors.companyName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"} outline-none focus:border-indigo-500 transition`
              }),
              errors.companyName && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold mt-1", children: errors.companyName })
            ]
          }),

          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Website URL" }),
              e.jsx("input", {
                type: "text",
                value: webData.websiteUrl,
                onChange: (ev) => {
                  setWebData({ ...webData, websiteUrl: ev.target.value });
                  if (errors.websiteUrl) setErrors({ ...errors, websiteUrl: null });
                },
                placeholder: "e.g. https://empireitxpert.in",
                className: `w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border ${errors.websiteUrl ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"} outline-none focus:border-indigo-500 transition`
              }),
              errors.websiteUrl && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold mt-1", children: errors.websiteUrl })
            ]
          }),

          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Support Email *" }),
              e.jsx("input", {
                type: "email",
                required: true,
                value: webData.email,
                onChange: (ev) => {
                  setWebData({ ...webData, email: ev.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                },
                placeholder: "info@company.com",
                className: `w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border ${errors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"} outline-none focus:border-indigo-500 transition`
              }),
              errors.email && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold mt-1", children: errors.email })
            ]
          }),

          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Support Phone" }),
              e.jsx("input", {
                type: "text",
                value: webData.phone,
                onChange: (ev) => setWebData({ ...webData, phone: ev.target.value }),
                placeholder: "+91 99132 99865",
                className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
              })
            ]
          }),

          e.jsxs("div", {
            className: "md:col-span-2",
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Headquarters Address" }),
              e.jsx("textarea", {
                rows: 2,
                value: webData.address,
                onChange: (ev) => setWebData({ ...webData, address: ev.target.value }),
                placeholder: "Enter full street address, city, state, country",
                className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition resize-none"
              })
            ]
          })
        ]
      }),

      // Social Links Section
      e.jsx("div", {
        className: "border-t border-slate-200 dark:border-slate-800 pt-5",
        children: e.jsxs("div", {
          children: [
            e.jsx("h3", { className: "font-black text-slate-900 dark:text-white mb-0.5 text-sm", children: "Social Profiles Integration" }),
            e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mb-4", children: "Connect company social profiles for automated client branding and email footers." })
          ]
        })
      }),

      e.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-5",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Facebook Profile Link" }),
              e.jsx("input", {
                type: "text",
                value: webData.fbLink,
                onChange: (ev) => setWebData({ ...webData, fbLink: ev.target.value }),
                placeholder: "https://facebook.com/yourcompany",
                className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
              })
            ]
          }),

          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Twitter Profile Link" }),
              e.jsx("input", {
                type: "text",
                value: webData.twLink,
                onChange: (ev) => setWebData({ ...webData, twLink: ev.target.value }),
                placeholder: "https://twitter.com/yourcompany",
                className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
              })
            ]
          }),

          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "LinkedIn Company Link" }),
              e.jsx("input", {
                type: "text",
                value: webData.liLink,
                onChange: (ev) => setWebData({ ...webData, liLink: ev.target.value }),
                placeholder: "https://linkedin.com/company/yourcompany",
                className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
              })
            ]
          }),

          e.jsxs("div", {
            children: [
              e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1.5", children: "Instagram Profile Link" }),
              e.jsx("input", {
                type: "text",
                value: webData.instaLink,
                onChange: (ev) => setWebData({ ...webData, instaLink: ev.target.value }),
                placeholder: "https://instagram.com/yourcompany",
                className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
              })
            ]
          })
        ]
      }),

      // Submit Button Bar
      e.jsxs("div", {
        className: "flex items-center justify-end space-x-3 pt-5 border-t border-slate-200 dark:border-slate-800",
        children: [
          e.jsx("button", {
            type: "submit",
            disabled: isSaving,
            className: `px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95 flex items-center space-x-2 ${isSaving ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`,
            children: isSaving ? "Saving Settings..." : "Save Web Settings"
          })
        ]
      })
    ]
  });
}

/* === TAB 3: LEAD SETTINGS === */
function LeadSettingsComponent() {
  const { notify, element: toastEl } = useToast();
  const [sources, setSources] = t.useState(["website", "referral", "indiamart", "justdial", "linkedin", "google_ads"]);
  const [statuses, setStatuses] = t.useState(["new", "contacted", "processing", "proposal", "negotiation", "won", "lost"]);
  const [roundRobin, setRoundRobin] = t.useState(true);
  const [defaultAssignee, setDefaultAssignee] = t.useState("Preeti Patel");

  const [newSource, setNewSource] = t.useState("");
  const [newStatus, setNewStatus] = t.useState("");

  const [sourceError, setSourceError] = t.useState("");
  const [statusError, setStatusError] = t.useState("");
  const [isSaving, setIsSaving] = t.useState(false);
  const [isTogglingRR, setIsTogglingRR] = t.useState(false);

  const agents = ["Preeti Patel", "Rahul Sharma", "Sarah Miller", "Amit Verma", "Admin User", "Dev Tech"];

  t.useEffect(() => {
    const saved = localStorage.getItem("leadflow_lead_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sources && Array.isArray(parsed.sources)) setSources(parsed.sources);
        if (parsed.statuses && Array.isArray(parsed.statuses)) setStatuses(parsed.statuses);
        if (parsed.roundRobin !== undefined) setRoundRobin(Boolean(parsed.roundRobin));
        if (parsed.defaultAssignee) setDefaultAssignee(parsed.defaultAssignee);
      } catch (err) {}
    }
  }, []);

  const saveFullSettings = (updatedSources, updatedStatuses, rr, assignee, message) => {
    setIsSaving(true);
    const payload = {
      sources: updatedSources,
      statuses: updatedStatuses,
      roundRobin: rr,
      defaultAssignee: assignee,
      updatedAt: new Date().toISOString()
    };
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          localStorage.setItem("leadflow_lead_settings", JSON.stringify(payload));
          setIsSaving(false);
          if (message) notify(message);
          resolve(true);
        } catch (err) {
          setIsSaving(false);
          notify("Failed to save Lead Settings.");
          reject(err);
        }
      }, 400);
    });
  };

  const handleToggleRoundRobin = (ev) => {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (isTogglingRR) return; // Prevent double triggering

    const previousState = roundRobin;
    const nextState = !previousState;

    setIsTogglingRR(true);
    setRoundRobin(nextState);

    saveFullSettings(sources, statuses, nextState, defaultAssignee, `Round-Robin distribution ${nextState ? "enabled" : "disabled"}.`)
      .then(() => {
        setIsTogglingRR(false);
      })
      .catch(() => {
        // Revert on failure
        setRoundRobin(previousState);
        setIsTogglingRR(false);
        notify("Failed to update Round-Robin setting. Reverted to previous state.");
      });
  };

  const addSource = (ev) => {
    if (ev) ev.preventDefault();
    setSourceError("");
    const trimmed = newSource.trim();
    if (!trimmed) {
      setSourceError("Please enter a lead source name.");
      return;
    }
    const formatted = trimmed.toLowerCase().replace(/\s+/g, "_");
    if (sources.some(s => s.toLowerCase() === formatted)) {
      setSourceError("This lead source already exists.");
      return;
    }
    const updated = [...sources, formatted];
    setSources(updated);
    setNewSource("");
    saveFullSettings(updated, statuses, roundRobin, defaultAssignee, `Lead source "${formatted}" added!`);
  };

  const removeSource = (srcToDelete) => {
    const updated = sources.filter(s => s !== srcToDelete);
    setSources(updated);
    saveFullSettings(updated, statuses, roundRobin, defaultAssignee, `Lead source "${srcToDelete}" removed.`);
  };

  const addStatus = (ev) => {
    if (ev) ev.preventDefault();
    setStatusError("");
    const trimmed = newStatus.trim();
    if (!trimmed) {
      setStatusError("Please enter a lead status name.");
      return;
    }
    const formatted = trimmed.toLowerCase().replace(/\s+/g, "_");
    if (statuses.some(st => st.toLowerCase() === formatted)) {
      setStatusError("This lead status already exists.");
      return;
    }
    const updated = [...statuses, formatted];
    setStatuses(updated);
    setNewStatus("");
    saveFullSettings(sources, updated, roundRobin, defaultAssignee, `Lead status "${formatted}" added!`);
  };

  const removeStatus = (stToDelete) => {
    const updated = statuses.filter(st => st !== stToDelete);
    setStatuses(updated);
    saveFullSettings(sources, updated, roundRobin, defaultAssignee, `Lead status "${stToDelete}" removed.`);
  };

  const handleManualSave = (ev) => {
    ev.preventDefault();
    saveFullSettings(sources, statuses, roundRobin, defaultAssignee, "Lead Settings saved successfully!");
  };

  return e.jsxs("form", {
    onSubmit: handleManualSave,
    className: "p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs font-semibold w-full min-w-0 box-border",
    children: [
      toastEl,
      e.jsx("div", {
        className: "border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between",
        children: e.jsxs("div", {
          children: [
            e.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white", children: "Lead Capture & Allocation Rules" }),
            e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mt-0.5", children: "Configure automated lead assignment, routing pipelines, lead sources, and stage statuses." })
          ]
        })
      }),

      // Automatic Assignment Settings Section
      e.jsxs("div", {
        className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-5",
        children: [
          e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Automatic Assignment Settings" }),

          // Round Robin Toggle Row
          e.jsxs("div", {
            className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all",
            children: [
              e.jsxs("div", {
                className: "space-y-1 cursor-pointer select-none",
                onClick: handleToggleRoundRobin,
                children: [
                  e.jsxs("div", { className: "font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2.5", children: [
                    e.jsx("span", { children: "Round-Robin Lead Distribution" }),
                    e.jsx("span", { className: `px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase transition-all ${roundRobin ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-500/15 text-slate-500 border border-slate-500/30"}`, children: roundRobin ? "ENABLED" : "DISABLED" })
                  ]}),
                  e.jsx("p", { className: "text-[10px] text-slate-400 font-medium", children: "Automatically route incoming web/API leads sequentially across sales staff." })
                ]
              }),

              // Toggle Button Switch
              e.jsx("button", {
                type: "button",
                onClick: handleToggleRoundRobin,
                disabled: isTogglingRR,
                className: `relative inline-flex items-center w-12 h-6.5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${roundRobin ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"} ${isTogglingRR ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} shrink-0 shadow-inner z-10`,
                title: roundRobin ? "Click to Disable Round-Robin" : "Click to Enable Round-Robin",
                "aria-label": "Toggle Round-Robin Lead Distribution",
                children: e.jsx("span", {
                  className: `pointer-events-none inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${roundRobin ? "translate-x-6 bg-white" : "translate-x-1 bg-white"}`
                })
              })
            ]
          }),

          // Default Lead Representative Dropdown Control Row
          e.jsxs("div", {
            className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/60",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("div", { className: "font-bold text-slate-800 dark:text-slate-200", children: "Default Lead Representative" }),
                  e.jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5", children: "Assign this staff member if round-robin is disabled or fallback allocation is needed." })
                ]
              }),
              e.jsxs("div", {
                className: "relative w-full sm:w-64 z-20",
                children: [
                  e.jsx("select", {
                    value: defaultAssignee,
                    onChange: (ev) => {
                      const newAssignee = ev.target.value;
                      setDefaultAssignee(newAssignee);
                      saveFullSettings(sources, statuses, roundRobin, newAssignee, `Default representative updated to ${newAssignee}.`);
                    },
                    className: "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none cursor-pointer text-xs font-bold shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-9",
                    children: agents.map(agent => e.jsx("option", { value: agent, children: agent }, agent))
                  }),
                  e.jsx("div", {
                    className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400",
                    children: e.jsx("span", { className: "text-xs font-bold", children: "▼" })
                  })
                ]
              })
            ]
          })
        ]
      }),

      // Lead Sources & Statuses Grid
      e.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
        children: [
          // Configured Lead Sources
          e.jsxs("div", {
            className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400", children: "Configured Lead Sources" }),
                  e.jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5", children: "Inbound channels used to capture and filter incoming lead entries." })
                ]
              }),

              e.jsxs("div", {
                className: "space-y-1.5",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx("input", {
                        type: "text",
                        value: newSource,
                        onChange: (ev) => {
                          setNewSource(ev.target.value);
                          if (sourceError) setSourceError("");
                        },
                        onKeyDown: (ev) => { if (ev.key === "Enter") { ev.preventDefault(); addSource(); } },
                        placeholder: "e.g. facebook_ads",
                        className: `flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border ${sourceError ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"} outline-none focus:border-indigo-500 transition`
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: addSource,
                        className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm transition active:scale-95 cursor-pointer shrink-0",
                        children: "+ Add"
                      })
                    ]
                  }),
                  sourceError && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold", children: sourceError })
                ]
              }),

              e.jsx("div", {
                className: "flex flex-wrap gap-2 pt-1 max-h-52 overflow-y-auto scrollbar-thin",
                children: sources.map(src => e.jsxs("span", {
                  className: "px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold flex items-center space-x-1.5 shadow-sm text-[11px]",
                  children: [
                    e.jsx("span", { children: src }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => removeSource(src),
                      className: "text-rose-500 hover:text-rose-600 font-black hover:scale-125 ml-1 transition cursor-pointer px-1 py-0.5 rounded-full hover:bg-rose-500/10",
                      title: `Delete source "${src}"`,
                      children: "×"
                    })
                  ]
                }, src))
              })
            ]
          }),

          // Configured Lead Statuses
          e.jsxs("div", {
            className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-400", children: "Configured Lead Statuses" }),
                  e.jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5", children: "Lifecycle pipeline stages for Kanban boards and sales tracking." })
                ]
              }),

              e.jsxs("div", {
                className: "space-y-1.5",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx("input", {
                        type: "text",
                        value: newStatus,
                        onChange: (ev) => {
                          setNewStatus(ev.target.value);
                          if (statusError) setStatusError("");
                        },
                        onKeyDown: (ev) => { if (ev.key === "Enter") { ev.preventDefault(); addStatus(); } },
                        placeholder: "e.g. follow_up_scheduled",
                        className: `flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border ${statusError ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200 dark:border-slate-700"} outline-none focus:border-indigo-500 transition`
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: addStatus,
                        className: "px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm transition active:scale-95 cursor-pointer shrink-0",
                        children: "+ Add"
                      })
                    ]
                  }),
                  statusError && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold", children: statusError })
                ]
              }),

              e.jsx("div", {
                className: "flex flex-wrap gap-2 pt-1 max-h-52 overflow-y-auto scrollbar-thin",
                children: statuses.map(st => e.jsxs("span", {
                  className: "px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center space-x-1.5 shadow-sm text-[11px]",
                  children: [
                    e.jsx("span", { children: st }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => removeStatus(st),
                      className: "text-rose-500 hover:text-rose-600 font-black hover:scale-125 ml-1 transition cursor-pointer px-1 py-0.5 rounded-full hover:bg-rose-500/10",
                      title: `Delete status "${st}"`,
                      children: "×"
                    })
                  ]
                }, st))
              })
            ]
          })
        ]
      }),

      // Save Lead Settings Button Bar
      e.jsxs("div", {
        className: "flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800",
        children: [
          e.jsx("button", {
            type: "submit",
            disabled: isSaving,
            className: `px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95 flex items-center space-x-2 ${isSaving ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`,
            children: isSaving ? "Saving Lead Settings..." : "Save Lead Settings"
          })
        ]
      })
    ]
  });
}

/* === TAB 4: HRMS SETTINGS === */
function HRMSSettingsComponent() {
  const { notify, element: toastEl } = useToast();
  const [departments, setDepartments] = t.useState(["Sales", "Marketing", "Customer Support", "Operations", "Finance"]);
  const [leaveTypes, setLeaveTypes] = t.useState(["Casual Leave", "Sick Leave", "Privilege Leave", "Maternity Leave"]);
  const [newDept, setNewDept] = t.useState("");
  const [newLeave, setNewLeave] = t.useState("");
  const [shiftStart, setShiftStart] = t.useState("09:30");
  const [shiftEnd, setShiftEnd] = t.useState("18:30");

  t.useEffect(() => {
    const s = localStorage.getItem("leadflow_hrms_settings");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (parsed.departments) setDepartments(parsed.departments);
        if (parsed.leaveTypes) setLeaveTypes(parsed.leaveTypes);
        if (parsed.shiftStart) setShiftStart(parsed.shiftStart);
        if (parsed.shiftEnd) setShiftEnd(parsed.shiftEnd);
      } catch {}
    }
  }, []);

  const saveSettings = (depts, leaves, start, end) => {
    const data = { departments: depts, leaveTypes: leaves, shiftStart: start, shiftEnd: end };
    localStorage.setItem("leadflow_hrms_settings", JSON.stringify(data));
    notify("HRMS parameters stored securely.");
  };

  const addDept = () => {
    if (!newDept.trim()) return;
    const updated = [...departments, newDept.trim()];
    setDepartments(updated);
    setNewDept("");
    saveSettings(updated, leaveTypes, shiftStart, shiftEnd);
  };

  const addLeave = () => {
    if (!newLeave.trim()) return;
    const updated = [...leaveTypes, newLeave.trim()];
    setLeaveTypes(updated);
    setNewLeave("");
    saveSettings(departments, updated, shiftStart, shiftEnd);
  };

  return e.jsxs("div", {
    className: "p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 text-xs font-semibold max-w-4xl",
    children: [
      toastEl,
      e.jsx("div", { className: "border-b border-slate-200 dark:border-slate-800 pb-3", children: e.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white", children: "HR & Shift Parameters" }) }),
      
      // Shift config
      e.jsxs("div", {
        className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3",
        children: [
          e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px]", children: "Default Business Shift Hours" }),
          e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              e.jsxs("div", { children: [e.jsx("span", { className: "block text-slate-500 mb-1", children: "Start Time" }), e.jsx("input", { type: "time", value: shiftStart, onChange: (ev) => { setShiftStart(ev.target.value); saveSettings(departments, leaveTypes, ev.target.value, shiftEnd); }, className: "px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-white" })] }),
              e.jsxs("div", { children: [e.jsx("span", { className: "block text-slate-500 mb-1", children: "End Time" }), e.jsx("input", { type: "time", value: shiftEnd, onChange: (ev) => { setShiftEnd(ev.target.value); saveSettings(departments, leaveTypes, shiftStart, ev.target.value); }, className: "px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-white" })] })
            ]
          })
        ]
      }),

      e.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-6",
        children: [
          e.jsxs("div", {
            className: "space-y-3",
            children: [
              e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px]", children: "Active Departments" }),
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("input", { type: "text", value: newDept, onChange: (ev) => setNewDept(ev.target.value), placeholder: "e.g. Legal Cell", className: "flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" }),
                  e.jsx("button", { type: "button", onClick: addDept, className: "px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold shadow-sm", children: "Add" })
                ]
              }),
              e.jsx("div", {
                className: "flex flex-wrap gap-2 pt-2",
                children: departments.map(d => e.jsx("span", { className: "px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400", children: d }, d))
              })
            ]
          }),

          e.jsxs("div", {
            className: "space-y-3",
            children: [
              e.jsx("h3", { className: "font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px]", children: "Leave Allocation Categories" }),
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("input", { type: "text", value: newLeave, onChange: (ev) => setNewLeave(ev.target.value), placeholder: "e.g. Sabbatical", className: "flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-805 text-slate-805 dark:text-white border border-slate-200 dark:border-slate-700 outline-none" }),
                  e.jsx("button", { type: "button", onClick: addLeave, className: "px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold shadow-sm", children: "Add" })
                ]
              }),
              e.jsx("div", {
                className: "flex flex-wrap gap-2 pt-2",
                children: leaveTypes.map(l => e.jsx("span", { className: "px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400", children: l }, l))
              })
            ]
          })
        ]
      })
    ]
  });
}

/* === TAB 5: COMPREHENSIVE INTEGRATIONS PAGE === */
function DetailedIntegrations() {
  const { notify, element: toastEl } = useToast();
  const [integrations, setIntegrations] = t.useState(() => {
    try {
      const stored = localStorage.getItem("leadflow_integrations");
      return stored ? JSON.parse(stored) : [
        { id: "int-1", name: "IndiaMART Lead Sync", platform: "IndiaMART", enabled: true, webhookUrl: "/api/webhooks/indiamart", secretKey: "IM_x89f2a4901", status: "Connected", lastSync: "2 hours ago" },
        { id: "int-2", name: "JustDial Inquiry Capture", platform: "JustDial", enabled: true, webhookUrl: "/api/webhooks/justdial", secretKey: "JD_m319bc88a1", status: "Connected", lastSync: "1 hour ago" },
        { id: "int-3", name: "Facebook Lead Ads", platform: "Facebook", enabled: false, webhookUrl: "/api/webhooks/facebook", secretKey: "FB_p9981a201b", status: "Disconnected", lastSync: "Never" },
        { id: "int-4", name: "Google Forms Capture", platform: "Google", enabled: false, webhookUrl: "/api/webhooks/google-forms", secretKey: "GF_u41920ac51", status: "Disconnected", lastSync: "Never" },
        { id: "int-5", name: "WordPress Contact Form", platform: "WordPress", enabled: false, webhookUrl: "/api/webhooks/wordpress", secretKey: "WP_w77109bca2", status: "Disconnected", lastSync: "Never" },
        { id: "int-6", name: "WhatsApp Business API", platform: "WhatsApp", enabled: true, webhookUrl: "/api/webhooks/whatsapp", secretKey: "WA_k5518290fa", status: "Connected", lastSync: "30 min ago" }
      ];
    } catch { return []; }
  });

  const [activeConfig, setActiveConfig] = t.useState(null);
  const [showSecretKeys, setShowSecretKeys] = t.useState({});
  const [testingPayloadId, setTestingPayloadId] = t.useState(null);
  const [togglingId, setTogglingId] = t.useState(null);
  const [isRefreshing, setIsRefreshing] = t.useState(false);

  // Modal Form State
  const [configForm, setConfigForm] = t.useState({ name: "", webhookUrl: "", secretKey: "" });
  const [configError, setConfigError] = t.useState("");

  t.useEffect(() => {
    if (activeConfig) {
      setConfigForm({
        name: activeConfig.name || "",
        webhookUrl: activeConfig.webhookUrl || "",
        secretKey: activeConfig.secretKey || ""
      });
      setConfigError("");
    }
  }, [activeConfig]);

  const saveIntegrations = (data) => {
    setIntegrations(data);
    localStorage.setItem("leadflow_integrations", JSON.stringify(data));
  };

  const toggleIntegration = (id) => {
    if (togglingId === id) return;
    setTogglingId(id);
    const targetItem = integrations.find(i => i.id === id);
    const nextEnabled = !targetItem.enabled;

    setTimeout(() => {
      const updated = integrations.map(i =>
        i.id === id ? { ...i, enabled: nextEnabled, status: nextEnabled ? "Connected" : "Disconnected", lastSync: nextEnabled ? "Just now" : "Never" } : i
      );
      saveIntegrations(updated);
      setTogglingId(null);
      notify(`${targetItem.name} ${nextEnabled ? "connected" : "disconnected"} successfully!`);
    }, 300);
  };

  const toggleSecretVisibility = (id) => {
    setShowSecretKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, label) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      notify(`${label} copied to clipboard!`);
    } else {
      notify(`Copied: ${text}`);
    }
  };

  const regenerateKey = (id) => {
    const item = integrations.find(i => i.id === id);
    const prefix = (item.platform || "SK").slice(0, 2).toUpperCase();
    const newKey = prefix + "_" + Math.random().toString(36).slice(2, 12);
    const updated = integrations.map(i => i.id === id ? { ...i, secretKey: newKey } : i);
    saveIntegrations(updated);
    notify(`Secret key for ${item.name} regenerated securely!`);
  };

  const testWebhook = (id) => {
    const item = integrations.find(i => i.id === id);
    setTestingPayloadId(id);
    setTimeout(() => {
      setTestingPayloadId(null);
      notify(`Test payload sent to ${item.name}! Received HTTP 200 OK.`);
    }, 600);
  };

  const refreshAllStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const updated = integrations.map(i => i.enabled ? { ...i, lastSync: "Just now" } : i);
      saveIntegrations(updated);
      setIsRefreshing(false);
      notify("Integration statuses & sync logs refreshed!");
    }, 500);
  };

  const handleSaveConfig = (ev) => {
    ev.preventDefault();
    setConfigError("");
    if (!configForm.name.trim()) { setConfigError("Integration name is required."); return; }
    if (!configForm.webhookUrl.trim() || !new RegExp('^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$', 'i').test(configForm.webhookUrl.trim())) {
      setConfigError("Please enter a valid webhook URL.");
      return;
    }

    let urlFormatted = configForm.webhookUrl.trim();
    if (!new RegExp('^https?://', 'i').test(urlFormatted)) urlFormatted = "https://" + urlFormatted;

    const updated = integrations.map(i =>
      i.id === activeConfig.id ? { ...i, name: configForm.name.trim(), webhookUrl: urlFormatted, secretKey: configForm.secretKey.trim() } : i
    );
    saveIntegrations(updated);
    setActiveConfig(null);
    notify(`Configuration for "${configForm.name.trim()}" saved successfully!`);
  };

  const platformIcons = {
    "IndiaMART": "🇮🇳", "JustDial": "📞", "Facebook": "📘", "Google": "📋", "WordPress": "🌐", "WhatsApp": "💬"
  };

  return e.jsxs("div", {
    className: "space-y-6 w-full min-w-0 pb-8 text-xs font-semibold box-border",
    children: [
      toastEl,

      // Header Section
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", { className: "text-xl font-black text-slate-900 dark:text-white tracking-tight", children: "Integrations & Webhooks" }),
              e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mt-0.5", children: "Configure third-party platform connections, webhook endpoints, and API authorization keys." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-3 shrink-0",
            children: [
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx("span", { className: "px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", children: `${integrations.filter(i => i.enabled).length} Connected` }),
                  e.jsx("span", { className: "px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700", children: `${integrations.length} Total` })
                ]
              }),
              e.jsx("button", {
                type: "button",
                onClick: refreshAllStatus,
                disabled: isRefreshing,
                className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm",
                children: isRefreshing ? "Refreshing..." : "🔄 Refresh All"
              })
            ]
          })
        ]
      }),

      // Integrations Cards Grid
      e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch",
        children: integrations.map(item => e.jsxs("div", {
          className: `p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${item.enabled ? "border-emerald-500/40 dark:border-emerald-500/30" : "border-slate-200 dark:border-slate-800"}`,
          children: [
            e.jsxs("div", {
              className: "space-y-4",
              children: [
                // Title Row & Toggle Switch
                e.jsxs("div", {
                  className: "flex items-start justify-between gap-3",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center space-x-3 min-w-0",
                      children: [
                        e.jsx("span", { className: "text-2xl shrink-0 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60", children: platformIcons[item.platform] || "🔗" }),
                        e.jsxs("div", {
                          className: "min-w-0 space-y-0.5",
                          children: [
                            e.jsx("h4", { className: "font-black text-xs text-slate-900 dark:text-white truncate", children: item.name }),
                            e.jsx("span", { className: "text-[10px] text-slate-400 font-medium block truncate", children: item.platform })
                          ]
                        })
                      ]
                    }),

                    // Switch Toggle Button
                    e.jsx("button", {
                      type: "button",
                      onClick: () => toggleIntegration(item.id),
                      disabled: togglingId === item.id,
                      className: `relative inline-flex items-center w-12 h-6.5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${item.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"} ${togglingId === item.id ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} shrink-0 shadow-inner z-10`,
                      title: item.enabled ? `Click to Disconnect ${item.name}` : `Click to Connect ${item.name}`,
                      "aria-label": item.enabled ? `Disconnect ${item.name}` : `Connect ${item.name}`,
                      children: e.jsx("span", {
                        className: `pointer-events-none inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${item.enabled ? "translate-x-6" : "translate-x-1"}`
                      })
                    })
                  ]
                }),

                // Status Badge & Last Sync
                e.jsxs("div", {
                  className: "flex items-center justify-between text-[11px] pt-1",
                  children: [
                    e.jsx("span", { className: `px-2.5 py-0.5 rounded-full font-extrabold text-[10px] tracking-wide ${item.enabled ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"}`, children: item.status }),
                    e.jsxs("span", { className: "text-slate-400 font-medium text-[10px]", children: ["Last sync: ", item.lastSync] })
                  ]
                }),

                // Webhook Endpoint Box
                e.jsxs("div", {
                  className: "space-y-1.5 pt-1",
                  children: [
                    e.jsxs("div", { className: "flex items-center justify-between", children: [
                      e.jsx("label", { className: "text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: "Webhook Endpoint" }),
                      e.jsx("button", { type: "button", onClick: () => copyToClipboard(item.webhookUrl, "Webhook Endpoint"), className: "text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer", children: "📋 Copy" })
                    ]}),
                    e.jsx("div", { className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate select-all", title: item.webhookUrl, children: item.webhookUrl })
                  ]
                }),

                // Secret Key Box
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsxs("div", { className: "flex items-center justify-between", children: [
                      e.jsx("label", { className: "text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: "Secret Key" }),
                      e.jsxs("div", { className: "flex items-center space-x-2.5", children: [
                        e.jsx("button", { type: "button", onClick: () => toggleSecretVisibility(item.id), className: "text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition", children: showSecretKeys[item.id] ? "🙈 Hide" : "👁️ Show" }),
                        e.jsx("button", { type: "button", onClick: () => copyToClipboard(item.secretKey, "Secret Key"), className: "text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer", children: "📋 Copy" })
                      ]})
                    ]}),
                    e.jsxs("div", {
                      className: "flex items-center space-x-2",
                      children: [
                        e.jsx("div", { className: "flex-1 w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate select-all min-w-0", children: showSecretKeys[item.id] ? item.secretKey : "••••••••••••••••" }),
                        e.jsx("button", { type: "button", onClick: () => regenerateKey(item.id), className: "p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition cursor-pointer shrink-0", title: "Regenerate Key", children: "🔄" })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Action Buttons Footer Bar
            e.jsxs("div", {
              className: "pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 mt-4",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => testWebhook(item.id),
                  disabled: testingPayloadId === item.id,
                  className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-[11px] transition cursor-pointer flex items-center space-x-1.5 shadow-sm active:scale-95",
                  children: testingPayloadId === item.id ? "Sending..." : "🧪 Test Payload"
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => setActiveConfig(item),
                  className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm shadow-indigo-600/20 transition active:scale-95 cursor-pointer",
                  children: "⚙️ Configure"
                })
              ]
            })
          ]
        }, item.id))
      }),

      // Configure Modal Dialog
      activeConfig && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("form", {
          onSubmit: handleSaveConfig,
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3",
              children: [
                e.jsxs("div", { children: [
                  e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: `Configure ${activeConfig.name}` }),
                  e.jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5", children: `Update webhook routing and authorization credentials for ${activeConfig.platform}.` })
                ]}),
                e.jsx("button", { type: "button", onClick: () => setActiveConfig(null), className: "text-slate-400 font-black hover:text-slate-200 text-lg cursor-pointer px-2", children: "×" })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-4",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Integration Name *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: configForm.name,
                      onChange: (ev) => setConfigForm({ ...configForm, name: ev.target.value }),
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Webhook URL Endpoint *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: configForm.webhookUrl,
                      onChange: (ev) => setConfigForm({ ...configForm, webhookUrl: ev.target.value }),
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Secret Key / Authorization Token" }),
                    e.jsx("input", {
                      type: "text",
                      value: configForm.secretKey,
                      onChange: (ev) => setConfigForm({ ...configForm, secretKey: ev.target.value }),
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-mono transition"
                    })
                  ]
                })
              ]
            }),

            configError && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold", children: configError }),

            e.jsxs("div", {
              className: "flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                e.jsx("button", { type: "button", onClick: () => setActiveConfig(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition", children: "Cancel" }),
                e.jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/20 transition active:scale-95", children: "Save Configuration" })
              ]
            })
          ]
        })
      })
    ]
  });
}

/* === TAB 6: LEAD TRASH / RECYCLE BIN === */
function LeadTrash() {
  const { notify, element: toastEl } = useToast();
  const [leads, setLeads] = t.useState([]);
  const [search, setSearch] = t.useState("");
  const [selectedLeadForDetail, setSelectedLeadForDetail] = t.useState(null);
  const [leadToDeleteId, setLeadToDeleteId] = t.useState(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = t.useState(false);
  const [isRefreshing, setIsRefreshing] = t.useState(false);

  const initialSampleDeletedLeads = [
    { _id: "trash-1", name: "Vikram Sethi", company: "TechCorp India", email: "vikram@techcorp.in", phone: "+91 98112 33445", source: "IndiaMART", status: "Contacted", deletedAt: "2026-08-25T14:30:00Z", deletedBy: "Admin User", isDeleted: true },
    { _id: "trash-2", name: "Ananya Sharma", company: "Apex Global Solutions", email: "ananya@apexglobal.io", phone: "+91 97110 55667", source: "Website", status: "New", deletedAt: "2026-08-26T09:15:00Z", deletedBy: "Rahul Sharma", isDeleted: true },
    { _id: "trash-3", name: "Rohan Gupta", company: "InnovateX Enterprises", email: "rohan@innovatex.com", phone: "+91 99220 88990", source: "LinkedIn", status: "Proposal", deletedAt: "2026-08-26T16:45:00Z", deletedBy: "Preeti Patel", isDeleted: true }
  ];

  const loadLeads = () => {
    const raw = localStorage.getItem("leadflow_leads");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const trashItems = parsed.filter(l => l.isDeleted);
          if (trashItems.length === 0 && !localStorage.getItem("leadflow_trash_initialized")) {
            // Seed initial sample trash items once
            const combined = [...parsed, ...initialSampleDeletedLeads];
            localStorage.setItem("leadflow_leads", JSON.stringify(combined));
            localStorage.setItem("leadflow_trash_initialized", "true");
            setLeads(initialSampleDeletedLeads);
            return;
          }
          setLeads(trashItems);
          return;
        }
      } catch (err) {}
    }

    // Seed default sample leads if none exist
    localStorage.setItem("leadflow_leads", JSON.stringify(initialSampleDeletedLeads));
    localStorage.setItem("leadflow_trash_initialized", "true");
    setLeads(initialSampleDeletedLeads);
  };

  t.useEffect(() => {
    loadLeads();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadLeads();
      setIsRefreshing(false);
      notify("Recycle bin refreshed successfully!");
    }, 400);
  };

  const restoreLead = (id) => {
    const target = leads.find(l => l._id === id);
    const raw = localStorage.getItem("leadflow_leads");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const updated = parsed.map(l => l._id === id ? { ...l, isDeleted: false, deletedAt: null } : l);
        localStorage.setItem("leadflow_leads", JSON.stringify(updated));
        loadLeads();
        notify(`Lead "${target ? target.name : id}" restored successfully to active leads matrix!`);
      } catch (err) {}
    }
  };

  const confirmDeletePermanently = (id) => {
    const target = leads.find(l => l._id === id);
    const raw = localStorage.getItem("leadflow_leads");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const updated = parsed.filter(l => l._id !== id);
        localStorage.setItem("leadflow_leads", JSON.stringify(updated));
        loadLeads();
        setLeadToDeleteId(null);
        notify(`Lead "${target ? target.name : id}" deleted permanently.`);
      } catch (err) {}
    }
  };

  const confirmEmptyTrash = () => {
    const raw = localStorage.getItem("leadflow_leads");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const updated = parsed.filter(l => !l.isDeleted);
        localStorage.setItem("leadflow_leads", JSON.stringify(updated));
        loadLeads();
        setShowEmptyConfirm(false);
        notify("Recycle Bin emptied successfully! All deleted records purged.");
      } catch (err) {}
    }
  };

  const restoreAllLeads = () => {
    const raw = localStorage.getItem("leadflow_leads");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const updated = parsed.map(l => l.isDeleted ? { ...l, isDeleted: false, deletedAt: null } : l);
        localStorage.setItem("leadflow_leads", JSON.stringify(updated));
        loadLeads();
        notify("All deleted leads restored successfully to active pipelines!");
      } catch (err) {}
    }
  };

  const filtered = leads.filter(l =>
    !search ||
    (l.name && l.name.toLowerCase().includes(search.toLowerCase())) ||
    (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
    (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
    (l.phone && l.phone.toLowerCase().includes(search.toLowerCase()))
  );

  return e.jsxs("div", {
    className: "space-y-6 w-full min-w-0 pb-8 text-xs font-semibold box-border",
    children: [
      toastEl,

      // Header Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", { className: "text-xl font-black text-slate-900 dark:text-white tracking-tight", children: "Lead Trash / Recycle Bin" }),
              e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mt-0.5", children: "Restore recently deleted leads back into active sales pipelines or purge them permanently." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-2 shrink-0",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: handleRefresh,
                disabled: isRefreshing,
                className: "px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer text-xs shadow-sm",
                children: isRefreshing ? "Refreshing..." : "🔄 Refresh"
              }),
              leads.length > 0 && e.jsxs(t.Fragment, {
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: restoreAllLeads,
                    className: "px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30 hover:bg-emerald-500/25 transition cursor-pointer text-xs shadow-sm",
                    children: "✨ Restore All"
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setShowEmptyConfirm(true),
                    className: "px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-extrabold border border-rose-500/30 hover:bg-rose-500/25 transition cursor-pointer text-xs shadow-sm",
                    children: "🗑️ Empty Recycle Bin"
                  })
                ]
              })
            ]
          })
        ]
      }),

      // Search Toolbar
      e.jsx("div", {
        className: "relative w-full",
        children: e.jsx("input", {
          type: "text",
          value: search,
          onChange: (ev) => setSearch(ev.target.value),
          placeholder: "🔍 Search deleted leads by name, company, email or phone...",
          className: "w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition shadow-sm"
        })
      }),

      // Deleted Leads List
      leads.length === 0 ? e.jsxs("div", {
        className: "p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3",
        children: [
          e.jsx("div", { className: "text-4xl", children: "♻️" }),
          e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Recycle Bin is Empty" }),
          e.jsx("p", { className: "text-slate-400 font-medium text-xs max-w-sm mx-auto", children: "There are currently no deleted leads in trash storage. Deleted leads will appear here for 30 days before permanent cleanup." })
        ]
      }) : e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
        children: filtered.map(lead => e.jsxs("div", {
          className: "p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between transition hover:border-slate-300 dark:hover:border-slate-700",
          children: [
            e.jsxs("div", {
              className: "space-y-2",
              children: [
                e.jsxs("div", {
                  className: "flex items-start justify-between gap-3",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("h4", { className: "font-black text-sm text-slate-900 dark:text-white", children: lead.name }),
                        e.jsx("p", { className: "text-[11px] text-slate-400 font-medium", children: lead.company || "Independent Contact" })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "flex items-center space-x-1.5",
                      children: [
                        lead.status && e.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30", children: lead.status }),
                        lead.source && e.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700", children: lead.source })
                      ]
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 font-medium",
                  children: [
                    lead.email && e.jsxs("div", { children: ["📧 ", lead.email] }),
                    lead.phone && e.jsxs("div", { children: ["📞 ", lead.phone] }),
                    lead.deletedAt && e.jsxs("div", { className: "text-[10px] text-slate-400 pt-1", children: [`Deleted by ${lead.deletedBy || "Admin"} • `, new Date(lead.deletedAt).toLocaleDateString()] })
                  ]
                })
              ]
            }),

            // Action Buttons
            e.jsxs("div", {
              className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => setSelectedLeadForDetail(lead),
                  className: "px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer",
                  children: "👁️ Details"
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => restoreLead(lead._id),
                  className: "px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer",
                  children: "✨ Restore"
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => setLeadToDeleteId(lead._id),
                  className: "px-3.5 py-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/30 transition cursor-pointer",
                  children: "🗑️ Purge"
                })
              ]
            })
          ]
        }, lead._id))
      }),

      // Lead Details Modal
      selectedLeadForDetail && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3",
              children: [
                e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Deleted Lead Metadata" }),
                e.jsx("button", { type: "button", onClick: () => setSelectedLeadForDetail(null), className: "text-slate-400 font-black hover:text-slate-200 text-lg cursor-pointer px-2", children: "×" })
              ]
            }),
            e.jsxs("div", {
              className: "space-y-2 text-slate-700 dark:text-slate-300",
              children: [
                e.jsxs("div", { children: [e.jsx("span", { className: "text-slate-400 font-bold", children: "Full Name: " }), selectedLeadForDetail.name] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-slate-400 font-bold", children: "Company: " }), selectedLeadForDetail.company || "N/A"] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-slate-400 font-bold", children: "Email: " }), selectedLeadForDetail.email || "N/A"] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-slate-400 font-bold", children: "Phone: " }), selectedLeadForDetail.phone || "N/A"] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-slate-400 font-bold", children: "Lead Source: " }), selectedLeadForDetail.source || "N/A"] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-slate-400 font-bold", children: "Pipeline Status: " }), selectedLeadForDetail.status || "N/A"] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-slate-400 font-bold", children: "Deleted By: " }), selectedLeadForDetail.deletedBy || "System Admin"] })
              ]
            }),
            e.jsxs("div", {
              className: "flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                e.jsx("button", { type: "button", onClick: () => setSelectedLeadForDetail(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Close" }),
                e.jsx("button", { type: "button", onClick: () => { restoreLead(selectedLeadForDetail._id); setSelectedLeadForDetail(null); }, className: "px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer shadow-sm", children: "Restore Lead" })
              ]
            })
          ]
        })
      }),

      // Single Lead Delete Confirmation Modal
      leadToDeleteId && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-xs font-semibold text-center",
          children: [
            e.jsx("div", { className: "text-3xl", children: "⚠️" }),
            e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Confirm Permanent Purge" }),
            e.jsx("p", { className: "text-slate-400 font-medium", children: "Are you sure you want to permanently delete this record? This action cannot be undone." }),
            e.jsxs("div", {
              className: "flex items-center justify-center space-x-3 pt-2",
              children: [
                e.jsx("button", { type: "button", onClick: () => setLeadToDeleteId(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "button", onClick: () => confirmDeletePermanently(leadToDeleteId), className: "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold cursor-pointer shadow-sm", children: "Purge Permanently" })
              ]
            })
          ]
        })
      }),

      // Empty Recycle Bin Confirmation Modal
      showEmptyConfirm && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-xs font-semibold text-center",
          children: [
            e.jsx("div", { className: "text-3xl", children: "🔥" }),
            e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Empty Entire Recycle Bin?" }),
            e.jsx("p", { className: "text-slate-400 font-medium", children: `Are you sure you want to permanently purge all ${leads.length} deleted records? Active CRM leads will not be affected.` }),
            e.jsxs("div", {
              className: "flex items-center justify-center space-x-3 pt-2",
              children: [
                e.jsx("button", { type: "button", onClick: () => setShowEmptyConfirm(false), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "button", onClick: confirmEmptyTrash, className: "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold cursor-pointer shadow-sm", children: "Confirm Empty Trash" })
              ]
            })
          ]
        })
      })
    ]
  });
}

/* === TAB 7: ATTRIBUTES MANAGEMENT === */
function AttributesSettings() {
  const { notify, element: toastEl } = useToast();
  const [attributes, setAttributes] = t.useState([]);
  const [search, setSearch] = t.useState("");
  const [selectedEntityFilter, setSelectedEntityFilter] = t.useState("all");

  const [isOpen, setIsOpen] = t.useState(false);
  const [editingAttr, setEditingAttr] = t.useState(null);
  const [attrToDeleteId, setAttrToDeleteId] = t.useState(null);

  // Form State
  const [label, setLabel] = t.useState("");
  const [name, setName] = t.useState("");
  const [entity, setEntity] = t.useState("leads");
  const [type, setType] = t.useState("text");
  const [required, setRequired] = t.useState(false);
  const [active, setActive] = t.useState(true);
  const [options, setOptions] = t.useState("");
  const [formError, setFormError] = t.useState("");

  const sampleAttributes = [
    { id: "attr-1", label: "Annual Revenue Budget", name: "lead_budget", entity: "leads", type: "number", required: true, active: true, options: [] },
    { id: "attr-2", label: "Industry Sector", name: "industry_sector", entity: "leads", type: "select", required: false, active: true, options: ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing"] },
    { id: "attr-3", label: "GST / Tax Identification", name: "tax_id_number", entity: "customers", type: "text", required: true, active: true, options: [] }
  ];

  const loadAttrs = () => {
    const s = localStorage.getItem("leadflow_attributes");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAttributes(parsed);
          return;
        }
      } catch (err) {}
    }
    localStorage.setItem("leadflow_attributes", JSON.stringify(sampleAttributes));
    setAttributes(sampleAttributes);
  };

  t.useEffect(() => {
    loadAttrs();
  }, []);

  const saveAttrsToStorage = (updatedList, msg) => {
    setAttributes(updatedList);
    localStorage.setItem("leadflow_attributes", JSON.stringify(updatedList));
    if (msg) notify(msg);
  };

  const handleOpenAddModal = () => {
    setEditingAttr(null);
    setLabel("");
    setName("");
    setEntity("leads");
    setType("text");
    setRequired(false);
    setActive(true);
    setOptions("");
    setFormError("");
    setIsOpen(true);
  };

  const handleOpenEditModal = (attr) => {
    setEditingAttr(attr);
    setLabel(attr.label || attr.name);
    setName(attr.name);
    setEntity(attr.entity || "leads");
    setType(attr.type || "text");
    setRequired(Boolean(attr.required));
    setActive(attr.active !== false);
    setOptions(Array.isArray(attr.options) ? attr.options.join(", ") : "");
    setFormError("");
    setIsOpen(true);
  };

  const handleSaveAttribute = (ev) => {
    ev.preventDefault();
    setFormError("");

    if (!label.trim()) { setFormError("Display label is required."); return; }
    
    let slugifiedName = name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (!slugifiedName) {
      slugifiedName = label.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    }

    if (!slugifiedName) { setFormError("Internal field name is required."); return; }

    // Check duplicate name
    const isDuplicate = attributes.some(a => a.name.toLowerCase() === slugifiedName && (!editingAttr || a.id !== editingAttr.id));
    if (isDuplicate) {
      setFormError(`Internal field name "${slugifiedName}" already exists. Please choose a unique name.`);
      return;
    }

    const optionsList = type === "select" ? options.split(",").map(o => o.trim()).filter(Boolean) : [];

    let updatedList;
    if (editingAttr) {
      updatedList = attributes.map(a => a.id === editingAttr.id ? {
        ...a,
        label: label.trim(),
        name: slugifiedName,
        entity,
        type,
        required,
        active,
        options: optionsList
      } : a);
    } else {
      const newAttr = {
        id: "attr-" + Date.now(),
        label: label.trim(),
        name: slugifiedName,
        entity,
        type,
        required,
        active,
        options: optionsList
      };
      updatedList = [...attributes, newAttr];
    }

    saveAttrsToStorage(updatedList, editingAttr ? `Custom field "${label.trim()}" updated successfully!` : `Custom field "${label.trim()}" created successfully!`);
    setIsOpen(false);
  };

  const toggleAttributeStatus = (id) => {
    const updated = attributes.map(a => a.id === id ? { ...a, active: !a.active } : a);
    const target = attributes.find(a => a.id === id);
    saveAttrsToStorage(updated, `Custom field "${target ? target.label : id}" ${!target.active ? "activated" : "deactivated"}.`);
  };

  const confirmDeleteAttribute = (id) => {
    const target = attributes.find(a => a.id === id);
    const updated = attributes.filter(a => a.id !== id);
    saveAttrsToStorage(updated, `Custom field "${target ? target.label : id}" deleted.`);
    setAttrToDeleteId(null);
  };

  const filteredAttributes = attributes.filter(a => {
    const matchesSearch = !search ||
      (a.label && a.label.toLowerCase().includes(search.toLowerCase())) ||
      (a.name && a.name.toLowerCase().includes(search.toLowerCase())) ||
      (a.type && a.type.toLowerCase().includes(search.toLowerCase()));

    const matchesEntity = selectedEntityFilter === "all" || a.entity === selectedEntityFilter;
    return matchesSearch && matchesEntity;
  });

  return e.jsxs("div", {
    className: "space-y-6 w-full min-w-0 pb-8 text-xs font-semibold box-border",
    children: [
      toastEl,

      // Header Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", { className: "text-xl font-black text-slate-900 dark:text-white tracking-tight", children: "Custom Fields & Schema Attributes" }),
              e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mt-0.5", children: "Define specialized custom properties and schema fields for CRM Leads, Customers, and Deals forms." })
            ]
          }),
          e.jsx("button", {
            type: "button",
            onClick: handleOpenAddModal,
            className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95 cursor-pointer shrink-0",
            children: "+ Add Custom Field"
          })
        ]
      }),

      // Search & Entity Filter Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        children: [
          e.jsx("input", {
            type: "text",
            value: search,
            onChange: (ev) => setSearch(ev.target.value),
            placeholder: "🔍 Search custom fields by label or name...",
            className: "flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition shadow-sm"
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0",
            children: [
              ["all", "leads", "customers", "deals"].map(ent => e.jsx("button", {
                key: ent,
                type: "button",
                onClick: () => setSelectedEntityFilter(ent),
                className: `px-3 py-1.5 rounded-lg text-[11px] font-extrabold capitalize cursor-pointer transition ${selectedEntityFilter === ent ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`,
                children: ent === "all" ? "All Entities" : ent
              }))
            ]
          })
        ]
      }),

      // Attributes Cards Grid
      filteredAttributes.length === 0 ? e.jsxs("div", {
        className: "p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3",
        children: [
          e.jsx("div", { className: "text-4xl", children: "🏷️" }),
          e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "No Custom Fields Found" }),
          e.jsx("p", { className: "text-slate-400 font-medium text-xs max-w-sm mx-auto", children: "No custom schema attributes match your filter. Click '+ Add Custom Field' to create new fields." }),
          e.jsx("button", { type: "button", onClick: handleOpenAddModal, className: "px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-sm", children: "+ Add Custom Field" })
        ]
      }) : e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
        children: filteredAttributes.map(attr => e.jsxs("div", {
          className: `p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-4 flex flex-col justify-between transition hover:shadow-md ${attr.active ? "border-slate-200 dark:border-slate-800/80" : "border-slate-300 dark:border-slate-800 opacity-60"}`,
          children: [
            e.jsxs("div", {
              className: "space-y-3",
              children: [
                e.jsxs("div", {
                  className: "flex items-start justify-between gap-3",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("h4", { className: "font-black text-sm text-slate-900 dark:text-white", children: attr.label }),
                        e.jsxs("code", { className: "text-[10px] text-slate-400 font-mono block mt-0.5", children: ["{", attr.name, "}"] })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "flex items-center space-x-1.5",
                      children: [
                        e.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30", children: attr.entity }),
                        e.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700", children: attr.type })
                      ]
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-medium",
                  children: [
                    e.jsxs("div", { className: "flex items-center justify-between", children: [
                      e.jsx("span", { children: "Required Field:" }),
                      e.jsx("span", { className: `font-bold ${attr.required ? "text-rose-500" : "text-slate-400"}`, children: attr.required ? "Yes (Mandatory)" : "No (Optional)" })
                    ]}),
                    attr.type === "select" && Array.isArray(attr.options) && attr.options.length > 0 && e.jsxs("div", {
                      className: "pt-1",
                      children: [
                        e.jsx("span", { className: "block text-[10px] font-bold text-slate-400 mb-1", children: "Dropdown Choices:" }),
                        e.jsx("div", { className: "flex flex-wrap gap-1", children: attr.options.map(opt => e.jsx("span", { className: "px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700", children: opt }, opt)) })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Footer Actions
            e.jsxs("div", {
              className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => toggleAttributeStatus(attr.id),
                  className: `px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer transition ${attr.active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"}`,
                  children: attr.active ? "Active" : "Inactive"
                }),
                e.jsxs("div", {
                  className: "flex items-center space-x-1.5",
                  children: [
                    e.jsx("button", { type: "button", onClick: () => handleOpenEditModal(attr), className: "px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[11px] cursor-pointer transition", children: "✏️ Edit" }),
                    e.jsx("button", { type: "button", onClick: () => setAttrToDeleteId(attr.id), className: "px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/30 cursor-pointer transition", children: "🗑️" })
                  ]
                })
              ]
            })
          ]
        }, attr.id))
      }),

      // Add / Edit Custom Field Modal
      isOpen && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("form", {
          onSubmit: handleSaveAttribute,
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3",
              children: [
                e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: editingAttr ? "Edit Custom Field Schema" : "Add Custom Field Schema" }),
                e.jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "text-slate-400 font-black hover:text-slate-200 text-lg cursor-pointer px-2", children: "×" })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-4",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Display Label *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: label,
                      onChange: (ev) => {
                        setLabel(ev.target.value);
                        if (!editingAttr && !name) {
                          setName(ev.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
                        }
                      },
                      placeholder: "e.g. Tax Identification Number",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Internal Field Name *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: name,
                      onChange: (ev) => setName(ev.target.value.toLowerCase().replace(/\s+/g, "_")),
                      placeholder: "e.g. tax_id_number",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-mono transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Target Entity *" }),
                        e.jsxs("select", {
                          value: entity,
                          onChange: (ev) => setEntity(ev.target.value),
                          className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold",
                          children: [
                            e.jsx("option", { value: "leads", children: "Leads" }),
                            e.jsx("option", { value: "customers", children: "Customers" }),
                            e.jsx("option", { value: "deals", children: "Deals" })
                          ]
                        })
                      ]
                    }),

                    e.jsxs("div", {
                      children: [
                        e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Field Type *" }),
                        e.jsxs("select", {
                          value: type,
                          onChange: (ev) => setType(ev.target.value),
                          className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold",
                          children: [
                            e.jsx("option", { value: "text", children: "Text" }),
                            e.jsx("option", { value: "number", children: "Number" }),
                            e.jsx("option", { value: "select", children: "Dropdown / Select" }),
                            e.jsx("option", { value: "date", children: "Date" }),
                            e.jsx("option", { value: "checkbox", children: "Checkbox" })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                type === "select" && e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Dropdown Options (comma separated)" }),
                    e.jsx("input", {
                      type: "text",
                      value: options,
                      onChange: (ev) => setOptions(ev.target.value),
                      placeholder: "Option 1, Option 2, Option 3",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800",
                  children: [
                    e.jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [
                      e.jsx("input", { type: "checkbox", checked: required, onChange: (ev) => setRequired(ev.target.checked), className: "rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" }),
                      e.jsx("span", { className: "text-slate-700 dark:text-slate-300 font-bold", children: "Is Required (Mandatory Field)" })
                    ]}),

                    e.jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [
                      e.jsx("input", { type: "checkbox", checked: active, onChange: (ev) => setActive(ev.target.checked), className: "rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" }),
                      e.jsx("span", { className: "text-slate-700 dark:text-slate-300 font-bold", children: "Field Active Status" })
                    ]})
                  ]
                })
              ]
            }),

            formError && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold", children: formError }),

            e.jsxs("div", {
              className: "flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                e.jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/20 transition active:scale-95", children: editingAttr ? "Update Field" : "Create Field" })
              ]
            })
          ]
        })
      }),

      // Delete Confirmation Modal
      attrToDeleteId && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-xs font-semibold text-center",
          children: [
            e.jsx("div", { className: "text-3xl", children: "⚠️" }),
            e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Delete Custom Field" }),
            e.jsx("p", { className: "text-slate-400 font-medium", children: "Are you sure you want to delete this custom schema attribute? Field values stored in existing records will be unmapped." }),
            e.jsxs("div", {
              className: "flex items-center justify-center space-x-3 pt-2",
              children: [
                e.jsx("button", { type: "button", onClick: () => setAttrToDeleteId(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "button", onClick: () => confirmDeleteAttribute(attrToDeleteId), className: "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold cursor-pointer shadow-sm", children: "Delete Field" })
              ]
            })
          ]
        })
      })
    ]
  });
}

/* === TAB 8: TEMPLATE BUILDER === */
function TemplatesSettings() {
  const { notify, element: toastEl } = useToast();
  const [templates, setTemplates] = t.useState([]);
  const [search, setSearch] = t.useState("");
  const [selectedChannelFilter, setSelectedChannelFilter] = t.useState("all");

  const [isOpen, setIsOpen] = t.useState(false);
  const [editingTmpl, setEditingTmpl] = t.useState(null);
  const [tmplToDeleteId, setTmplToDeleteId] = t.useState(null);
  const [previewTmpl, setPreviewTmpl] = t.useState(null);

  // Form State
  const [name, setName] = t.useState("");
  const [type, setType] = t.useState("email");
  const [subject, setSubject] = t.useState("");
  const [body, setBody] = t.useState("");
  const [active, setActive] = t.useState(true);
  const [formError, setFormError] = t.useState("");

  const sampleTemplates = [
    { id: "tmpl-1", name: "Welcome Greetings Email", type: "email", subject: "Welcome to Empire CRM, {name}!", body: "Hi {name},\n\nWe are excited to assist you at {company}. Our sales representative will contact you shortly.\n\nBest regards,\nEmpire CRM Team", active: true },
    { id: "tmpl-2", name: "WhatsApp Followup Trigger", type: "whatsapp", subject: "", body: "Hello {name}, just following up on our proposal for {company}. Do you have any questions for our team?", active: true },
    { id: "tmpl-3", name: "SMS Lead Confirmation", type: "sms", subject: "", body: "Hi {name}, your inquiry at {company} has been received. Ticket ref: #CRM-89102", active: true }
  ];

  const loadTemplates = () => {
    const s = localStorage.getItem("leadflow_templates");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplates(parsed);
          return;
        }
      } catch (err) {}
    }
    localStorage.setItem("leadflow_templates", JSON.stringify(sampleTemplates));
    setTemplates(sampleTemplates);
  };

  t.useEffect(() => {
    loadTemplates();
  }, []);

  const saveTemplatesToStorage = (updatedList, msg) => {
    setTemplates(updatedList);
    localStorage.setItem("leadflow_templates", JSON.stringify(updatedList));
    if (msg) notify(msg);
  };

  const handleOpenAddModal = () => {
    setEditingTmpl(null);
    setName("");
    setType("email");
    setSubject("");
    setBody("");
    setActive(true);
    setFormError("");
    setIsOpen(true);
  };

  const handleOpenEditModal = (tmpl) => {
    setEditingTmpl(tmpl);
    setName(tmpl.name);
    setType(tmpl.type || "email");
    setSubject(tmpl.subject || "");
    setBody(tmpl.body || "");
    setActive(tmpl.active !== false);
    setFormError("");
    setIsOpen(true);
  };

  const insertPlaceholder = (placeholder) => {
    setBody(prev => prev + " " + placeholder);
  };

  const handleSaveTemplate = (ev) => {
    ev.preventDefault();
    setFormError("");

    if (!name.trim()) { setFormError("Template name is required."); return; }
    if (!body.trim()) { setFormError("Message content body is required."); return; }

    const isDuplicate = templates.some(t => t.name.toLowerCase() === name.trim().toLowerCase() && (!editingTmpl || t.id !== editingTmpl.id));
    if (isDuplicate) {
      setFormError(`Template name "${name.trim()}" already exists. Please choose a unique name.`);
      return;
    }

    let updatedList;
    if (editingTmpl) {
      updatedList = templates.map(t => t.id === editingTmpl.id ? {
        ...t,
        name: name.trim(),
        type,
        subject: type === "email" ? subject.trim() : "",
        body: body.trim(),
        active
      } : t);
    } else {
      const newTmpl = {
        id: "tmpl-" + Date.now(),
        name: name.trim(),
        type,
        subject: type === "email" ? subject.trim() : "",
        body: body.trim(),
        active
      };
      updatedList = [...templates, newTmpl];
    }

    saveTemplatesToStorage(updatedList, editingTmpl ? `Template "${name.trim()}" updated successfully!` : `Template "${name.trim()}" created successfully!`);
    setIsOpen(false);
  };

  const toggleTemplateStatus = (id) => {
    const updated = templates.map(t => t.id === id ? { ...t, active: !t.active } : t);
    const target = templates.find(t => t.id === id);
    saveTemplatesToStorage(updated, `Template "${target ? target.name : id}" ${!target.active ? "activated" : "deactivated"}.`);
  };

  const confirmDeleteTemplate = (id) => {
    const target = templates.find(t => t.id === id);
    const updated = templates.filter(t => t.id !== id);
    saveTemplatesToStorage(updated, `Template "${target ? target.name : id}" deleted.`);
    setTmplToDeleteId(null);
  };

  const renderInterpolatedBody = (text) => {
    if (!text) return "";
    return text
      .replace(/{name}/g, "Preeti Patel")
      .replace(/{company}/g, "Empire IT Xpert")
      .replace(/{phone}/g, "+91 98765 43210")
      .replace(/{email}/g, "info@empireitxpert.in");
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !search ||
      (t.name && t.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.subject && t.subject.toLowerCase().includes(search.toLowerCase())) ||
      (t.body && t.body.toLowerCase().includes(search.toLowerCase()));

    const matchesChannel = selectedChannelFilter === "all" || t.type === selectedChannelFilter;
    return matchesSearch && matchesChannel;
  });

  const channelIcons = { email: "📧", whatsapp: "💬", sms: "📱" };

  return e.jsxs("div", {
    className: "space-y-6 w-full min-w-0 pb-8 text-xs font-semibold box-border",
    children: [
      toastEl,

      // Header Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", { className: "text-xl font-black text-slate-900 dark:text-white tracking-tight", children: "Message & Notification Templates" }),
              e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mt-0.5", children: "Construct pre-configured templates for automated Email, SMS, or WhatsApp campaigns." })
            ]
          }),
          e.jsx("button", {
            type: "button",
            onClick: handleOpenAddModal,
            className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95 cursor-pointer shrink-0",
            children: "+ Create Template"
          })
        ]
      }),

      // Search & Channel Filter Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        children: [
          e.jsx("input", {
            type: "text",
            value: search,
            onChange: (ev) => setSearch(ev.target.value),
            placeholder: "🔍 Search templates by name, subject or body content...",
            className: "flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition shadow-sm"
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0",
            children: [
              ["all", "email", "whatsapp", "sms"].map(ch => e.jsx("button", {
                key: ch,
                type: "button",
                onClick: () => setSelectedChannelFilter(ch),
                className: `px-3 py-1.5 rounded-lg text-[11px] font-extrabold capitalize cursor-pointer transition ${selectedChannelFilter === ch ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`,
                children: ch === "all" ? "All Channels" : `${channelIcons[ch] || ""} ${ch}`
              }))
            ]
          })
        ]
      }),

      // Templates Cards Grid
      filteredTemplates.length === 0 ? e.jsxs("div", {
        className: "p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3",
        children: [
          e.jsx("div", { className: "text-4xl", children: "📝" }),
          e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "No Messaging Templates Found" }),
          e.jsx("p", { className: "text-slate-400 font-medium text-xs max-w-sm mx-auto", children: "No templates match your search filter. Click '+ Create Template' to design new email, WhatsApp, or SMS layouts." }),
          e.jsx("button", { type: "button", onClick: handleOpenAddModal, className: "px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-sm", children: "+ Create Template" })
        ]
      }) : e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
        children: filteredTemplates.map(tmpl => e.jsxs("div", {
          className: `p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-4 flex flex-col justify-between transition hover:shadow-md ${tmpl.active ? "border-slate-200 dark:border-slate-800/80" : "border-slate-300 dark:border-slate-800 opacity-60"}`,
          children: [
            e.jsxs("div", {
              className: "space-y-3",
              children: [
                e.jsxs("div", {
                  className: "flex items-start justify-between gap-3",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("h4", { className: "font-black text-sm text-slate-900 dark:text-white", children: tmpl.name }),
                        tmpl.subject && e.jsx("span", { className: "text-[10px] text-indigo-500 font-bold block truncate max-w-xs", children: `Subj: ${tmpl.subject}` })
                      ]
                    }),
                    e.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0", children: `${channelIcons[tmpl.type] || "📝"} ${tmpl.type}` })
                  ]
                }),

                e.jsx("div", { className: "p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px] text-slate-700 dark:text-slate-300 min-h-20 whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-thin select-all", children: tmpl.body }),
                e.jsx("p", { className: "text-[10px] text-slate-400 font-medium text-right", children: `${tmpl.body.length} characters` })
              ]
            }),

            // Footer Actions
            e.jsxs("div", {
              className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => toggleTemplateStatus(tmpl.id),
                  className: `px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer transition ${tmpl.active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"}`,
                  children: tmpl.active ? "Active" : "Inactive"
                }),
                e.jsxs("div", {
                  className: "flex items-center space-x-1.5",
                  children: [
                    e.jsx("button", { type: "button", onClick: () => setPreviewTmpl(tmpl), className: "px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[11px] cursor-pointer transition", children: "👁️ Preview" }),
                    e.jsx("button", { type: "button", onClick: () => handleOpenEditModal(tmpl), className: "px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[11px] cursor-pointer transition", children: "✏️ Edit" }),
                    e.jsx("button", { type: "button", onClick: () => setTmplToDeleteId(tmpl.id), className: "px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/30 cursor-pointer transition", children: "🗑️" })
                  ]
                })
              ]
            })
          ]
        }, tmpl.id))
      }),

      // Add / Edit Modal
      isOpen && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("form", {
          onSubmit: handleSaveTemplate,
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3",
              children: [
                e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: editingTmpl ? "Edit Message Template" : "Create Message Template" }),
                e.jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "text-slate-400 font-black hover:text-slate-200 text-lg cursor-pointer px-2", children: "×" })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-4",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Template Name *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: name,
                      onChange: (ev) => setName(ev.target.value),
                      placeholder: "e.g. Contract Greetings Inbound",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Channel Platform Type *" }),
                    e.jsxs("select", {
                      value: type,
                      onChange: (ev) => setType(ev.target.value),
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold",
                      children: [
                        e.jsx("option", { value: "email", children: "📧 Email Template" }),
                        e.jsx("option", { value: "whatsapp", children: "💬 WhatsApp Template" }),
                        e.jsx("option", { value: "sms", children: "📱 SMS Template" })
                      ]
                    })
                  ]
                }),

                type === "email" && e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Email Subject Line *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: subject,
                      onChange: (ev) => setSubject(ev.target.value),
                      placeholder: "Welcome to Empire CRM, {name}!",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                      e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold", children: "Message Content Body *" }),
                      e.jsx("span", { className: "text-[10px] text-slate-400 font-medium", children: `${body.length} chars` })
                    ]}),
                    e.jsx("textarea", {
                      required: true,
                      rows: 4,
                      value: body,
                      onChange: (ev) => setBody(ev.target.value),
                      placeholder: "Hi {name}, thank you for inquiring at {company}...",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-mono transition resize-none"
                    }),
                    e.jsxs("div", { className: "flex items-center space-x-1.5 pt-1.5", children: [
                      e.jsx("span", { className: "text-[10px] font-bold text-slate-400", children: "Insert Variable:" }),
                      ["{name}", "{company}", "{email}", "{phone}"].map(v => e.jsx("button", {
                        key: v,
                        type: "button",
                        onClick: () => insertPlaceholder(v),
                        className: "px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold cursor-pointer transition",
                        children: v
                      }))
                    ]})
                  ]
                }),

                e.jsx("div", { className: "pt-2 border-t border-slate-200 dark:border-slate-800", children: e.jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [
                  e.jsx("input", { type: "checkbox", checked: active, onChange: (ev) => setActive(ev.target.checked), className: "rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" }),
                  e.jsx("span", { className: "text-slate-700 dark:text-slate-300 font-bold", children: "Template Active Status" })
                ]}) })
              ]
            }),

            formError && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold", children: formError }),

            e.jsxs("div", {
              className: "flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                e.jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/20 transition active:scale-95", children: editingTmpl ? "Update Template" : "Save Template" })
              ]
            })
          ]
        })
      }),

      // Preview Context Modal
      previewTmpl && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3",
              children: [
                e.jsxs("div", { children: [
                  e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: `Preview: ${previewTmpl.name}` }),
                  e.jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5", children: `Simulated output with mapped placeholder variables (${previewTmpl.type.toUpperCase()}).` })
                ]}),
                e.jsx("button", { type: "button", onClick: () => setPreviewTmpl(null), className: "text-slate-400 font-black hover:text-slate-200 text-lg cursor-pointer px-2", children: "×" })
              ]
            }),

            previewTmpl.subject && e.jsxs("div", {
              className: "p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              children: [
                e.jsx("span", { className: "text-[10px] font-bold text-slate-400 block uppercase", children: "Subject Line" }),
                e.jsx("span", { className: "font-bold text-slate-900 dark:text-white", children: renderInterpolatedBody(previewTmpl.subject) })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-1",
              children: [
                e.jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase", children: "Rendered Body" }),
                e.jsx("div", { className: "p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-24 select-all", children: renderInterpolatedBody(previewTmpl.body) })
              ]
            }),

            e.jsx("div", {
              className: "flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800",
              children: e.jsx("button", { type: "button", onClick: () => setPreviewTmpl(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Close Preview" })
            })
          ]
        })
      }),

      // Delete Confirmation Modal
      tmplToDeleteId && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-xs font-semibold text-center",
          children: [
            e.jsx("div", { className: "text-3xl", children: "⚠️" }),
            e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Delete Messaging Template" }),
            e.jsx("p", { className: "text-slate-400 font-medium", children: "Are you sure you want to delete this template? Automated campaign rules referencing this template will revert to default text." }),
            e.jsxs("div", {
              className: "flex items-center justify-center space-x-3 pt-2",
              children: [
                e.jsx("button", { type: "button", onClick: () => setTmplToDeleteId(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "button", onClick: () => confirmDeleteTemplate(tmplToDeleteId), className: "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold cursor-pointer shadow-sm", children: "Delete Template" })
              ]
            })
          ]
        })
      })
    ]
  });
}

/* === TAB 9: AUTOMATION RULES === */
function AutomationRulesComponent() {
  const { notify, element: toastEl } = useToast();
  const [rules, setRules] = t.useState([]);
  const [search, setSearch] = t.useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = t.useState("all");

  const [isOpen, setIsOpen] = t.useState(false);
  const [editingRule, setEditingRule] = t.useState(null);
  const [ruleToDeleteId, setRuleToDeleteId] = t.useState(null);
  const [testingRuleId, setTestingRuleId] = t.useState(null);

  // Form State
  const [name, setName] = t.useState("");
  const [trigger, setTrigger] = t.useState("lead_created");
  const [condition, setCondition] = t.useState("all_inbound");
  const [action, setAction] = t.useState("assign_lead");
  const [actionValue, setActionValue] = t.useState("Preeti Patel");
  const [enabled, setEnabled] = t.useState(true);
  const [formError, setFormError] = t.useState("");

  const sampleRules = [
    { id: "rule-1", name: "Auto Assign IndiaMART Leads", trigger: "lead_created", condition: "source_indiamart", action: "assign_lead", actionValue: "Preeti Patel", enabled: true, executions: 14 },
    { id: "rule-2", name: "Send Welcome WhatsApp Trigger", trigger: "lead_created", condition: "status_new", action: "send_whatsapp", actionValue: "Welcome Greetings Template", enabled: true, executions: 28 },
    { id: "rule-3", name: "Auto Followup Email Trigger", trigger: "status_changed", condition: "status_contacted", action: "send_email", actionValue: "Followup Email Template", enabled: true, executions: 9 }
  ];

  const loadRules = () => {
    const s = localStorage.getItem("leadflow_automation_rules");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRules(parsed);
          return;
        }
      } catch (err) {}
    }
    localStorage.setItem("leadflow_automation_rules", JSON.stringify(sampleRules));
    setRules(sampleRules);
  };

  t.useEffect(() => {
    loadRules();
  }, []);

  const saveRulesToStorage = (updatedList, msg) => {
    setRules(updatedList);
    localStorage.setItem("leadflow_automation_rules", JSON.stringify(updatedList));
    if (msg) notify(msg);
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setName("");
    setTrigger("lead_created");
    setCondition("all_inbound");
    setAction("assign_lead");
    setActionValue("Preeti Patel");
    setEnabled(true);
    setFormError("");
    setIsOpen(true);
  };

  const handleOpenEditModal = (r) => {
    setEditingRule(r);
    setName(r.name);
    setTrigger(r.trigger || "lead_created");
    setCondition(r.condition || "all_inbound");
    setAction(r.action || "assign_lead");
    setActionValue(r.actionValue || "");
    setEnabled(r.enabled !== false);
    setFormError("");
    setIsOpen(true);
  };

  const handleSaveRule = (ev) => {
    ev.preventDefault();
    setFormError("");

    if (!name.trim()) { setFormError("Rule name is required."); return; }
    if (!actionValue.trim()) { setFormError("Action parameter value is required."); return; }

    const isDuplicate = rules.some(r => r.name.toLowerCase() === name.trim().toLowerCase() && (!editingRule || r.id !== editingRule.id));
    if (isDuplicate) {
      setFormError(`Rule name "${name.trim()}" already exists. Please enter a unique name.`);
      return;
    }

    let updatedList;
    if (editingRule) {
      updatedList = rules.map(r => r.id === editingRule.id ? {
        ...r,
        name: name.trim(),
        trigger,
        condition,
        action,
        actionValue: actionValue.trim(),
        enabled
      } : r);
    } else {
      const newRule = {
        id: "rule-" + Date.now(),
        name: name.trim(),
        trigger,
        condition,
        action,
        actionValue: actionValue.trim(),
        enabled,
        executions: 0
      };
      updatedList = [...rules, newRule];
    }

    saveRulesToStorage(updatedList, editingRule ? `Automation rule "${name.trim()}" updated!` : `Automation rule "${name.trim()}" created!`);
    setIsOpen(false);
  };

  const toggleRuleStatus = (id) => {
    const updated = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    const target = rules.find(r => r.id === id);
    saveRulesToStorage(updated, `Rule "${target ? target.name : id}" status set to ${!target.enabled ? "Active" : "Inactive"}.`);
  };

  const confirmDeleteRule = (id) => {
    const target = rules.find(r => r.id === id);
    const updated = rules.filter(r => r.id !== id);
    saveRulesToStorage(updated, `Automation rule "${target ? target.name : id}" deleted.`);
    setRuleToDeleteId(null);
  };

  const handleTestRule = (r) => {
    setTestingRuleId(r.id);
    setTimeout(() => {
      setTestingRuleId(null);
      const updated = rules.map(item => item.id === r.id ? { ...item, executions: (item.executions || 0) + 1 } : item);
      saveRulesToStorage(updated);
      notify(`[TEST SUCCESS] Rule '${r.name}' executed cleanly! Trigger: ${r.trigger.toUpperCase()}, Action: ${r.action.toUpperCase()} (${r.actionValue})`);
    }, 600);
  };

  const triggerLabels = {
    lead_created: "⚡ Lead Created",
    status_changed: "🔄 Status Changed",
    followup_due: "⏰ Followup Due",
    deal_won: "🏆 Deal Won"
  };

  const actionLabels = {
    assign_lead: "👤 Assign Representative",
    send_whatsapp: "💬 Send WhatsApp Template",
    send_email: "📧 Send Email Notification",
    change_status: "🏷️ Update Pipeline Status"
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = !search ||
      (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.trigger && r.trigger.toLowerCase().includes(search.toLowerCase())) ||
      (r.action && r.action.toLowerCase().includes(search.toLowerCase())) ||
      (r.actionValue && r.actionValue.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatusFilter === "all" || (selectedStatusFilter === "active" ? r.enabled : !r.enabled);
    return matchesSearch && matchesStatus;
  });

  return e.jsxs("div", {
    className: "space-y-6 w-full min-w-0 pb-8 text-xs font-semibold box-border",
    children: [
      toastEl,

      // Header Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("h1", { className: "text-xl font-black text-slate-900 dark:text-white tracking-tight", children: "CRM Workflow Automation Rules" }),
              e.jsx("p", { className: "text-[11px] text-slate-400 font-medium mt-0.5", children: "Construct automated trigger-action rules to streamline sales assignment, auto-responders, and deal stages." })
            ]
          }),
          e.jsx("button", {
            type: "button",
            onClick: handleOpenAddModal,
            className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95 cursor-pointer shrink-0",
            children: "+ Create Automation Rule"
          })
        ]
      }),

      // Search & Status Filter Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        children: [
          e.jsx("input", {
            type: "text",
            value: search,
            onChange: (ev) => setSearch(ev.target.value),
            placeholder: "🔍 Search automation rules by name, trigger or action...",
            className: "flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition shadow-sm"
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0",
            children: [
              ["all", "active", "inactive"].map(st => e.jsx("button", {
                key: st,
                type: "button",
                onClick: () => setSelectedStatusFilter(st),
                className: `px-3 py-1.5 rounded-lg text-[11px] font-extrabold capitalize cursor-pointer transition ${selectedStatusFilter === st ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`,
                children: st === "all" ? "All Rules" : st
              }))
            ]
          })
        ]
      }),

      // Rules Cards Grid
      filteredRules.length === 0 ? e.jsxs("div", {
        className: "p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3",
        children: [
          e.jsx("div", { className: "text-4xl", children: "⚡" }),
          e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "No Automation Rules Configured" }),
          e.jsx("p", { className: "text-slate-400 font-medium text-xs max-w-sm mx-auto", children: "No workflow rules match your search. Click '+ Create Automation Rule' to build automated triggers." }),
          e.jsx("button", { type: "button", onClick: handleOpenAddModal, className: "px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-sm", children: "+ Create Automation Rule" })
        ]
      }) : e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
        children: filteredRules.map(r => e.jsxs("div", {
          className: `p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-4 flex flex-col justify-between transition hover:shadow-md ${r.enabled ? "border-slate-200 dark:border-slate-800/80" : "border-slate-300 dark:border-slate-800 opacity-60"}`,
          children: [
            e.jsxs("div", {
              className: "space-y-3",
              children: [
                e.jsxs("div", {
                  className: "flex items-start justify-between gap-3",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("h4", { className: "font-black text-sm text-slate-900 dark:text-white", children: r.name }),
                        e.jsxs("span", { className: "text-[10px] text-slate-400 font-medium block mt-0.5", children: [`Executions: ${r.executions || 0} runs`] })
                      ]
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => toggleRuleStatus(r.id),
                      className: `px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition ${r.enabled ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"}`,
                      children: r.enabled ? "Active" : "Inactive"
                    })
                  ]
                }),

                // Trigger & Action Boxes
                e.jsxs("div", {
                  className: "space-y-2 pt-1",
                  children: [
                    e.jsxs("div", {
                      className: "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-bold text-slate-400 block uppercase", children: "WHEN TRIGGER FIRES:" }),
                        e.jsx("span", { className: "text-[11px] font-extrabold text-slate-800 dark:text-slate-200", children: triggerLabels[r.trigger] || r.trigger })
                      ]
                    }),

                    e.jsxs("div", {
                      className: "p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 space-y-0.5",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-bold text-indigo-500 block uppercase", children: "THEN EXECUTE ACTION:" }),
                        e.jsxs("span", { className: "text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300", children: [actionLabels[r.action] || r.action, " -> ", r.actionValue] })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Footer Action Controls
            e.jsxs("div", {
              className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => handleTestRule(r),
                  disabled: testingRuleId === r.id,
                  className: "px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[11px] cursor-pointer transition flex items-center space-x-1",
                  children: testingRuleId === r.id ? "Testing..." : "🧪 Test Rule"
                }),
                e.jsxs("div", {
                  className: "flex items-center space-x-1.5",
                  children: [
                    e.jsx("button", { type: "button", onClick: () => handleOpenEditModal(r), className: "px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[11px] cursor-pointer transition", children: "✏️ Edit" }),
                    e.jsx("button", { type: "button", onClick: () => setRuleToDeleteId(r.id), className: "px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/30 cursor-pointer transition", children: "🗑️" })
                  ]
                })
              ]
            })
          ]
        }, r.id))
      }),

      // Add / Edit Modal
      isOpen && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("form", {
          onSubmit: handleSaveRule,
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3",
              children: [
                e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: editingRule ? "Edit Automation Rule" : "Create Automation Rule" }),
                e.jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "text-slate-400 font-black hover:text-slate-200 text-lg cursor-pointer px-2", children: "×" })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-4",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Automation Rule Name *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: name,
                      onChange: (ev) => setName(ev.target.value),
                      placeholder: "e.g. Auto Assign Inbound IndiaMART Leads",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Trigger Event (WHEN) *" }),
                    e.jsxs("select", {
                      value: trigger,
                      onChange: (ev) => setTrigger(ev.target.value),
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold",
                      children: [
                        e.jsx("option", { value: "lead_created", children: "⚡ Lead Created" }),
                        e.jsx("option", { value: "status_changed", children: "🔄 Lead Status Changed" }),
                        e.jsx("option", { value: "followup_due", children: "⏰ Follow-up Due" }),
                        e.jsx("option", { value: "deal_won", children: "🏆 Deal Won" })
                      ]
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Filter Condition *" }),
                    e.jsxs("select", {
                      value: condition,
                      onChange: (ev) => setCondition(ev.target.value),
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold",
                      children: [
                        e.jsx("option", { value: "all_inbound", children: "All Inbound Leads" }),
                        e.jsx("option", { value: "source_indiamart", children: "Lead Source == IndiaMART" }),
                        e.jsx("option", { value: "source_justdial", children: "Lead Source == JustDial" }),
                        e.jsx("option", { value: "status_new", children: "Lead Status == New" }),
                        e.jsx("option", { value: "status_contacted", children: "Lead Status == Contacted" })
                      ]
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Action Type (THEN) *" }),
                    e.jsxs("select", {
                      value: action,
                      onChange: (ev) => {
                        setAction(ev.target.value);
                        if (ev.target.value === "assign_lead") setActionValue("Rahul Sharma");
                        else if (ev.target.value === "send_whatsapp") setActionValue("Welcome Greetings Template");
                        else if (ev.target.value === "send_email") setActionValue("Followup Email Template");
                        else if (ev.target.value === "change_status") setActionValue("Contacted");
                      },
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold",
                      children: [
                        e.jsx("option", { value: "assign_lead", children: "👤 Assign Representative" }),
                        e.jsx("option", { value: "send_whatsapp", children: "💬 Send WhatsApp Template" }),
                        e.jsx("option", { value: "send_email", children: "📧 Send Email Notification" }),
                        e.jsx("option", { value: "change_status", children: "🏷️ Update Pipeline Status" })
                      ]
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 font-bold mb-1", children: "Action Parameter / Value *" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      value: actionValue,
                      onChange: (ev) => setActionValue(ev.target.value),
                      placeholder: "e.g. Preeti Patel or Template Name",
                      className: "w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
                    })
                  ]
                }),

                e.jsx("div", { className: "pt-2 border-t border-slate-200 dark:border-slate-800", children: e.jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [
                  e.jsx("input", { type: "checkbox", checked: enabled, onChange: (ev) => setEnabled(ev.target.checked), className: "rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" }),
                  e.jsx("span", { className: "text-slate-700 dark:text-slate-300 font-bold", children: "Rule Enabled Active Status" })
                ]}) })
              ]
            }),

            formError && e.jsx("p", { className: "text-[11px] text-rose-500 font-bold", children: formError }),

            e.jsxs("div", {
              className: "flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                e.jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md shadow-indigo-600/20 transition active:scale-95", children: editingRule ? "Update Rule" : "Create Rule" })
              ]
            })
          ]
        })
      }),

      // Delete Confirmation Modal
      ruleToDeleteId && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto",
        children: e.jsxs("div", {
          className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-xs font-semibold text-center",
          children: [
            e.jsx("div", { className: "text-3xl", children: "⚠️" }),
            e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Delete Automation Rule" }),
            e.jsx("p", { className: "text-slate-400 font-medium", children: "Are you sure you want to delete this automation rule? It will no longer execute automatic triggers." }),
            e.jsxs("div", {
              className: "flex items-center justify-center space-x-3 pt-2",
              children: [
                e.jsx("button", { type: "button", onClick: () => setRuleToDeleteId(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer", children: "Cancel" }),
                e.jsx("button", { type: "button", onClick: () => confirmDeleteRule(ruleToDeleteId), className: "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold cursor-pointer shadow-sm", children: "Delete Rule" })
              ]
            })
          ]
        })
      })
    ]
  });
}

/* === MAIN PAGE WRAPPER COMPONENT === */
function SettingsPageWrapper() {
  const [activeSettingsTab, setActiveSettingsTab] = t.useState("account");

  t.useEffect(() => {
    const updateTab = () => {
      const path = window.location.pathname;
      if (path.includes("/settings/web")) setActiveSettingsTab("web");
      else if (path.includes("/settings/lead-trash") || path.includes("/settings/trash")) setActiveSettingsTab("trash");
      else if (path.includes("/settings/lead")) setActiveSettingsTab("lead");
      else if (path.includes("/settings/hrms")) setActiveSettingsTab("hrms");
      else if (path.includes("/settings/integrations")) setActiveSettingsTab("integrations");
      else if (path.includes("/settings/attributes")) setActiveSettingsTab("attributes");
      else if (path.includes("/settings/templates")) setActiveSettingsTab("templates");
      else if (path.includes("/settings/automation")) setActiveSettingsTab("automation");
      else if (path.includes("/settings/account")) setActiveSettingsTab("account");
      else setActiveSettingsTab("account");
    };
    updateTab();
    window.addEventListener("popstate", updateTab);
    const timer = setInterval(updateTab, 200);
    return () => {
      window.removeEventListener("popstate", updateTab);
      clearInterval(timer);
    };
  }, []);

  const handleTabClick = (tabKey) => {
    const routeMap = {
      account: "/crmbusiness/settings/account-security",
      web: "/crmbusiness/settings/web",
      lead: "/crmbusiness/settings/lead",
      hrms: "/crmbusiness/settings/hrms",
      integrations: "/crmbusiness/settings/integrations",
      trash: "/crmbusiness/settings/lead-trash",
      attributes: "/crmbusiness/settings/attributes",
      templates: "/crmbusiness/settings/templates",
      automation: "/crmbusiness/settings/automation-rules"
    };
    const targetUrl = routeMap[tabKey] || "/crmbusiness/settings";
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, "", targetUrl);
      window.dispatchEvent(new Event("popstate"));
    }
    setActiveSettingsTab(tabKey);
  };

  const renderActiveTab = () => {
    switch (activeSettingsTab) {
      case "web": return e.jsx(WebSettingsComponent, {});
      case "lead": return e.jsx(LeadSettingsComponent, {});
      case "hrms": return e.jsx(HRMSSettingsComponent, {});
      case "integrations": return e.jsx(DetailedIntegrations, {});
      case "trash": return e.jsx(LeadTrash, {});
      case "attributes": return e.jsx(AttributesSettings, {});
      case "templates": return e.jsx(TemplatesSettings, {});
      case "automation": return e.jsx(AutomationRulesComponent, {});
      default: return e.jsx(AccountSettings, {});
    }
  };

  const tabsConfig = [
    { key: "account", label: "🔐 Account & Security" },
    { key: "web", label: "🌐 Web Settings" },
    { key: "lead", label: "🎯 Lead Settings" },
    { key: "hrms", label: "👥 HRMS Settings" },
    { key: "integrations", label: "🔗 Integrations & API" },
    { key: "trash", label: "🗑️ Lead Trash" },
    { key: "attributes", label: "🏷️ Attributes" },
    { key: "templates", label: "📝 Templates" },
    { key: "automation", label: "⚡ Automation Rules" }
  ];

  return e.jsxs("div", {
    className: "space-y-6 w-full min-w-0 pb-8 text-xs font-semibold",
    children: [
      // Scrollable Tab Navigation Bar
      e.jsx("div", {
        className: "flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full overflow-x-auto scrollbar-thin",
        children: e.jsx("div", {
          className: "flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl font-extrabold space-x-1 whitespace-nowrap",
          children: tabsConfig.map(tab => e.jsx("button", {
            key: tab.key,
            type: "button",
            onClick: () => handleTabClick(tab.key),
            className: `px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${activeSettingsTab === tab.key ? "bg-indigo-600 text-white shadow-sm font-bold scale-105" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}`,
            children: tab.label
          }))
        })
      }),

      // Render Active Component
      e.jsx("div", {
        className: "w-full transition-opacity duration-300",
        children: renderActiveTab()
      })
    ]
  });
}

export { SettingsPageWrapper as default };
