import{c as F,n as Ie,a as Pt,b as At,B as ir,F as St,d as Ot,U as Tt,j as a,R as f,g as Ye,r as P,u as Xe,m as or,P as lr,M as cr,e as dr,f as ur,S as Rt,h as Ct,i as _t,k as mr}from"./index-Ftt5f73P.js";
import{f as W}from"./formatCurrency-ChTmm5Hb.js";

// Helper for local data management
const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

function Dashboard() {
  const { theme } = Xe(state => state.ui);
  const isDark = theme === "dark";

  // Active filters and tab states
  const [period, setPeriod] = P.useState("today");
  const [leadTab, setLeadTab] = P.useState("new"); // "new", "processing", "close_by"
  const [taskTab, setTaskTab] = P.useState("today"); // "today", "tomorrow"
  const [scheduleTab, setScheduleTab] = P.useState("meeting"); // "reminder", "meeting", "events"
  const [todoTab, setTodoTab] = P.useState("high"); // "high", "medium", "low"
  const [hrTab, setHrTab] = P.useState("leave"); // "leave", "interview", "shift"

  // Quick Action Modals
  const [showWhatsAppModal, setShowWhatsAppModal] = P.useState(false);
  const [showCallModal, setShowCallModal] = P.useState(false);
  const [showQuickLeadModal, setShowQuickLeadModal] = P.useState(false);
  const [showMeetingModal, setShowMeetingModal] = P.useState(false);

  // Form states for quick actions
  const [quickLeadName, setQuickLeadName] = P.useState("");
  const [quickLeadCompany, setQuickLeadCompany] = P.useState("");
  const [quickLeadEmail, setQuickLeadEmail] = P.useState("");
  const [quickLeadPhone, setQuickLeadPhone] = P.useState("");
  const [quickLeadValue, setQuickLeadValue] = P.useState("");
  const [quickLeadPriority, setQuickLeadPriority] = P.useState("high");

  const [waRecipient, setWaRecipient] = P.useState("");
  const [waMessage, setWaMessage] = P.useState("");
  const [waTemplate, setWaTemplate] = P.useState("welcome");

  const [callLeadName, setCallLeadName] = P.useState("");
  const [callOutcome, setCallOutcome] = P.useState("connected");
  const [callNotes, setCallNotes] = P.useState("");

  const [meetTitle, setMeetTitle] = P.useState("");
  const [meetClient, setMeetClient] = P.useState("");
  const [meetDate, setMeetDate] = P.useState("2026-08-26");
  const [meetTime, setMeetTime] = P.useState("15:00");

  const [newTodoText, setNewTodoText] = P.useState("");

  // Notification toast
  const [toastMsg, setToastMsg] = P.useState(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Real data state from localStorage
  const [leads, setLeads] = P.useState([]);
  const [tasks, setTasks] = P.useState([]);
  const [todos, setTodos] = P.useState([]);
  const [meetings, setMeetings] = P.useState([]);
  const [reminders, setReminders] = P.useState([]);
  const [customers, setCustomers] = P.useState([]);

  const loadAllData = () => {
    // 1. Leads
    const defaultLeads = [
      { _id: "lead-1", name: "Sarah Connor", company: "Cyberdyne Systems", email: "sarah@cyberdyne.io", phone: "+1 555-0199", status: "close_by", priority: "high", value: 65000, score: 88, classification: "hot", assignedTo: "Rahul Sharma", nextFollowupDate: "2026-08-26", isDeleted: false },
      { _id: "lead-2", name: "John Doe", company: "Acme Logistics", email: "john@acme.com", phone: "+1 555-0381", status: "new", priority: "medium", value: 24500, score: 72, classification: "warm", assignedTo: "Preeti Patel", nextFollowupDate: "2026-08-26", isDeleted: false },
      { _id: "lead-3", name: "Alex Rivera", company: "Nexus Tech", email: "alex@nexus.io", phone: "+1 555-0921", status: "close_by", priority: "high", value: 85000, score: 94, classification: "hot", assignedTo: "Sarah Miller", nextFollowupDate: "2026-08-26", isDeleted: false },
      { _id: "lead-4", name: "Vikram Malhotra", company: "Apex Retail Solutions", email: "vikram@apexretail.in", phone: "+91 98200 11223", status: "new", priority: "high", value: 42000, score: 82, classification: "hot", assignedTo: "Rahul Sharma", nextFollowupDate: "2026-08-26", isDeleted: false },
      { _id: "lead-5", name: "Anita Desai", company: "Zenith Financials", email: "anita@zenithfin.com", phone: "+91 99300 44556", status: "processing", priority: "medium", value: 31000, score: 65, classification: "warm", assignedTo: "Amit Verma", nextFollowupDate: "2026-08-27", isDeleted: false },
      { _id: "lead-6", name: "Michael Chang", company: "Vortex Software", email: "michael@vortex.dev", phone: "+1 555-0442", status: "processing", priority: "high", value: 58000, score: 91, classification: "hot", assignedTo: "Preeti Patel", nextFollowupDate: "2026-08-26", isDeleted: false }
    ];
    const storedLeads = getStored("leadflow_leads", defaultLeads);
    setLeads(storedLeads.filter(l => !l.isDeleted));

    // 2. Tasks
    const defaultTasks = [
      { id: "task-1", title: "Finalize Enterprise SaaS Proposal for Cyberdyne", priority: "high", dueDate: "2026-08-26", completed: false, assignedTo: "Rahul Sharma", client: "Cyberdyne Systems" },
      { id: "task-2", title: "Schedule Product Demo with Nexus Tech VP", priority: "high", dueDate: "2026-08-26", completed: true, assignedTo: "Sarah Miller", client: "Nexus Tech" },
      { id: "task-3", title: "Send IndiaMART Lead Follow-up WhatsApp message", priority: "medium", dueDate: "2026-08-26", completed: false, assignedTo: "Rahul Sharma", client: "Apex Retail" },
      { id: "task-4", title: "Quarterly Pipeline Review with Executive Team", priority: "medium", dueDate: "2026-08-27", completed: false, assignedTo: "Preeti Patel", client: "Internal" },
      { id: "task-5", title: "Configure Payment Gateway Webhooks for Invoices", priority: "low", dueDate: "2026-08-27", completed: false, assignedTo: "Amit Verma", client: "System" }
    ];
    setTasks(getStored("leadflow_tasks", defaultTasks));

    // 3. Todos
    const defaultTodos = [
      { id: "todo-1", text: "Verify customer KYC for contract #CNT-8841", priority: "high", completed: false },
      { id: "todo-2", text: "Send revised invoice statement to Apex Retail", priority: "high", completed: true },
      { id: "todo-3", text: "Update lead distribution rules in CRM settings", priority: "medium", completed: false },
      { id: "todo-4", text: "Review interview applications for Sales Executive", priority: "medium", completed: false },
      { id: "todo-5", text: "Backup customer database & export weekly CSV", priority: "low", completed: false }
    ];
    setTodos(getStored("leadflow_todos", defaultTodos));

    // 4. Meetings
    const defaultMeetings = [
      { id: "meet-1", title: "Product Architecture Demo", client: "Sarah Connor (Cyberdyne)", time: "11:00 AM", date: "2026-08-26", status: "Upcoming", link: "https://meet.google.com/crm-demo" },
      { id: "meet-2", title: "Commercial Terms & SLA Review", client: "Alex Rivera (Nexus Tech)", time: "02:30 PM", date: "2026-08-26", status: "Upcoming", link: "https://meet.google.com/sla-review" },
      { id: "meet-3", title: "Onboarding Kickoff Meeting", client: "Vikram Malhotra (Apex Retail)", time: "04:00 PM", date: "2026-08-26", status: "Upcoming", link: "https://meet.google.com/onboard-apex" },
      { id: "meet-4", title: "Weekly Sales Team Sync", client: "Empire Sales Team", time: "10:00 AM", date: "2026-08-27", status: "Scheduled", link: "https://meet.google.com/sales-sync" }
    ];
    setMeetings(getStored("leadflow_meetings", defaultMeetings));

    // 5. Reminders
    const defaultReminders = [
      { id: "rem-1", title: "Follow up with John Doe regarding license quote", time: "12:00 PM", date: "2026-08-26", urgency: "High" },
      { id: "rem-2", title: "Send automated greetings to anniversary clients", time: "01:30 PM", date: "2026-08-26", urgency: "Medium" },
      { id: "rem-3", title: "Check overdue invoices & trigger SMS alert", time: "05:00 PM", date: "2026-08-26", urgency: "High" }
    ];
    setReminders(getStored("leadflow_reminders", defaultReminders));

    // 6. Customers
    const defaultCustomers = [
      { id: "cust-1", name: "Cyberdyne Systems", contact: "Sarah Connor", email: "sarah@cyberdyne.io", value: 65000, status: "Active" },
      { id: "cust-2", name: "Nexus Tech", contact: "Alex Rivera", email: "alex@nexus.io", value: 85000, status: "Active" },
      { id: "cust-3", name: "Acme Logistics", contact: "John Doe", email: "john@acme.com", value: 24500, status: "Active" }
    ];
    setCustomers(getStored("leadflow_customers", defaultCustomers));
  };

  P.useEffect(() => {
    loadAllData();
  }, []);

  // Compute KPI Counts & Progress Metrics
  const leadsCount = (leads || []).length || 6;
  const leadsCompleted = (leads || []).filter(l => l && (l.status === "won" || l.status === "close_by")).length || 2;
  const leadsPct = Math.round((leadsCompleted / leadsCount) * 100);

  const followupsCount = (leads || []).filter(l => l && l.nextFollowupDate).length || 5;
  const followupsCompleted = 3;
  const followupsPct = Math.round((followupsCompleted / followupsCount) * 100);

  const tasksCount = (tasks || []).length || 5;
  const tasksCompleted = (tasks || []).filter(t => t && t.completed).length || 1;
  const tasksPct = Math.round((tasksCompleted / tasksCount) * 100);

  const todosCount = (todos || []).length || 5;
  const todosCompleted = (todos || []).filter(t => t && t.completed).length || 1;
  const todosPct = Math.round((todosCompleted / todosCount) * 100);

  // Toggle Task Completion
  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    setStored("leadflow_tasks", updated);
    showToast("Task status updated!");
  };

  // Toggle Todo Completion
  const toggleTodo = (id) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    setStored("leadflow_todos", updated);
    showToast("To-Do status updated!");
  };

  // Add New Todo
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo = {
      id: "todo-" + Date.now(),
      text: newTodoText.trim(),
      priority: todoTab,
      completed: false
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    setStored("leadflow_todos", updated);
    setNewTodoText("");
    showToast("New To-Do item added!");
  };

  // Quick Lead Submission
  const handleQuickLead = (e) => {
    e.preventDefault();
    if (!quickLeadName.trim()) {
      showToast("Please enter lead name");
      return;
    }
    const val = Number(quickLeadValue) || 25000;
    const newLead = {
      _id: "lead-" + Date.now(),
      name: quickLeadName.trim(),
      company: quickLeadCompany.trim() || "Company",
      email: quickLeadEmail.trim() || "contact@client.com",
      phone: quickLeadPhone.trim() || "+1 555-0100",
      status: "new",
      priority: quickLeadPriority,
      value: val,
      score: val > 50000 ? 92 : val > 20000 ? 78 : 60,
      classification: val > 50000 ? "hot" : val > 20000 ? "warm" : "cold",
      assignedTo: "Rahul Sharma",
      altAssignedTo: "Preeti Patel",
      nextFollowupDate: "2026-08-26",
      notes: [],
      timeline: [{ type: "created", title: "Quick Lead Created", date: new Date().toLocaleString(), user: "Admin" }],
      isDeleted: false
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    setStored("leadflow_leads", updated);
    setShowQuickLeadModal(false);
    setQuickLeadName("");
    setQuickLeadCompany("");
    setQuickLeadEmail("");
    setQuickLeadPhone("");
    setQuickLeadValue("");
    showToast("Lead successfully added to CRM queue!");
  };

  // Quick WhatsApp Handler
  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!waRecipient) {
      showToast("Please enter or select a recipient phone number");
      return;
    }
    const cleanPhone = waRecipient.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(waMessage || "Hello from Empire CRM. Thank you for connecting with us!");
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    setShowWhatsAppModal(false);
    showToast("WhatsApp message initiated!");
  };

  // Quick Call Log Handler
  const handleLogCall = (e) => {
    e.preventDefault();
    showCallModal(false);
    showToast(`Call record logged with disposition: ${callOutcome.toUpperCase()}`);
    setCallLeadName("");
    setCallNotes("");
  };

  // Quick Meeting Handler
  const handleAddMeeting = (e) => {
    e.preventDefault();
    if (!meetTitle.trim()) return;
    const newM = {
      id: "meet-" + Date.now(),
      title: meetTitle.trim(),
      client: meetClient.trim() || "Client",
      date: meetDate,
      time: meetTime,
      status: "Upcoming",
      link: "https://meet.google.com/emp-" + Math.random().toString(36).substring(7)
    };
    const updated = [newM, ...meetings];
    setMeetings(updated);
    setStored("leadflow_meetings", updated);
    setShowMeetingModal(false);
    setMeetTitle("");
    setMeetClient("");
    showToast("Meeting scheduled successfully!");
  };

  // Filtered Leads by Tab
  const filteredLeads = leads.filter(l => {
    if (leadTab === "new") return l.status === "new";
    if (leadTab === "processing") return l.status === "processing" || l.status === "contacted" || l.status === "in_progress";
    if (leadTab === "close_by") return l.status === "close_by" || l.status === "proposal" || l.status === "negotiation" || l.status === "won";
    return true;
  });

  // Filtered Tasks by Tab
  const filteredTasks = tasks.filter(t => {
    if (taskTab === "today") return t.dueDate === "2026-08-26";
    if (taskTab === "tomorrow") return t.dueDate !== "2026-08-26";
    return true;
  });

  // Filtered Todos by Tab
  const filteredTodos = todos.filter(t => t.priority === todoTab);

  // Update lead status directly from row
  const changeLeadStatus = (leadId, newStatus) => {
    const updated = leads.map(l => l._id === leadId ? { ...l, status: newStatus } : l);
    setLeads(updated);
    setStored("leadflow_leads", updated);
    showToast(`Lead moved to ${newStatus.toUpperCase()}`);
  };

  return a.jsxs("div", {
    className: "dashboard-root space-y-6 pb-12 w-full max-w-none min-w-0 box-border block font-sans text-slate-900 dark:text-slate-100",
    children: [
      // Toast notification
      toastMsg && a.jsx("div", {
        className: "fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce",
        children: [
          a.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }),
          a.jsx("span", { children: toastMsg })
        ]
      }),

      // Header Bar & Period Filters
      a.jsxs("div", {
        className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm",
        children: [
          a.jsxs("div", {
            className: "space-y-1",
            children: [
              a.jsxs("div", {
                className: "flex items-center space-x-3",
                children: [
                  a.jsx("h1", {
                    className: "text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white",
                    children: "Empire CRM Dashboard"
                  }),
                  a.jsx("span", {
                    className: "px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 uppercase tracking-wider",
                    children: "Live Control Hub"
                  })
                ]
              }),
              a.jsxs("p", {
                className: "text-xs text-slate-500 dark:text-slate-400 font-medium",
                children: [
                  "Real-time pipeline monitoring, automated follow-ups, and lead conversion analytics for ",
                  a.jsx("span", { className: "text-indigo-600 dark:text-indigo-400 font-bold", children: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) })
                ]
              })
            ]
          }),

          // Action Toolbar & Period Filter
          a.jsxs("div", {
            className: "flex flex-wrap items-center gap-2.5",
            children: [
              // Period Selector Tabs
              a.jsxs("div", {
                className: "flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/70 text-xs font-bold",
                children: [
                  a.jsx("button", {
                    type: "button",
                    onClick: () => setPeriod("today"),
                    className: `px-3.5 py-1.5 rounded-xl transition ${period === "today" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`,
                    children: "Today"
                  }),
                  a.jsx("button", {
                    type: "button",
                    onClick: () => setPeriod("week"),
                    className: `px-3.5 py-1.5 rounded-xl transition ${period === "week" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`,
                    children: "This Week"
                  }),
                  a.jsx("button", {
                    type: "button",
                    onClick: () => setPeriod("month"),
                    className: `px-3.5 py-1.5 rounded-xl transition ${period === "month" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`,
                    children: "This Month"
                  })
                ]
              }),

              // Fast Action Triggers
              a.jsxs("button", {
                type: "button",
                onClick: () => setShowQuickLeadModal(true),
                className: "px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 cursor-pointer",
                children: [
                  a.jsx("span", { className: "text-base font-bold leading-none", children: "+" }),
                  a.jsx("span", { children: "Add Lead" })
                ]
              }),
              a.jsxs("button", {
                type: "button",
                onClick: () => setShowWhatsAppModal(true),
                className: "px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer",
                children: [
                  a.jsx("span", { children: "💬" }),
                  a.jsx("span", { children: "WhatsApp" })
                ]
              }),
              a.jsxs("button", {
                type: "button",
                onClick: () => setShowCallModal(true),
                className: "px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer",
                children: [
                  a.jsx("span", { children: "📞" }),
                  a.jsx("span", { children: "Log Call" })
                ]
              })
            ]
          })
        ]
      }),

      // ==========================================
      // SECTION 1: 4-KPI SUMMARY COUNTER ROW (365 CRM Style)
      // ==========================================
      a.jsxs("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full",
        children: [
          // 1. Today's Leads (todaylead)
          a.jsxs("div", {
            className: "p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition space-y-3 relative overflow-hidden group",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  a.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      a.jsx("p", { className: "text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: "Today's Leads" }),
                      a.jsx("h3", { className: "text-3xl font-black text-slate-900 dark:text-white tracking-tight", children: leadsCount })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform",
                    children: "⚡"
                  })
                ]
              }),
              a.jsxs("div", {
                className: "space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center justify-between text-[11px] font-bold",
                    children: [
                      a.jsx("span", { className: "text-emerald-600 dark:text-emerald-400", children: `${leadsPct}% Completed Lead` }),
                      a.jsx("span", { className: "text-slate-400", children: `${leadsCompleted}/${leadsCount} Closed` })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden",
                    children: a.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500", style: { width: `${leadsPct}%` } })
                  })
                ]
              })
            ]
          }),

          // 2. Today's Followups (todayfollowup)
          a.jsxs("div", {
            className: "p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition space-y-3 relative overflow-hidden group",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  a.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      a.jsx("p", { className: "text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: "Today's Followups" }),
                      a.jsx("h3", { className: "text-3xl font-black text-slate-900 dark:text-white tracking-tight", children: followupsCount })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform",
                    children: "🎯"
                  })
                ]
              }),
              a.jsxs("div", {
                className: "space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center justify-between text-[11px] font-bold",
                    children: [
                      a.jsx("span", { className: "text-rose-600 dark:text-rose-400", children: `${followupsPct}% Completed Followup` }),
                      a.jsx("span", { className: "text-slate-400", children: `${followupsCompleted}/${followupsCount} Contacted` })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden",
                    children: a.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500", style: { width: `${followupsPct}%` } })
                  })
                ]
              })
            ]
          }),

          // 3. Today's Tasks (todaytask)
          a.jsxs("div", {
            className: "p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition space-y-3 relative overflow-hidden group",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  a.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      a.jsx("p", { className: "text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: "Today's Tasks" }),
                      a.jsx("h3", { className: "text-3xl font-black text-slate-900 dark:text-white tracking-tight", children: tasksCount })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform",
                    children: "📋"
                  })
                ]
              }),
              a.jsxs("div", {
                className: "space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center justify-between text-[11px] font-bold",
                    children: [
                      a.jsx("span", { className: "text-amber-600 dark:text-amber-400", children: `${tasksPct}% Completed Task` }),
                      a.jsx("span", { className: "text-slate-400", children: `${tasksCompleted}/${tasksCount} Done` })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden",
                    children: a.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500", style: { width: `${tasksPct}%` } })
                  })
                ]
              })
            ]
          }),

          // 4. Today's To-Dos (todaytodo)
          a.jsxs("div", {
            className: "p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition space-y-3 relative overflow-hidden group",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  a.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      a.jsx("p", { className: "text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: "Today's To-Dos" }),
                      a.jsx("h3", { className: "text-3xl font-black text-slate-900 dark:text-white tracking-tight", children: todosCount })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform",
                    children: "✅"
                  })
                ]
              }),
              a.jsxs("div", {
                className: "space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center justify-between text-[11px] font-bold",
                    children: [
                      a.jsx("span", { className: "text-cyan-600 dark:text-cyan-400", children: `${todosPct}% Completed Todo` }),
                      a.jsx("span", { className: "text-slate-400", children: `${todosCompleted}/${todosCount} Finished` })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden",
                    children: a.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500", style: { width: `${todosPct}%` } })
                  })
                ]
              })
            ]
          })
        ]
      }),

      // ==========================================
      // SECTION 2: LEADS QUEUE & TASK EXECUTION (2-Col Layout)
      // ==========================================
      a.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-12 gap-6 w-full",
        children: [
          // Left Column: Interactive Leads Management Panel (7 Cols)
          a.jsxs("div", {
            className: "lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4",
            children: [
              // Lead Tabs Header
              a.jsxs("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center space-x-2",
                    children: [
                      a.jsx("span", { className: "text-lg", children: "🔥" }),
                      a.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white tracking-wide", children: "Lead Pipeline Flow" })
                    ]
                  }),
                  // Leads Tabs: New | Processing | Close-by
                  a.jsxs("div", {
                    className: "flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-extrabold",
                    children: [
                      a.jsx("button", {
                        type: "button",
                        onClick: () => setLeadTab("new"),
                        className: `px-3 py-1 rounded-lg transition ${leadTab === "new" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`,
                        children: "New Leads"
                      }),
                      a.jsx("button", {
                        type: "button",
                        onClick: () => setLeadTab("processing"),
                        className: `px-3 py-1 rounded-lg transition ${leadTab === "processing" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`,
                        children: "Processing"
                      }),
                      a.jsx("button", {
                        type: "button",
                        onClick: () => setLeadTab("close_by"),
                        className: `px-3 py-1 rounded-lg transition ${leadTab === "close_by" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`,
                        children: "Close-by"
                      })
                    ]
                  })
                ]
              }),

              // Leads Table / Card List
              a.jsx("div", {
                className: "space-y-3 overflow-x-auto",
                children: (filteredLeads || []).length === 0 ? a.jsx("div", {
                  className: "py-10 text-center text-xs text-slate-400 font-medium",
                  children: "No active leads in this stage."
                }) : filteredLeads.map(l => a.jsxs("div", {
                  key: l._id,
                  className: "p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  children: [
                    a.jsxs("div", {
                      className: "space-y-1 min-w-0",
                      children: [
                        a.jsxs("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            a.jsx("h4", { className: "text-xs font-black text-slate-900 dark:text-white truncate", children: l.name }),
                            // Score / Classification Badge
                            a.jsx("span", {
                              className: `px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${l.classification === "hot" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30" : l.classification === "warm" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"}`,
                              children: `${l.classification || "hot"} (${l.score || 85})`
                            }),
                            a.jsx("span", { className: "text-[10px] font-bold text-slate-400", children: `• ${l.source || "website"}` })
                          ]
                        }),
                        a.jsxs("p", {
                          className: "text-[11px] text-slate-500 dark:text-slate-400 font-medium",
                          children: [l.company, " • Assigned to: ", a.jsx("span", { className: "font-semibold text-slate-700 dark:text-slate-300", children: l.assignedTo })]
                        })
                      ]
                    }),

                    // Right: Value & Quick Actions
                    a.jsxs("div", {
                      className: "flex items-center space-x-2 shrink-0 self-end sm:self-center",
                      children: [
                        a.jsx("span", {
                          className: "text-xs font-black text-indigo-600 dark:text-indigo-400 mr-1",
                          children: W(l.value || 25000)
                        }),
                        // WhatsApp Trigger
                        a.jsx("button", {
                          type: "button",
                          onClick: () => {
                            setWaRecipient(l.phone || "+1 555-0100");
                            setWaMessage(`Hello ${l.name}, following up from Empire CRM regarding ${l.company}.`);
                            setShowWhatsAppModal(true);
                          },
                          className: "p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition cursor-pointer text-xs",
                          title: "Quick WhatsApp",
                          children: "💬"
                        }),
                        // Call Trigger
                        a.jsx("button", {
                          type: "button",
                          onClick: () => {
                            setCallLeadName(`${l.name} (${l.company})`);
                            setShowCallModal(true);
                          },
                          className: "p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition cursor-pointer text-xs",
                          title: "Log Call",
                          children: "📞"
                        }),
                        // Move stage selector
                        a.jsxs("select", {
                          value: l.status,
                          onChange: (e) => changeLeadStatus(l._id, e.target.value),
                          className: "px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer",
                          children: [
                            a.jsx("option", { value: "new", children: "New" }),
                            a.jsx("option", { value: "processing", children: "Processing" }),
                            a.jsx("option", { value: "close_by", children: "Close-by" }),
                            a.jsx("option", { value: "won", children: "Won" })
                          ]
                        })
                      ]
                    })
                  ]
                }))
              })
            ]
          }),

          // Right Column: Task Management & Schedule Panel (5 Cols)
          a.jsxs("div", {
            className: "lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4",
            children: [
              // Tasks Tabs Header: Today | Tomorrow
              a.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center space-x-2",
                    children: [
                      a.jsx("span", { className: "text-lg", children: "⚡" }),
                      a.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white tracking-wide", children: "Task Execution" })
                    ]
                  }),
                  a.jsxs("div", {
                    className: "flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-extrabold",
                    children: [
                      a.jsx("button", {
                        type: "button",
                        onClick: () => setTaskTab("today"),
                        className: `px-3 py-1 rounded-lg transition ${taskTab === "today" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`,
                        children: "Today"
                      }),
                      a.jsx("button", {
                        type: "button",
                        onClick: () => setTaskTab("tomorrow"),
                        className: `px-3 py-1 rounded-lg transition ${taskTab === "tomorrow" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`,
                        children: "Tomorrow"
                      })
                    ]
                  })
                ]
              }),

              // Task List with Real Toggle
              a.jsx("div", {
                className: "space-y-2.5",
                children: filteredTasks.map(t => a.jsxs("div", {
                  key: t.id,
                  onClick: () => toggleTask(t.id),
                  className: `p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${t.completed ? "bg-slate-100/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60 line-through" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/40"}`,
                  children: [
                    a.jsxs("div", {
                      className: "flex items-center space-x-3 min-w-0",
                      children: [
                        a.jsx("input", {
                          type: "checkbox",
                          checked: t.completed,
                          onChange: () => {},
                          className: "w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        }),
                        a.jsxs("div", {
                          className: "min-w-0",
                          children: [
                            a.jsx("p", { className: "text-xs font-bold text-slate-800 dark:text-slate-200 truncate", children: t.title }),
                            a.jsxs("span", { className: "text-[10px] text-slate-400 font-semibold", children: [`Due: ${t.dueDate}`, " • ", t.assignedTo] })
                          ]
                        })
                      ]
                    }),
                    a.jsx("span", {
                      className: `px-2 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0 ${t.priority === "high" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`,
                      children: t.priority
                    })
                  ]
                }))
              })
            ]
          })
        ]
      }),

      // ==========================================
      // SECTION 3: SCHEDULE, TO-DOS, AND STAFF / HR ACTIVITY (3-Col Grid)
      // ==========================================
      a.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-6 w-full",
        children: [
          // Col 1: Schedule Panel (Reminder | Meeting | Events)
          a.jsxs("div", {
            className: "bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center space-x-2",
                    children: [
                      a.jsx("span", { className: "text-base", children: "📅" }),
                      a.jsx("h3", { className: "text-sm font-black text-slate-900 dark:text-white", children: "Schedule Hub" })
                    ]
                  }),
                  a.jsxs("div", {
                    className: "flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold",
                    children: [
                      a.jsx("button", { type: "button", onClick: () => setScheduleTab("meeting"), className: `px-2 py-0.5 rounded-lg transition ${scheduleTab === "meeting" ? "bg-indigo-600 text-white" : "text-slate-500"}` , children: "Meeting" }),
                      a.jsx("button", { type: "button", onClick: () => setScheduleTab("reminder"), className: `px-2 py-0.5 rounded-lg transition ${scheduleTab === "reminder" ? "bg-indigo-600 text-white" : "text-slate-500"}`, children: "Reminder" }),
                      a.jsx("button", { type: "button", onClick: () => setScheduleTab("events"), className: `px-2 py-0.5 rounded-lg transition ${scheduleTab === "events" ? "bg-indigo-600 text-white" : "text-slate-500"}`, children: "Events" })
                    ]
                  })
                ]
              }),

              // Schedule Items
              a.jsx("div", {
                className: "space-y-2",
                children: scheduleTab === "meeting" ? meetings.map(m => a.jsxs("div", {
                  key: m.id,
                  className: "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs",
                  children: [
                    a.jsxs("div", {
                      className: "min-w-0",
                      children: [
                        a.jsx("h5", { className: "font-bold text-slate-800 dark:text-slate-200 truncate", children: m.title }),
                        a.jsxs("p", { className: "text-[10px] text-slate-400 font-medium", children: [m.client, " • ", m.time] })
                      ]
                    }),
                    a.jsx("a", {
                      href: m.link,
                      target: "_blank",
                      rel: "noreferrer",
                      className: "px-2 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] shrink-0",
                      children: "Join"
                    })
                  ]
                })) : reminders.map(r => a.jsxs("div", {
                  key: r.id,
                  className: "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs",
                  children: [
                    a.jsxs("div", {
                      className: "min-w-0",
                      children: [
                        a.jsx("h5", { className: "font-bold text-slate-800 dark:text-slate-200 truncate", children: r.title }),
                        a.jsx("p", { className: "text-[10px] text-slate-400 font-medium", children: r.time })
                      ]
                    }),
                    a.jsx("span", { className: "px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400", children: r.urgency })
                  ]
                }))
              }),

              // Quick Add Meeting Trigger
              a.jsxs("button", {
                type: "button",
                onClick: () => setShowMeetingModal(true),
                className: "w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center space-x-1",
                children: [
                  a.jsx("span", { children: "+" }),
                  a.jsx("span", { children: "Schedule Meeting" })
                ]
              })
            ]
          }),

          // Col 2: To-Dos Panel (High | Medium | Low)
          a.jsxs("div", {
            className: "bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center space-x-2",
                    children: [
                      a.jsx("span", { className: "text-base", children: "📝" }),
                      a.jsx("h3", { className: "text-sm font-black text-slate-900 dark:text-white", children: "Quick To-Dos" })
                    ]
                  }),
                  a.jsxs("div", {
                    className: "flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold",
                    children: [
                      a.jsx("button", { type: "button", onClick: () => setTodoTab("high"), className: `px-2 py-0.5 rounded-lg transition ${todoTab === "high" ? "bg-rose-600 text-white" : "text-slate-500"}`, children: "High" }),
                      a.jsx("button", { type: "button", onClick: () => setTodoTab("medium"), className: `px-2 py-0.5 rounded-lg transition ${todoTab === "medium" ? "bg-amber-600 text-white" : "text-slate-500"}`, children: "Med" }),
                      a.jsx("button", { type: "button", onClick: () => setTodoTab("low"), className: `px-2 py-0.5 rounded-lg transition ${todoTab === "low" ? "bg-blue-600 text-white" : "text-slate-500"}`, children: "Low" })
                    ]
                  })
                ]
              }),

              // Add Todo Input
              a.jsxs("form", {
                onSubmit: handleAddTodo,
                className: "flex items-center gap-2",
                children: [
                  a.jsx("input", {
                    type: "text",
                    placeholder: "+ Add quick todo item...",
                    value: newTodoText,
                    onChange: (e) => setNewTodoText(e.target.value),
                    className: "flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                  }),
                  a.jsx("button", {
                    type: "submit",
                    className: "px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm",
                    children: "Add"
                  })
                ]
              }),

              // Todo Items List
              a.jsx("div", {
                className: "space-y-2 max-h-48 overflow-y-auto",
                children: filteredTodos.map(td => a.jsxs("div", {
                  key: td.id,
                  onClick: () => toggleTodo(td.id),
                  className: `p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs cursor-pointer transition ${td.completed ? "bg-slate-100/50 dark:bg-slate-800/30 line-through opacity-60 border-slate-200 dark:border-slate-800" : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60"}`,
                  children: [
                    a.jsxs("div", {
                      className: "flex items-center space-x-2 min-w-0",
                      children: [
                        a.jsx("input", { type: "checkbox", checked: td.completed, onChange: () => {}, className: "w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer" }),
                        a.jsx("span", { className: "font-semibold text-slate-800 dark:text-slate-200 truncate", children: td.text })
                      ]
                    }),
                    a.jsx("span", { className: "text-[9px] font-black uppercase text-slate-400", children: td.priority })
                  ]
                }))
              })
            ]
          }),

          // Col 3: Staff & HR Pulse (Leave | Interviews | Shift)
          a.jsxs("div", {
            className: "bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center space-x-2",
                    children: [
                      a.jsx("span", { className: "text-base", children: "👥" }),
                      a.jsx("h3", { className: "text-sm font-black text-slate-900 dark:text-white", children: "Staff & HR Pulse" })
                    ]
                  }),
                  a.jsxs("div", {
                    className: "flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold",
                    children: [
                      a.jsx("button", { type: "button", onClick: () => setHrTab("leave"), className: `px-2 py-0.5 rounded-lg transition ${hrTab === "leave" ? "bg-indigo-600 text-white" : "text-slate-500"}`, children: "Leave" }),
                      a.jsx("button", { type: "button", onClick: () => setHrTab("interview"), className: `px-2 py-0.5 rounded-lg transition ${hrTab === "interview" ? "bg-indigo-600 text-white" : "text-slate-500"}`, children: "Hiring" }),
                      a.jsx("button", { type: "button", onClick: () => setHrTab("shift"), className: `px-2 py-0.5 rounded-lg transition ${hrTab === "shift" ? "bg-indigo-600 text-white" : "text-slate-500"}`, children: "Shifts" })
                    ]
                  })
                ]
              }),

              // HR Dynamic List
              a.jsx("div", {
                className: "space-y-2",
                children: hrTab === "leave" ? [
                  { name: "Amit Verma", dept: "Operations", reason: "Annual Leave", status: "Approved" },
                  { name: "Kavita Rao", dept: "Customer Support", reason: "Half Day", status: "Pending" }
                ].map((l, idx) => a.jsxs("div", {
                  key: idx,
                  className: "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs",
                  children: [
                    a.jsxs("div", {
                      children: [
                        a.jsx("p", { className: "font-bold text-slate-800 dark:text-slate-200", children: l.name }),
                        a.jsxs("span", { className: "text-[10px] text-slate-400 font-medium", children: [l.dept, " • ", l.reason] })
                      ]
                    }),
                    a.jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-extrabold ${l.status === "Approved" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`, children: l.status })
                  ]
                })) : [
                  { name: "Rohit Deshmukh", role: "Senior Sales Exec", time: "02:00 PM", stage: "Round 2 Tech" },
                  { name: "Pooja Hegde", role: "CRM Developer", time: "04:30 PM", stage: "HR Round" }
                ].map((i, idx) => a.jsxs("div", {
                  key: idx,
                  className: "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs",
                  children: [
                    a.jsxs("div", {
                      children: [
                        a.jsx("p", { className: "font-bold text-slate-800 dark:text-slate-200", children: i.name }),
                        a.jsxs("span", { className: "text-[10px] text-slate-400 font-medium", children: [i.role, " • ", i.time] })
                      ]
                    }),
                    a.jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400", children: i.stage })
                  ]
                }))
              })
            ]
          })
        ]
      }),

      // ==========================================
      // SECTION 4: REVENUE & PIPELINE CONVERSION ANALYTICS
      // ==========================================
      a.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-12 gap-6 w-full",
        children: [
          // Left: Pipeline Funnel Conversion Rates (6 Cols)
          a.jsxs("div", {
            className: "lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center space-x-2",
                    children: [
                      a.jsx("span", { className: "text-lg", children: "📊" }),
                      a.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Sales Conversion Funnel" })
                    ]
                  }),
                  a.jsx("span", { className: "text-xs font-bold text-emerald-600 dark:text-emerald-400", children: "68.2% Win Rate" })
                ]
              }),
              // Funnel Bars
              a.jsx("div", {
                className: "space-y-3",
                children: [
                  { stage: "Total Inquiries / Leads Ingested", count: 520, rate: "100%", color: "from-blue-600 to-indigo-600" },
                  { stage: "Contacted & Qualified by SDRs", count: 340, rate: "65.4%", color: "from-indigo-600 to-purple-600" },
                  { stage: "Demo & Commercial Proposal Sent", count: 210, rate: "61.7%", color: "from-purple-600 to-pink-600" },
                  { stage: "Under Final Negotiation", count: 135, rate: "64.2%", color: "from-pink-600 to-rose-600" },
                  { stage: "Closed & Won Contracts", count: 92, rate: "68.1%", color: "from-emerald-500 to-teal-500" }
                ].map((f, idx) => a.jsxs("div", {
                  key: idx,
                  className: "space-y-1",
                  children: [
                    a.jsxs("div", {
                      className: "flex items-center justify-between text-xs font-bold",
                      children: [
                        a.jsx("span", { className: "text-slate-700 dark:text-slate-300", children: f.stage }),
                        a.jsxs("span", { className: "text-slate-900 dark:text-white font-extrabold", children: [`${f.count} leads`, " (", f.rate, ")"] })
                      ]
                    }),
                    a.jsx("div", {
                      className: "w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden",
                      children: a.jsx("div", {
                        className: `h-full rounded-full bg-gradient-to-r ${f.color} transition-all duration-500`,
                        style: { width: f.rate }
                      })
                    })
                  ]
                }))
              })
            ]
          }),

          // Right: Target Tracker & Team Leaderboard (6 Cols)
          a.jsxs("div", {
            className: "lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4",
            children: [
              a.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center space-x-2",
                    children: [
                      a.jsx("span", { className: "text-lg", children: "🏆" }),
                      a.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Monthly Sales Target & Leaders" })
                    ]
                  }),
                  a.jsx("span", { className: "px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", children: "Target: $250,000" })
                ]
              }),

              // Team Target Progress
              a.jsxs("div", {
                className: "p-4 rounded-2xl bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/30 space-y-2",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center justify-between text-xs font-bold text-white",
                    children: [
                      a.jsx("span", { children: "Total Revenue Achieved" }),
                      a.jsx("span", { className: "text-indigo-400 font-extrabold text-sm", children: "$194,500 / $250,000 (77.8%)" })
                    ]
                  }),
                  a.jsx("div", {
                    className: "w-full h-3 rounded-full bg-slate-800 overflow-hidden",
                    children: a.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 transition-all duration-700", style: { width: "77.8%" } })
                  })
                ]
              }),

              // Top Reps
              a.jsx("div", {
                className: "space-y-2",
                children: [
                  { name: "Rahul Sharma", role: "Senior Sales Lead", closed: "$88,500", target: "$100,000", pct: "88.5%", badge: "🥇 Top Closer" },
                  { name: "Preeti Patel", role: "Store Manager", closed: "$64,000", target: "$80,000", pct: "80.0%", badge: "🥈 Deal Maker" },
                  { name: "Sarah Miller", role: "Support Lead", closed: "$42,000", target: "$50,000", pct: "84.0%", badge: "🥉 Upsell Champ" }
                ].map((rep, idx) => a.jsxs("div", {
                  key: idx,
                  className: "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs",
                  children: [
                    a.jsxs("div", {
                      children: [
                        a.jsxs("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            a.jsx("h5", { className: "font-bold text-slate-900 dark:text-white", children: rep.name }),
                            a.jsx("span", { className: "text-[10px] font-extrabold text-indigo-500", children: rep.badge })
                          ]
                        }),
                        a.jsxs("p", { className: "text-[10px] text-slate-400 font-medium", children: [rep.role, " • Target: ", rep.target] })
                      ]
                    }),
                    a.jsxs("div", {
                      className: "text-right",
                      children: [
                        a.jsx("p", { className: "font-black text-slate-900 dark:text-white text-xs", children: rep.closed }),
                        a.jsx("span", { className: "text-[10px] font-bold text-emerald-500", children: rep.pct })
                      ]
                    })
                  ]
                }))
              })
            ]
          })
        ]
      }),

      // ==========================================
      // QUICK ACTION MODALS
      // ==========================================

      // 1. Quick Lead Modal
      a.jsx(Ie, {
        isOpen: showQuickLeadModal,
        onClose: () => setShowQuickLeadModal(false),
        title: "⚡ Quick Lead Capture",
        children: a.jsxs("form", {
          onSubmit: handleQuickLead,
          className: "space-y-4 text-xs font-semibold",
          children: [
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Full Name *" }),
                a.jsx("input", {
                  type: "text",
                  required: true,
                  placeholder: "e.g. David Hassel",
                  value: quickLeadName,
                  onChange: (e) => setQuickLeadName(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                })
              ]
            }),
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Company Name" }),
                a.jsx("input", {
                  type: "text",
                  placeholder: "e.g. Apex Global Ltd",
                  value: quickLeadCompany,
                  onChange: (e) => setQuickLeadCompany(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                })
              ]
            }),
            a.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                a.jsxs("div", {
                  children: [
                    a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Email Address" }),
                    a.jsx("input", {
                      type: "email",
                      placeholder: "lead@apex.com",
                      value: quickLeadEmail,
                      onChange: (e) => setQuickLeadEmail(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                a.jsxs("div", {
                  children: [
                    a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Phone / WhatsApp" }),
                    a.jsx("input", {
                      type: "text",
                      placeholder: "+91 98765 43210",
                      value: quickLeadPhone,
                      onChange: (e) => setQuickLeadPhone(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                })
              ]
            }),
            a.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                a.jsxs("div", {
                  children: [
                    a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Estimated Deal Value ($)" }),
                    a.jsx("input", {
                      type: "number",
                      placeholder: "35000",
                      value: quickLeadValue,
                      onChange: (e) => setQuickLeadValue(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                a.jsxs("div", {
                  children: [
                    a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Priority" }),
                    a.jsxs("select", {
                      value: quickLeadPriority,
                      onChange: (e) => setQuickLeadPriority(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold",
                      children: [
                        a.jsx("option", { value: "high", children: "High (Hot)" }),
                        a.jsx("option", { value: "medium", children: "Medium (Warm)" }),
                        a.jsx("option", { value: "low", children: "Low (Cold)" })
                      ]
                    })
                  ]
                })
              ]
            }),
            a.jsxs("div", {
              className: "flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                a.jsx("button", {
                  type: "button",
                  onClick: () => setShowQuickLeadModal(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                a.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md",
                  children: "Create Lead"
                })
              ]
            })
          ]
        })
      }),

      // 2. Quick WhatsApp Modal
      a.jsx(Ie, {
        isOpen: showWhatsAppModal,
        onClose: () => setShowWhatsAppModal(false),
        title: "💬 Instant WhatsApp Message",
        children: a.jsxs("form", {
          onSubmit: handleSendWhatsApp,
          className: "space-y-4 text-xs font-semibold",
          children: [
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Recipient Mobile Number *" }),
                a.jsx("input", {
                  type: "text",
                  required: true,
                  placeholder: "+91 99132 99865 or 919913299865",
                  value: waRecipient,
                  onChange: (e) => setWaRecipient(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Message Template" }),
                a.jsxs("select", {
                  value: waTemplate,
                  onChange: (e) => {
                    setWaTemplate(e.target.value);
                    if (e.target.value === "welcome") setWaMessage("Welcome to Empire CRM! We are thrilled to partner with you to accelerate your enterprise sales pipelines.");
                    if (e.target.value === "followup") setWaMessage("Hi, following up on our recent CRM demonstration. Would you have 10 minutes tomorrow for a quick discussion?");
                    if (e.target.value === "meeting") setWaMessage("Your meeting with Empire CRM team is confirmed. Meeting link: https://meet.google.com/crm-demo");
                  },
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold",
                  children: [
                    a.jsx("option", { value: "welcome", children: "Welcome & Introduction" }),
                    a.jsx("option", { value: "followup", children: "Commercial Follow-Up" }),
                    a.jsx("option", { value: "meeting", children: "Meeting Confirmation" })
                  ]
                })
              ]
            }),
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Message Preview" }),
                a.jsx("textarea", {
                  rows: 4,
                  value: waMessage,
                  onChange: (e) => setWaMessage(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            a.jsxs("div", {
              className: "flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                a.jsx("button", {
                  type: "button",
                  onClick: () => setShowWhatsAppModal(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                a.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md",
                  children: "Send WhatsApp"
                })
              ]
            })
          ]
        })
      }),

      // 3. Quick Call Modal
      a.jsx(Ie, {
        isOpen: showCallModal,
        onClose: () => setShowCallModal(false),
        title: "📞 Log Voice Call",
        children: a.jsxs("form", {
          onSubmit: handleLogCall,
          className: "space-y-4 text-xs font-semibold",
          children: [
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Contact / Lead Name" }),
                a.jsx("input", {
                  type: "text",
                  placeholder: "e.g. Sarah Connor",
                  value: callLeadName,
                  onChange: (e) => setCallLeadName(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Call Disposition" }),
                a.jsxs("select", {
                  value: callOutcome,
                  onChange: (e) => setCallOutcome(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold",
                  children: [
                    a.jsx("option", { value: "connected", children: "Connected & Discussed" }),
                    a.jsx("option", { value: "busy", children: "Busy / Line Engaged" }),
                    a.jsx("option", { value: "no_answer", children: "No Answer" }),
                    a.jsx("option", { value: "callback", children: "Callback Requested" })
                  ]
                })
              ]
            }),
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Call Notes / Summary" }),
                a.jsx("textarea", {
                  rows: 3,
                  placeholder: "Key points discussed during the call...",
                  value: callNotes,
                  onChange: (e) => setCallNotes(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            a.jsxs("div", {
              className: "flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                a.jsx("button", {
                  type: "button",
                  onClick: () => setShowCallModal(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                a.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md",
                  children: "Save Call Log"
                })
              ]
            })
          ]
        })
      }),

      // 4. Quick Meeting Modal
      a.jsx(Ie, {
        isOpen: showMeetingModal,
        onClose: () => setShowMeetingModal(false),
        title: "📅 Instant Meeting Scheduler",
        children: a.jsxs("form", {
          onSubmit: handleAddMeeting,
          className: "space-y-4 text-xs font-semibold",
          children: [
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Meeting Title *" }),
                a.jsx("input", {
                  type: "text",
                  required: true,
                  placeholder: "e.g. Commercial SLA Review",
                  value: meetTitle,
                  onChange: (e) => setMeetTitle(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            a.jsxs("div", {
              children: [
                a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Participant / Lead Name" }),
                a.jsx("input", {
                  type: "text",
                  placeholder: "e.g. Sarah Connor (Cyberdyne)",
                  value: meetClient,
                  onChange: (e) => setMeetClient(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            a.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                a.jsxs("div", {
                  children: [
                    a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Date" }),
                    a.jsx("input", {
                      type: "date",
                      value: meetDate,
                      onChange: (e) => setMeetDate(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                a.jsxs("div", {
                  children: [
                    a.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Time" }),
                    a.jsx("input", {
                      type: "time",
                      value: meetTime,
                      onChange: (e) => setMeetTime(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                })
              ]
            }),
            a.jsxs("div", {
              className: "flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800",
              children: [
                a.jsx("button", {
                  type: "button",
                  onClick: () => setShowMeetingModal(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                a.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md",
                  children: "Schedule Meeting"
                })
              ]
            })
          ]
        })
      })
    ]
  });
}

export { Dashboard as default };
