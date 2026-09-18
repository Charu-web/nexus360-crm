import{r as s,j as e,n as Modal}from"./index-Ftt5f73P.js";
import{f as formatCurrency}from"./formatCurrency-ChTmm5Hb.js";

const DEFAULT_DEALS = [
  { id: "deal-1", title: "Cyberdyne - Cloud Enterprise Upgrade", client: "Sarah Connor", company: "Cyberdyne Systems", value: 65000, stage: "negotiation", probability: 80, expectedClose: "2026-09-15", assignedTo: "Rahul Sharma" },
  { id: "deal-2", title: "Nexus Tech - 100 User License Pack", client: "Alex Rivera", company: "Nexus Tech", value: 85000, stage: "proposal", probability: 60, expectedClose: "2026-09-01", assignedTo: "Sarah Miller" },
  { id: "deal-3", title: "Acme Logistics - Fleet CRM Automation", client: "John Doe", company: "Acme Logistics", value: 24500, stage: "contact", probability: 40, expectedClose: "2026-09-20", assignedTo: "Preeti Patel" },
  { id: "deal-4", title: "Apex Retail - POS Multi-Branch Sync", client: "Vikram Malhotra", company: "Apex Retail", value: 42000, stage: "won", probability: 100, expectedClose: "2026-08-25", assignedTo: "Rahul Sharma" },
  { id: "deal-5", title: "Zenith Fin - AI Compliance Module", client: "Anita Desai", company: "Zenith Financials", value: 31000, stage: "demo", probability: 50, expectedClose: "2026-09-10", assignedTo: "Amit Verma" }
];

const DEFAULT_QUOTATIONS = [
  { id: "QT-2026-001", client: "Sarah Connor", company: "Cyberdyne Systems", date: "2026-08-20", validUntil: "2026-09-20", status: "Sent", items: [{ desc: "Enterprise Cloud License (Annual)", qty: 1, price: 50000, tax: 18, total: 59000 }, { desc: "24/7 Dedicated SLA Support", qty: 1, price: 15000, tax: 18, total: 17700 }], total: 76700 },
  { id: "QT-2026-002", client: "Alex Rivera", company: "Nexus Tech", date: "2026-08-22", validUntil: "2026-09-22", status: "Accepted", items: [{ desc: "100 User Seat Pack", qty: 1, price: 85000, tax: 18, total: 100300 }], total: 100300 }
];

function DealsPage() {
  const [activeTab, setActiveTab] = s.useState("pipeline"); // "pipeline", "quotations"
  const [deals, setDeals] = s.useState(() => {
    try {
      const stored = localStorage.getItem("leadflow_deals");
      return stored ? JSON.parse(stored) : DEFAULT_DEALS;
    } catch { return DEFAULT_DEALS; }
  });

  const [quotations, setQuotations] = s.useState(() => {
    try {
      const stored = localStorage.getItem("leadflow_quotations");
      return stored ? JSON.parse(stored) : DEFAULT_QUOTATIONS;
    } catch { return DEFAULT_QUOTATIONS; }
  });

  const [toast, setToast] = s.useState(null);
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const saveDeals = (d) => {
    setDeals(d);
    localStorage.setItem("leadflow_deals", JSON.stringify(d));
  };

  const saveQuotations = (q) => {
    setQuotations(q);
    localStorage.setItem("leadflow_quotations", JSON.stringify(q));
  };

  // Modals
  const [showAddDeal, setShowAddDeal] = s.useState(false);
  const [dealTitle, setDealTitle] = s.useState("");
  const [dealClient, setDealClient] = s.useState("");
  const [dealCompany, setDealCompany] = s.useState("");
  const [dealValue, setDealValue] = s.useState("");
  const [dealStage, setDealStage] = s.useState("demo");
  const [dealProbability, setDealProbability] = s.useState(50);
  const [dealExpectedClose, setDealExpectedClose] = s.useState("2026-09-15");

  // Quotation Builder Modal
  const [showAddQuote, setShowAddQuote] = s.useState(false);
  const [quoteClient, setQuoteClient] = s.useState("");
  const [quoteCompany, setQuoteCompany] = s.useState("");
  const [quoteItemDesc, setQuoteItemDesc] = s.useState("");
  const [quoteItemQty, setQuoteItemQty] = s.useState(1);
  const [quoteItemPrice, setQuoteItemPrice] = s.useState(25000);
  const [quoteTax, setQuoteTax] = s.useState(18);

  const STAGES = [
    { id: "lead_in", title: "Lead In", color: "border-blue-500/40 bg-blue-500/10 text-blue-600" },
    { id: "contact", title: "Contact Made", color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-600" },
    { id: "demo", title: "Demo Scheduled", color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-600" },
    { id: "proposal", title: "Proposal Sent", color: "border-purple-500/40 bg-purple-500/10 text-purple-600" },
    { id: "negotiation", title: "Negotiation", color: "border-pink-500/40 bg-pink-500/10 text-pink-600" },
    { id: "won", title: "Closed Won", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" },
    { id: "lost", title: "Closed Lost", color: "border-rose-500/40 bg-rose-500/10 text-rose-600" }
  ];

  const handleCreateDeal = (e) => {
    e.preventDefault();
    if (!dealTitle.trim()) return;
    const newD = {
      id: "deal-" + Date.now(),
      title: dealTitle.trim(),
      client: dealClient.trim() || "Client",
      company: dealCompany.trim() || "Company",
      value: Number(dealValue) || 25000,
      stage: dealStage,
      probability: Number(dealProbability) || 50,
      expectedClose: dealExpectedClose,
      assignedTo: "Rahul Sharma"
    };
    const updated = [newD, ...deals];
    saveDeals(updated);
    setShowAddDeal(false);
    setDealTitle("");
    setDealCompany("");
    setDealValue("");
    notify("Sales deal added to pipeline!");
  };

  const handleMoveStage = (dealId, newStage) => {
    const probMap = { lead_in: 20, contact: 35, demo: 50, proposal: 65, negotiation: 80, won: 100, lost: 0 };
    const updated = deals.map(d => d.id === dealId ? { ...d, stage: newStage, probability: probMap[newStage] || 50 } : d);
    saveDeals(updated);
    notify(`Deal updated to ${newStage.toUpperCase()}`);
  };

  const handleCreateQuote = (e) => {
    e.preventDefault();
    const qty = Number(quoteItemQty) || 1;
    const price = Number(quoteItemPrice) || 1000;
    const taxPct = Number(quoteTax) || 18;
    const subtotal = qty * price;
    const total = subtotal + (subtotal * taxPct / 100);

    const newQ = {
      id: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      client: quoteClient.trim() || "Client",
      company: quoteCompany.trim() || "Company",
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: "Sent",
      items: [{ desc: quoteItemDesc.trim() || "Enterprise Solution Package", qty, price, tax: taxPct, total }],
      total
    };
    const updated = [newQ, ...quotations];
    saveQuotations(updated);
    setShowAddQuote(false);
    setQuoteClient("");
    setQuoteCompany("");
    setQuoteItemDesc("");
    notify("Quotation created successfully!");
  };

  const handleConvertQuoteToInvoice = (q) => {
    const invoicesRaw = localStorage.getItem("leadflow_invoices");
    let invoices = [];
    try { invoices = invoicesRaw ? JSON.parse(invoicesRaw) : []; } catch { invoices = []; }

    const newInvoice = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      customer: q.company || q.client,
      client: q.client,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      amount: q.total,
      status: "Unpaid",
      items: q.items
    };

    invoices.unshift(newInvoice);
    localStorage.setItem("leadflow_invoices", JSON.stringify(invoices));

    const updatedQ = quotations.map(item => item.id === q.id ? { ...item, status: "Converted to Invoice" } : item);
    saveQuotations(updatedQ);
    notify(`Quotation ${q.id} converted into Invoice ${newInvoice.id}!`);
  };

  const totalPipelineValue = deals.reduce((acc, d) => acc + (d.stage !== "lost" ? (Number(d.value) || 0) : 0), 0);
  const weightedForecast = deals.reduce((acc, d) => acc + (d.stage !== "lost" ? ((Number(d.value) || 0) * (Number(d.probability) || 0) / 100) : 0), 0);

  return e.jsxs("div", {
    className: "deals-module space-y-6 pb-12 w-full max-w-none min-w-0 font-sans text-slate-900 dark:text-slate-100",
    children: [
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
                  e.jsx("h1", { className: "text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white", children: "Deals & Quotations Pipeline" }),
                  e.jsx("span", { className: "px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20", children: `Total: ${formatCurrency(totalPipelineValue)}` })
                ]
              }),
              e.jsxs("p", {
                className: "text-xs text-slate-500 dark:text-slate-400 font-medium",
                children: ["Weighted Forecast Value: ", e.jsx("span", { className: "text-emerald-600 dark:text-emerald-400 font-bold", children: formatCurrency(weightedForecast) }), " • Manage deal stages, conversion probability, and quotation generators."]
              })
            ]
          }),

          // Tab & Actions
          e.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              e.jsxs("div", {
                className: "flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-extrabold",
                children: [
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setActiveTab("pipeline"),
                    className: `px-3.5 py-1.5 rounded-lg transition ${activeTab === "pipeline" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`,
                    children: "Deals Pipeline"
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setActiveTab("quotations"),
                    className: `px-3.5 py-1.5 rounded-lg transition ${activeTab === "quotations" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`,
                    children: "Quotations"
                  })
                ]
              }),
              activeTab === "pipeline" ? e.jsxs("button", {
                type: "button",
                onClick: () => setShowAddDeal(true),
                className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1",
                children: [
                  e.jsx("span", { children: "+" }),
                  e.jsx("span", { children: "New Deal" })
                ]
              }) : e.jsxs("button", {
                type: "button",
                onClick: () => setShowAddQuote(true),
                className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1",
                children: [
                  e.jsx("span", { children: "+" }),
                  e.jsx("span", { children: "Create Quotation" })
                ]
              })
            ]
          })
        ]
      }),

      // TAB 1: Deals Pipeline Columns
      activeTab === "pipeline" && e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-4 w-full overflow-x-auto pb-4",
        children: STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

          return e.jsxs("div", {
            key: stage.id,
            className: "p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 min-w-[240px]",
            children: [
              // Stage Header
              e.jsxs("div", {
                className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2",
                children: [
                  e.jsx("h4", { className: "font-black text-xs text-slate-800 dark:text-slate-200", children: stage.title }),
                  e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300", children: stageDeals.length })
                ]
              }),
              e.jsx("p", { className: "text-[10px] font-extrabold text-slate-400", children: formatCurrency(stageTotal) }),

              // Stage Cards
              e.jsx("div", {
                className: "space-y-2.5",
                children: stageDeals.map(d => e.jsxs("div", {
                  key: d.id,
                  className: "p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:border-indigo-500/40 transition space-y-2",
                  children: [
                    e.jsxs("div", {
                      className: "space-y-0.5",
                      children: [
                        e.jsx("h5", { className: "font-black text-xs text-slate-900 dark:text-white truncate", children: d.title }),
                        e.jsxs("p", { className: "text-[10px] text-slate-400 font-medium", children: [d.company, " • ", d.client] })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "flex items-center justify-between text-xs font-black pt-1 border-t border-slate-100 dark:border-slate-700/40",
                      children: [
                        e.jsx("span", { className: "text-indigo-600 dark:text-indigo-400 font-black", children: formatCurrency(d.value || 0) }),
                        e.jsxs("span", { className: "text-[10px] text-emerald-500 font-extrabold", children: [`${d.probability}%`, " prob"] })
                      ]
                    }),
                    // Move Stage selector
                    e.jsx("select", {
                      value: d.stage,
                      onChange: (e) => handleMoveStage(d.id, e.target.value),
                      className: "w-full px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer mt-1",
                      children: STAGES.map(s => e.jsx("option", { value: s.id, children: `Move to: ${s.title}` }, s.id))
                    })
                  ]
                }))
              })
            ]
          });
        })
      }),

      // TAB 2: Quotations Table
      activeTab === "quotations" && e.jsxs("div", {
        className: "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden",
        children: [
          e.jsx("div", {
            className: "p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between",
            children: [
              e.jsx("h3", { className: "text-sm font-black text-slate-900 dark:text-white", children: "Active Quotations & Estimates" }),
              e.jsx("span", { className: "text-xs text-slate-400", children: "Convert accepted quotes to invoices in one click" })
            ]
          }),
          e.jsxs("table", {
            className: "w-full text-left text-xs text-slate-600 dark:text-slate-400 border-collapse",
            children: [
              e.jsx("thead", {
                className: "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800",
                children: e.jsxs("tr", {
                  children: [
                    e.jsx("th", { className: "py-3 px-4", children: "Quote ID" }),
                    e.jsx("th", { className: "py-3 px-4", children: "Client & Company" }),
                    e.jsx("th", { className: "py-3 px-4", children: "Date" }),
                    e.jsx("th", { className: "py-3 px-4", children: "Grand Total" }),
                    e.jsx("th", { className: "py-3 px-4", children: "Status" }),
                    e.jsx("th", { className: "py-3 px-4 text-right", children: "Actions" })
                  ]
                })
              }),
              e.jsx("tbody", {
                className: "divide-y divide-slate-100 dark:divide-slate-800/60",
                children: quotations.map(q => e.jsxs("tr", {
                  key: q.id,
                  className: "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition",
                  children: [
                    e.jsx("td", { className: "py-3 px-4 font-mono font-black text-indigo-600 dark:text-indigo-400", children: q.id }),
                    e.jsxs("td", {
                      className: "py-3 px-4",
                      children: [
                        e.jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: q.company }),
                        e.jsx("span", { className: "text-[10px] text-slate-400", children: q.client })
                      ]
                    }),
                    e.jsx("td", { className: "py-3 px-4", children: q.date }),
                    e.jsx("td", { className: "py-3 px-4 font-black text-slate-900 dark:text-white", children: formatCurrency(q.total || 0) }),
                    e.jsx("td", {
                      className: "py-3 px-4",
                      children: e.jsx("span", {
                        className: `px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${q.status.includes("Invoice") ? "bg-emerald-500/15 text-emerald-600" : "bg-purple-500/15 text-purple-600"}`,
                        children: q.status
                      })
                    }),
                    e.jsx("td", {
                      className: "py-3 px-4 text-right",
                      children: e.jsxs("div", {
                        className: "flex items-center justify-end space-x-2",
                        children: [
                          e.jsx("button", {
                            type: "button",
                            onClick: () => handleConvertQuoteToInvoice(q),
                            disabled: q.status.includes("Invoice"),
                            className: `px-2.5 py-1 rounded-xl text-[10px] font-bold ${q.status.includes("Invoice") ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"}`,
                            children: "Convert to Invoice"
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
      }),

      // Add Deal Modal
      showAddDeal && e.jsx(Modal, {
        isOpen: showAddDeal,
        onClose: () => setShowAddDeal(false),
        title: "Create Pipeline Deal",
        children: e.jsxs("form", {
          onSubmit: handleCreateDeal,
          className: "space-y-4 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Deal Title *" }),
                e.jsx("input", {
                  type: "text",
                  required: true,
                  placeholder: "e.g. Cyberdyne Cloud Migration",
                  value: dealTitle,
                  onChange: (e) => setDealTitle(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Client Name" }),
                    e.jsx("input", {
                      type: "text",
                      placeholder: "Sarah Connor",
                      value: dealClient,
                      onChange: (e) => setDealClient(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Company Name" }),
                    e.jsx("input", {
                      type: "text",
                      placeholder: "Cyberdyne Systems",
                      value: dealCompany,
                      onChange: (e) => setDealCompany(e.target.value),
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
                      placeholder: "65000",
                      value: dealValue,
                      onChange: (e) => setDealValue(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Stage" }),
                    e.jsxs("select", {
                      value: dealStage,
                      onChange: (e) => setDealStage(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold",
                      children: STAGES.map(s => e.jsx("option", { value: s.id, children: s.title }, s.id))
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
                  onClick: () => setShowAddDeal(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                e.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md",
                  children: "Save Deal"
                })
              ]
            })
          ]
        })
      }),

      // Add Quotation Modal
      showAddQuote && e.jsx(Modal, {
        isOpen: showAddQuote,
        onClose: () => setShowAddQuote(false),
        title: "Create Quotation",
        children: e.jsxs("form", {
          onSubmit: handleCreateQuote,
          className: "space-y-4 text-xs font-semibold",
          children: [
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Client Name" }),
                    e.jsx("input", {
                      type: "text",
                      required: true,
                      placeholder: "Alex Rivera",
                      value: quoteClient,
                      onChange: (e) => setQuoteClient(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Company Name" }),
                    e.jsx("input", {
                      type: "text",
                      placeholder: "Nexus Tech",
                      value: quoteCompany,
                      onChange: (e) => setQuoteCompany(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                })
              ]
            }),
            e.jsxs("div", {
              children: [
                e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Item Description *" }),
                e.jsx("input", {
                  type: "text",
                  required: true,
                  placeholder: "e.g. Enterprise CRM Cloud License Pack",
                  value: quoteItemDesc,
                  onChange: (e) => setQuoteItemDesc(e.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                })
              ]
            }),
            e.jsxs("div", {
              className: "grid grid-cols-3 gap-3",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Quantity" }),
                    e.jsx("input", {
                      type: "number",
                      value: quoteItemQty,
                      onChange: (e) => setQuoteItemQty(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Unit Price ($)" }),
                    e.jsx("input", {
                      type: "number",
                      value: quoteItemPrice,
                      onChange: (e) => setQuoteItemPrice(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    })
                  ]
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "block text-slate-700 dark:text-slate-300 mb-1", children: "Tax (%)" }),
                    e.jsx("input", {
                      type: "number",
                      value: quoteTax,
                      onChange: (e) => setQuoteTax(e.target.value),
                      className: "w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
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
                  onClick: () => setShowAddQuote(false),
                  className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold",
                  children: "Cancel"
                }),
                e.jsx("button", {
                  type: "submit",
                  className: "px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md",
                  children: "Generate Quotation"
                })
              ]
            })
          ]
        })
      })
    ]
  });
}

export { DealsPage as default };
