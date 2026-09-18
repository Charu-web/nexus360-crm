import { j as e, r as s } from "./index-Ftt5f73P.js";
import { f as formatCurr } from "./formatCurrency-ChTmm5Hb.js";

const initialTransactions = [
  { id: "tx-101", date: "2026-08-20", category: "Sales Revenue", description: "Enterprise CRM Subscription - Acme Corp", type: "Income", amount: 45000, status: "Cleared" },
  { id: "tx-102", date: "2026-08-18", category: "Cloud Hosting", description: "AWS Infra & Serverless Compute", type: "Expense", amount: 12400, status: "Cleared" },
  { id: "tx-103", date: "2026-08-15", category: "Consulting", description: "SaaS Pipeline Automation Service", type: "Income", amount: 65000, status: "Cleared" },
  { id: "tx-104", date: "2026-08-10", category: "Software Licenses", description: "Twilio & WhatsApp API Gateway", type: "Expense", amount: 8500, status: "Cleared" },
  { id: "tx-105", date: "2026-08-05", category: "Sales Revenue", description: "Pro Business Setup - Cyberdyne", type: "Income", amount: 32800, status: "Pending" }
];

export default function AccountingPage() {
  const [transactions, setTransactions] = s.useState(() => {
    const saved = localStorage.getItem("leadflow_accounting");
    return saved ? JSON.parse(saved) : initialTransactions;
  });
  const [search, setSearch] = s.useState("");
  const [filterType, setFilterType] = s.useState("All");
  const [isModalOpen, setIsModalOpen] = s.useState(false);
  const [newTx, setNewTx] = s.useState({ category: "Sales Revenue", description: "", type: "Income", amount: "", status: "Cleared" });

  const saveTransactions = (updated) => {
    setTransactions(updated);
    localStorage.setItem("leadflow_accounting", JSON.stringify(updated));
  };

  const handleAddTransaction = (ev) => {
    ev.preventDefault();
    if (!newTx.description || !newTx.amount) return;
    const record = {
      id: "tx-" + Math.floor(Math.random() * 900 + 100),
      date: new Date().toISOString().split("T")[0],
      category: newTx.category,
      description: newTx.description,
      type: newTx.type,
      amount: parseFloat(newTx.amount),
      status: newTx.status
    };
    const updated = [record, ...transactions];
    saveTransactions(updated);
    setIsModalOpen(false);
    setNewTx({ category: "Sales Revenue", description: "", type: "Income", amount: "", status: "Cleared" });
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactions(updated);
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactions.filter(t => t.type === "Income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "Expense").reduce((acc, t) => acc + t.amount, 0);
  const netMargin = totalIncome - totalExpense;

  return e.jsxs("div", {
    className: "space-y-6 text-slate-900 dark:text-white font-semibold text-xs",
    children: [
      // Page Header
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", { className: "flex items-center space-x-2", children: [e.jsx("h1", { className: "text-xl font-black text-slate-900 dark:text-white", children: "Business Accounting" }), e.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20", children: `${transactions.length} Ledger Entries` })] }),
              e.jsx("p", { className: "text-xs text-slate-500 font-medium mt-0.5", children: "Financial ledgers, enterprise deal revenue statements, operational expenses, and margin tracking." })
            ]
          }),
          e.jsx("button", {
            type: "button",
            onClick: () => setIsModalOpen(true),
            className: "px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto",
            children: "+ Record Transaction"
          })
        ]
      }),

      // KPI Summary Cards Grid
      e.jsxs("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        children: [
          e.jsxs("div", {
            className: "p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-md flex justify-between items-start",
            children: [
              e.jsxs("div", { children: [e.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Total Revenue (Income)" }), e.jsx("p", { className: "text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400", children: formatCurr(totalIncome) }), e.jsx("p", { className: "text-[10px] text-emerald-500 font-bold mt-1", children: "Gross Inflow Ledger" })] }),
              e.jsx("span", { className: "p-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-base", children: "📈" })
            ]
          }),
          e.jsxs("div", {
            className: "p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-md flex justify-between items-start",
            children: [
              e.jsxs("div", { children: [e.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Operational Expenses" }), e.jsx("p", { className: "text-2xl font-black mt-1 text-rose-600 dark:text-rose-400", children: formatCurr(totalExpense) }), e.jsx("p", { className: "text-[10px] text-rose-500 font-bold mt-1", children: "Gross Outflow Expenses" })] }),
              e.jsx("span", { className: "p-2 rounded-xl bg-rose-500/10 text-rose-500 text-base", children: "📉" })
            ]
          }),
          e.jsxs("div", {
            className: "p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-md flex justify-between items-start",
            children: [
              e.jsxs("div", { children: [e.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Net Margin Balance" }), e.jsx("p", { className: "text-2xl font-black mt-1 text-indigo-600 dark:text-indigo-400", children: formatCurr(netMargin) }), e.jsx("p", { className: "text-[10px] text-indigo-500 font-bold mt-1", children: "Net Profit Balance" })] }),
              e.jsx("span", { className: "p-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-base", children: "💼" })
            ]
          }),
          e.jsxs("div", {
            className: "p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-md flex justify-between items-start",
            children: [
              e.jsxs("div", { children: [e.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Outstanding Receivables" }), e.jsx("p", { className: "text-2xl font-black mt-1 text-amber-500", children: formatCurr(18500) }), e.jsx("p", { className: "text-[10px] text-amber-500 font-bold mt-1", children: "Pending Invoice Inflow" })] }),
              e.jsx("span", { className: "p-2 rounded-xl bg-amber-500/10 text-amber-500 text-base", children: "⏳" })
            ]
          })
        ]
      }),

      // Search & Filter Toolbar
      e.jsxs("div", {
        className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4",
        children: [
          e.jsx("input", {
            type: "text",
            value: search,
            onChange: (ev) => setSearch(ev.target.value),
            placeholder: "Search ledger description or category...",
            className: "w-full sm:w-80 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-xs"
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-2",
            children: [
              ["All", "Income", "Expense"].map(type => e.jsx("button", {
                key: type,
                type: "button",
                onClick: () => setFilterType(type),
                className: `px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${filterType === type ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white"}`,
                children: type
              }))
            ]
          })
        ]
      }),

      // Data Table
      e.jsx("div", {
        className: "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90",
        children: e.jsxs("table", {
          className: "w-full text-left border-collapse",
          children: [
            e.jsx("thead", {
              className: "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800",
              children: e.jsxs("tr", {
                children: [
                  e.jsx("th", { className: "p-3.5", children: "Date" }),
                  e.jsx("th", { className: "p-3.5", children: "Category" }),
                  e.jsx("th", { className: "p-3.5", children: "Description" }),
                  e.jsx("th", { className: "p-3.5", children: "Type" }),
                  e.jsx("th", { className: "p-3.5", children: "Amount" }),
                  e.jsx("th", { className: "p-3.5", children: "Status" }),
                  e.jsx("th", { className: "p-3.5 text-right", children: "Action" })
                ]
              })
            }),
            e.jsx("tbody", {
              className: "divide-y divide-slate-200 dark:divide-slate-800/80 text-xs font-semibold",
              children: filtered.map(t => e.jsxs("tr", {
                className: "hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition",
                children: [
                  e.jsx("td", { className: "p-3.5 text-slate-500 font-mono text-[11px]", children: t.date }),
                  e.jsx("td", { className: "p-3.5 font-bold text-slate-900 dark:text-white", children: t.category }),
                  e.jsx("td", { className: "p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate", children: t.description }),
                  e.jsx("td", { className: "p-3.5", children: e.jsx("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${t.type === "Income" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"}`, children: t.type }) }),
                  e.jsx("td", { className: `p-3.5 font-black ${t.type === "Income" ? "text-emerald-500" : "text-rose-500"}`, children: formatCurr(t.amount) }),
                  e.jsx("td", { className: "p-3.5", children: e.jsx("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${t.status === "Cleared" ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" : "bg-amber-500/15 text-amber-500"}`, children: t.status }) }),
                  e.jsx("td", { className: "p-3.5 text-right", children: e.jsx("button", { type: "button", onClick: () => handleDeleteTransaction(t.id), className: "p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition cursor-pointer", children: "🗑️" }) })
                ]
              }, t.id))
            })
          ]
        })
      }),

      // Add Transaction Modal
      isModalOpen && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn",
        children: e.jsxs("form", {
          onSubmit: handleAddTransaction,
          className: "w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4",
          children: [
            e.jsxs("div", { className: "flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3", children: [e.jsx("h3", { className: "text-base font-black text-slate-900 dark:text-white", children: "Record New Ledger Entry" }), e.jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "text-slate-400 font-bold hover:text-white text-base cursor-pointer", children: "×" })] }),
            e.jsxs("div", { className: "space-y-3", children: [
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-[11px] text-slate-500 font-bold mb-1", children: "Category" }), e.jsx("input", { type: "text", value: newTx.category, onChange: (ev) => setNewTx({ ...newTx, category: ev.target.value }), required: true, className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none text-xs" })] }),
              e.jsxs("div", { children: [e.jsx("label", { className: "block text-[11px] text-slate-500 font-bold mb-1", children: "Description" }), e.jsx("input", { type: "text", value: newTx.description, onChange: (ev) => setNewTx({ ...newTx, description: ev.target.value }), required: true, placeholder: "e.g. Enterprise Client License Revenue", className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none text-xs" })] }),
              e.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                e.jsxs("div", { children: [e.jsx("label", { className: "block text-[11px] text-slate-500 font-bold mb-1", children: "Type" }), e.jsxs("select", { value: newTx.type, onChange: (ev) => setNewTx({ ...newTx, type: ev.target.value }), className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none text-xs", children: [e.jsx("option", { value: "Income", children: "Income" }), e.jsx("option", { value: "Expense", children: "Expense" })] })] }),
                e.jsxs("div", { children: [e.jsx("label", { className: "block text-[11px] text-slate-500 font-bold mb-1", children: "Amount (₹)" }), e.jsx("input", { type: "number", value: newTx.amount, onChange: (ev) => setNewTx({ ...newTx, amount: ev.target.value }), required: true, placeholder: "45000", className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none text-xs" })] })
              ]})
            ]}),
            e.jsxs("div", { className: "flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800", children: [
              e.jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer", children: "Cancel" }),
              e.jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md", children: "Save Ledger Entry" })
            ]})
          ]
        })
      })
    ]
  });
}