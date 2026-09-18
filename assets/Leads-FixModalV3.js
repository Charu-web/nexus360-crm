import{l as ae,u as le,r as s,j as e,a as re,P as de,S as oe,C as I,X as ne,M as ie,s as B,n as Modal}from"./index-FixModalV3.js";
import{g as getLeads,c as createLead,u as updateLeadStatus,a as addLeadNote,d as deleteLead,r as restoreLead,cc as convertToCust,cd as convertToDeal,ad as autoDistribute}from"./leadService-BjryWvWs.js";
import{f as formatCurrency}from"./formatCurrency-ChTmm5Hb.js";

function LeadsPage() {
  const [leads, setLeads] = s.useState([]);
  const [loading, setLoading] = s.useState(true);
  const [search, setSearch] = s.useState("");
  const [statusFilter, setStatusFilter] = s.useState("all");
  const [classificationFilter, setClassificationFilter] = s.useState("all");
  const [activeTab, setActiveTab] = s.useState("all"); // "all", "trash"

  // Selected lead for detail drawer
  const [selectedLead, setSelectedLead] = s.useState(null);
  const [noteText, setNoteText] = s.useState("");
  const [toast, setToast] = s.useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = s.useState(false);
  const [showImportModal, setShowImportModal] = s.useState(false);
  const [importText, setImportText] = s.useState("");

  // New Lead Form State
  const [name, setName] = s.useState("");
  const [company, setCompany] = s.useState("");
  const [email, setEmail] = s.useState("");
  const [phone, setPhone] = s.useState("");
  const [status, setStatus] = s.useState("new");
  const [priority, setPriority] = s.useState("high");
  const [source, setSource] = s.useState("website");
  const [value, setValue] = s.useState("");
  const [assignedTo, setAssignedTo] = s.useState("Rahul Sharma");
  const [altAssignedTo, setAltAssignedTo] = s.useState("Preeti Patel");
  const [nextFollowupDate, setNextFollowupDate] = s.useState("2026-08-26");

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLeads = () => {
    setLoading(true);
    getLeads({
      status: activeTab === "trash" ? "trash" : statusFilter,
      classification: classificationFilter,
      search: search
    }).then(res => {
      if (res && res.success) {
        setLeads(res.data);
      }
    }).finally(() => setLoading(false));
  };

  s.useEffect(() => {
    fetchLeads();
  }, [statusFilter, classificationFilter, search, activeTab]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      notify("Lead name is required.");
      return;
    }
    const res = await createLead({
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      priority,
      source,
      value: Number(value) || 0,
      assignedTo,
      altAssignedTo,
      nextFollowupDate
    });
    if (res && res.success) {
      setShowAddModal(false);
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setValue("");
      notify("Lead created successfully!");
      fetchLeads();
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await updateLeadStatus(id, newStatus);
    if (res && res.success) {
      fetchLeads();
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead(res.data);
      }
      notify(`Status updated to ${newStatus.toUpperCase()}`);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedLead || !noteText.trim()) return;
    const res = await addLeadNote(selectedLead._id, noteText.trim());
    if (res && res.success) {
      setNoteText("");
      setSelectedLead(res.data);
      fetchLeads();
      notify("Note added to timeline.");
    }
  };

  const handleDelete = async (id, permanent = false) => {
    await deleteLead(id, permanent);
    if (selectedLead && selectedLead._id === id) setSelectedLead(null);
    notify(permanent ? "Lead permanently deleted." : "Lead moved to Trash / Recycle Bin.");
    fetchLeads();
  };

  const handleRestore = async (id) => {
    await restoreLead(id);
    notify("Lead restored from Trash.");
    fetchLeads();
  };

  const handleConvertToCustomer = async (lead) => {
    const res = await convertToCust(lead);
    if (res && res.success) {
      notify(`Lead converted to Customer profile!`);
      fetchLeads();
      if (selectedLead) setSelectedLead({ ...selectedLead, status: "won" });
    }
  };

  const handleConvertToDeal = async (lead) => {
    const res = await convertToDeal(lead);
    if (res && res.success) {
      notify(`Sales Deal created for ${lead.company || lead.name}!`);
      fetchLeads();
    }
  };

  const handleAutoDistribute = async () => {
    const res = await autoDistribute();
    if (res && res.success) {
      notify(`Auto-distributed ${res.count} leads evenly among team members!`);
      fetchLeads();
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (leads.length === 0) {
      notify("No leads to export.");
      return;
    }
    const headers = ["ID", "Name", "Company", "Email", "Phone", "Status", "Priority", "Classification", "Score", "Value", "Assigned To", "Next Followup"];
    const rows = leads.map(l => [
      l._id,
      `"${l.name || ""}"`,
      `"${l.company || ""}"`,
      `"${l.email || ""}"`,
      `"${l.phone || ""}"`,
      l.status || "new",
      l.priority || "medium",
      l.classification || "hot",
      l.score || 50,
      l.value || 0,
      `"${l.assignedTo || ""}"`,
      l.nextFollowupDate || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "empire_crm_leads_export.csv");
    document.body.appendChild(link);
    link.click();
    if(link&&link.parentNode===document.body)document.body.removeChild(link);
    notify("CSV Export downloaded successfully!");
  };

  // CSV Import
  const handleImportCSV = (e) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const lines = importText.trim().split("\n");
    let count = 0;
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes("name")) return; // skip header
      const parts = line.split(",");
      if (parts.length >= 2) {
        createLead({
          name: parts[0]?.replace(/"/g, "").trim(),
          company: parts[1]?.replace(/"/g, "").trim() || "Company",
          email: parts[2]?.replace(/"/g, "").trim() || "client@domain.com",
          phone: parts[3]?.replace(/"/g, "").trim() || "+1 555-0100",
          value: Number(parts[4]?.replace(/"/g, "").trim()) || 25000
        });
        count++;
      }
    });
    setShowImportModal(false);
    setImportText("");
    notify(`Successfully imported ${count} leads with duplicate validation!`);
    fetchLeads();
  };

  return e.jsxs("div", {
    className: "leads-module space-y-6 pb-12 w-full max-w-none min-w-0 font-sans text-slate-900 dark:text-slate-100",
    children: [
      // Toast notification
      toast && e.jsx("div", {
        className: "fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce",
        children: [
          e.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }),
          e.jsx("span", { children: toast })
        ]
      }),

      // Header Bar
      e.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm",
        children: [
          e.jsxs("div", {
            className: "space-y-1",
            children: [
              e.jsxs("div", {
                className: "flex items-center space-x-3",
                children: [
                  e.jsx("h1", { className: "text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white", children: "Lead Management" }),
                  e.jsx("span", { className: "px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20", children: `${leads.length} Total Records` })
                ]
              }),
              e.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-medium", children: "Track, score, auto-distribute, and convert qualified business opportunities into clients." })
            ]
          }),

          // Action Buttons
          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-2",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: handleAutoDistribute,
                className: "px-3 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 text-xs font-extrabold border border-purple-500/30 transition flex items-center space-x-1.5 cursor-pointer",
                title: "Round-robin lead assignment",
                children: [
                  e.jsx("span", { children: "🔄" }),
                  e.jsx("span", { children: "Auto-Distribute" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: handleExportCSV,
                className: "px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer",
                children: [
                  e.jsx("span", { children: "📥" }),
                  e.jsx("span", { children: "Export CSV" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setShowImportModal(true),
                className: "px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer",
                children: [
                  e.jsx("span", { children: "📤" }),
                  e.jsx("span", { children: "Import CSV" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setShowAddModal(true),
                className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 cursor-pointer",
                children: [
                  e.jsx("span", { className: "text-base leading-none", children: "+" }),
                  e.jsx("span", { children: "New Lead" })
                ]
              })
            ]
          })
        ]
      }),

      // Filters & Search Bar
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm",
        children: [
          // Tabs: All Leads vs Recycle Bin / Trash
          e.jsxs("div", {
            className: "flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: () => setActiveTab("all"),
                className: `px-3 py-1 rounded-lg transition ${activeTab === "all" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`,
                children: "Active Pipeline"
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => setActiveTab("trash"),
                className: `px-3 py-1 rounded-lg transition ${activeTab === "trash" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`,
                children: "🗑️ Recycle Bin"
              })
            ]
          }),

          // Search Input & Classification Filters
          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-2.5",
            children: [
              e.jsx("input", {
                type: "text",
                placeholder: "Search lead name, company, email, phone...",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                className: "px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none w-56 focus:border-indigo-500"
              }),
              e.jsxs("select", {
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                className: "px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer",
                children: [
                  e.jsx("option", { value: "all", children: "All Statuses" }),
                  e.jsx("option", { value: "new", children: "New" }),
                  e.jsx("option", { value: "processing", children: "Processing" }),
                  e.jsx("option", { value: "close_by", children: "Close-by / Proposal" }),
                  e.jsx("option", { value: "won", children: "Won (Converted)" }),
                  e.jsx("option", { value: "lost", children: "Lost" })
                ]
              }),
              e.jsxs("select", {
                value: classificationFilter,
                onChange: (e) => setClassificationFilter(e.target.value),
                className: "px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer",
                children: [
                  e.jsx("option", { value: "all", children: "All Scoring" }),
                  e.jsx("option", { value: "hot", children: "🔥 Hot Leads (80+)" }),
                  e.jsx("option", { value: "warm", children: "☀️ Warm Leads (50-79)" }),
                  e.jsx("option", { value: "cold", children: "❄️ Cold Leads (<50)" })
                ]
              })
            ]
          })
        ]
      }),

      // Leads Table
      e.jsx("div", {
        className: "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden",
        children: loading ? e.jsx("div", {
          className: "py-16 text-center text-xs text-slate-400 font-medium",
          children: "Loading pipeline records..."
        }) : leads.length === 0 ? e.jsx("div", {
          className: "py-16 text-center text-xs text-slate-400 font-medium",
          children: activeTab === "trash" ? "Recycle bin is empty." : "No leads match your active filters."
        }) : e.jsxs("div", {
          className: "overflow-x-auto",
          children: [
            e.jsxs("table", {
              className: "w-full text-left text-xs text-slate-600 dark:text-slate-400 border-collapse",
              children: [
                e.jsx("thead", {
                  className: "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800",
                  children: e.jsxs("tr", {
                    children: [
                      e.jsx("th", { className: "py-3 px-4", children: "Lead Details" }),
                      e.jsx("th", { className: "py-3 px-4", children: "Classification & Score" }),
                      e.jsx("th", { className: "py-3 px-4", children: "Deal Value" }),
                      e.jsx("th", { className: "py-3 px-4", children: "Assigned Representative" }),
                      e.jsx("th", { className: "py-3 px-4", children: "Status" }),
                      e.jsx("th", { className: "py-3 px-4 text-right", children: "Actions" })
                    ]
                  })
                }),
                e.jsx("tbody", {
                  className: "divide-y divide-slate-100 dark:divide-slate-800/60",
                  children: leads.map(l => e.jsxs("tr", {
                    key: l._id,
                    className: "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition",
                    children: [
                      // Lead Info
                      e.jsxs("td", {
                        className: "py-3 px-4",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center space-x-2 cursor-pointer",
                            onClick: () => setSelectedLead(l),
                            children: [
                              e.jsx("span", { className: "font-black text-slate-900 dark:text-white hover:text-indigo-600 transition", children: l.name }),
                              e.jsx("span", { className: "text-[10px] text-slate-400 font-bold", children: `(${l.company || "No Company"})` })
                            ]
                          }),
                          e.jsxs("p", {
                            className: "text-[11px] text-slate-500 font-medium",
                            children: [l.email, l.phone && ` • ${l.phone}`]
                          })
                        ]
                      }),

                      // Classification & Score
                      e.jsx("td", {
                        className: "py-3 px-4",
                        children: e.jsxs("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            e.jsx("span", {
                              className: `px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${l.classification === "hot" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30" : l.classification === "warm" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"}`,
                              children: l.classification || "hot"
                            }),
                            e.jsxs("span", { className: "text-xs font-black text-slate-700 dark:text-slate-300", children: [`${l.score || 85}`, "/100"] })
                          ]
                        })
                      }),

                      // Deal Value
                      e.jsx("td", {
                        className: "py-3 px-4 font-black text-slate-900 dark:text-white",
                        children: formatCurrency(l.value || 0)
                      }),

                      // Assigned To
                      e.jsxs("td", {
                        className: "py-3 px-4 font-semibold text-slate-700 dark:text-slate-300",
                        children: [
                          e.jsx("p", { children: l.assignedTo || "Rahul Sharma" }),
                          l.altAssignedTo && e.jsxs("span", { className: "text-[10px] text-slate-400 font-normal", children: ["Alt: ", l.altAssignedTo] })
                        ]
                      }),

                      // Status Select
                      e.jsx("td", {
                        className: "py-3 px-4",
                        children: activeTab === "trash" ? e.jsx("span", { className: "text-rose-500 font-extrabold text-[11px]", children: "In Trash" }) : e.jsxs("select", {
                          value: l.status || "new",
                          onChange: (e) => handleStatusChange(l._id, e.target.value),
                          className: `px-2.5 py-1 rounded-xl text-[10px] font-extrabold border outline-none cursor-pointer ${l.status === "won" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : l.status === "proposal" || l.status === "close_by" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`,
                          children: [
                            e.jsx("option", { value: "new", children: "New" }),
                            e.jsx("option", { value: "processing", children: "Processing" }),
                            e.jsx("option", { value: "qualified", children: "Qualified" }),
                            e.jsx("option", { value: "proposal", children: "Proposal" }),
                            e.jsx("option", { value: "close_by", children: "Close-by" }),
                            e.jsx("option", { value: "won", children: "Won" }),
                            e.jsx("option", { value: "lost", children: "Lost" })
                          ]
                        })
                      }),

                      // Actions
                      e.jsx("td", {
                        className: "py-3 px-4 text-right",
                        children: activeTab === "trash" ? e.jsxs("div", {
                          className: "flex items-center justify-end space-x-2",
                          children: [
                            e.jsx("button", {
                              type: "button",
                              onClick: () => handleRestore(l._id),
                              className: "px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]",
                              children: "Restore"
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => handleDelete(l._id, true),
                              className: "px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]",
                              children: "Delete"
                            })
                          ]
                        }) : e.jsxs("div", {
                          className: "flex items-center justify-end space-x-1.5",
                          children: [
                            // Convert to Customer
                            e.jsx("button", {
                              type: "button",
                              onClick: () => handleConvertToCustomer(l),
                              className: "p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]",
                              title: "Convert Lead to Customer Profile",
                              children: "👤 Convert"
                            }),
                            // Convert to Deal
                            e.jsx("button", {
                              type: "button",
                              onClick: () => handleConvertToDeal(l),
                              className: "p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-[10px]",
                              title: "Create Deal from Lead",
                              children: "💼 Deal"
                            }),
                            // View details
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setSelectedLead(l),
                              className: "p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs",
                              title: "View Timeline & Notes",
                              children: "👁️"
                            }),
                            // Trash
                            e.jsx("button", {
                              type: "button",
                              onClick: () => handleDelete(l._id, false),
                              className: "p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs",
                              title: "Move to Trash",
                              children: "🗑️"
                            })
                          ]
                        })
                      })
                    ]
                  }))
                })
              ]
            })
          ]
        })
      }),

      // Lead Details Drawer / Modal
      selectedLead && e.jsx(Modal, {
        isOpen: !!selectedLead,
        onClose: () => setSelectedLead(null),
        title: `Lead Details: ${selectedLead.name}`,
        children: e.jsxs("div", {
          className: "space-y-4 text-xs font-semibold max-h-[75vh] overflow-y-auto pr-1",
          children: [
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800",
              children: [
                e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 uppercase font-black", children: "Company" }), e.jsx("p", { className: "text-slate-900 dark:text-white font-bold", children: selectedLead.company || "N/A" })] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 uppercase font-black", children: "Estimated Value" }), e.jsx("p", { className: "text-indigo-600 dark:text-indigo-400 font-black", children: formatCurrency(selectedLead.value || 0) })] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 uppercase font-black", children: "Email" }), e.jsx("p", { className: "text-slate-900 dark:text-white", children: selectedLead.email || "N/A" })] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 uppercase font-black", children: "Phone" }), e.jsx("p", { className: "text-slate-900 dark:text-white", children: selectedLead.phone || "N/A" })] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 uppercase font-black", children: "Assigned SDR" }), e.jsx("p", { className: "text-slate-900 dark:text-white", children: selectedLead.assignedTo })] }),
                e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 uppercase font-black", children: "Next Follow-up" }), e.jsx("p", { className: "text-slate-900 dark:text-white", children: selectedLead.nextFollowupDate || "2026-08-26" })] })
              ]
            }),

            // Notes Section
            e.jsxs("div", {
              className: "space-y-2",
              children: [
                e.jsx("h4", { className: "font-black text-slate-900 dark:text-white text-xs", children: "Notes & Timeline Activity" }),
                e.jsxs("form", {
                  onSubmit: handleAddNote,
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx("input", {
                      type: "text",
                      placeholder: "Add progress note or call log...",
                      value: noteText,
                      onChange: (e) => setNoteText(e.target.value),
                      className: "flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    }),
                    e.jsx("button", {
                      type: "submit",
                      className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold",
                      children: "Add Note"
                    })
                  ]
                }),
                e.jsx("div", {
                  className: "space-y-2 pt-2",
                  children: (selectedLead.notes || []).map((n, idx) => e.jsxs("div", {
                    key: idx,
                    className: "p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1",
                    children: [
                      e.jsx("p", { className: "text-slate-800 dark:text-slate-200 font-medium", children: n.text }),
                      e.jsxs("span", { className: "text-[10px] text-slate-400", children: [n.createdBy, " • ", new Date(n.createdAt).toLocaleDateString()] })
                    ]
                  }))
                })
              ]
            })
          ]
        })
      }),

      // Add Lead Modal
      showAddModal && e.jsx(Modal, {
        isOpen: showAddModal,
        onClose: () => setShowAddModal(false),
        title: "Create New Lead",
        children: e.jsxs("form", {
          onSubmit: handleCreateLead,
          className: "space-y-3.5 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Contact / Full Name *" }),
                e.jsx("input", {
                  type: "text",
                  required: true,
                  placeholder: "e.g. Vikram Malhotra",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                })
              ]
            }),
            e.jsxs("div", {
              children: [
                e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Company Name" }),
                e.jsx("input", {
                  type: "text",
                  placeholder: "e.g. Apex Retail Solutions",
                  value: company,
                  onChange: (e) => setCompany(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Email Address" }),
                    e.jsx("input", {
                      type: "email",
                      placeholder: "vikram@apex.in",
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Phone / WhatsApp" }),
                    e.jsx("input", {
                      type: "text",
                      placeholder: "+91 98200 11223",
                      value: phone,
                      onChange: (e) => setPhone(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Deal Value ($)" }),
                    e.jsx("input", {
                      type: "number",
                      placeholder: "42000",
                      value: value,
                      onChange: (e) => setValue(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Source" }),
                    e.jsxs("select", {
                      value: source,
                      onChange: (e) => setSource(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold",
                      children: [
                        e.jsx("option", { value: "website", children: "Website Capture" }),
                        e.jsx("option", { value: "indiamart", children: "IndiaMART API" }),
                        e.jsx("option", { value: "justdial", children: "JustDial" }),
                        e.jsx("option", { value: "facebook", children: "Facebook Lead Ads" }),
                        e.jsx("option", { value: "google_ads", children: "Google Ads" }),
                        e.jsx("option", { value: "referral", children: "Referral" })
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              className: "flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => setShowAddModal(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                e.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md",
                  children: "Save Lead"
                })
              ]
            })
          ]
        })
      }),

      // Import CSV Modal
      showImportModal && e.jsx(Modal, {
        isOpen: showImportModal,
        onClose: () => setShowImportModal(false),
        title: "Import Leads from CSV",
        children: e.jsxs("form", {
          onSubmit: handleImportCSV,
          className: "space-y-4 text-xs font-semibold",
          children: [
            e.jsx("p", { className: "text-slate-500", children: "Paste CSV lines formatted as: Name, Company, Email, Phone, Value" }),
            e.jsx("textarea", {
              rows: 6,
              placeholder: `Vikram Malhotra, Apex Retail, vikram@apex.in, +91 98200 11223, 45000\nAnita Desai, Zenith Fin, anita@zenith.com, +91 99300 44556, 32000`,
              value: importText,
              onChange: (e) => setImportText(e.target.value),
              className: "w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-mono text-[11px]"
            }),
            e.jsxs("div", {
              className: "flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: () => setShowImportModal(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                e.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md",
                  children: "Import Records"
                })
              ]
            })
          ]
        })
      })
    ]
  });
}

export { LeadsPage as default };
