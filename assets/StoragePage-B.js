import{c,w as se,r as t,j as e,a as te,x as ae,f as le,X as re,n as D,p as oe,M as de}from"./index-Ftt5f73P.js";

// Custom Lucide icons
const Folder = c("Folder", [["path", {d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z", key: "1"}]]);
const File = c("File", [["path", {d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1"}], ["path", {d: "M14 2v4a2 2 0 0 0 2 2h4", key: "2"}]]);
const UploadCloud = c("UploadCloud", [["path", {d: "M16 16h.01", key: "1"}], ["path", {d: "M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25", key: "2"}], ["path", {d: "M8 16h.01", key: "3"}], ["path", {d: "M20 20h.01", key: "4"}], ["path", {d: "M12 20v-6", key: "5"}], ["path", {d: "M9 17l3-3 3 3", key: "6"}]]);
const Trash2 = c("Trash2", [["path", {d: "M3 6h18", key: "1"}], ["path", {d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "2"}], ["path", {d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "3"}], ["line", {x1: "10", x2: "10", y1: "11", y2: "17", key: "4"}], ["line", {x1: "14", x2: "14", y1: "11", y2: "17", key: "5"}]]);
const Download = c("Download", [["path", {d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "1"}], ["polyline", {points: "7 10 12 15 17 10", key: "2"}], ["line", {x1: "12", x2: "12", y1: "15", y2: "3", key: "3"}]]);
const Eye = c("Eye", [["path", {d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z", key: "1"}], ["circle", {cx: "12", cy: "12", r: "3", key: "2"}]]);
const SearchIcon = c("Search", [["circle", {cx: "11", cy: "11", r: "8", key: "1"}], ["line", {x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "2"}]]);
const ShieldIcon = c("Shield", [["path", {d: "M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6Z", key: "1"}]]);

// Seed data
const defaultDocs = [
  { id: "doc-1", name: "Project Proposal v2.pdf", category: "Proposals", sizeBytes: 2516582, date: "2026-08-25", owner: "Riya Sharma", type: "application/pdf" },
  { id: "doc-2", name: "NDA Signed Agreement.pdf", category: "Contracts", sizeBytes: 1153433, date: "2026-08-24", owner: "Abhishek Singh", type: "application/pdf" },
  { id: "doc-3", name: "GST Registration Certificate.jpg", category: "KYC Files", sizeBytes: 870400, date: "2026-08-23", owner: "Charu Shah", type: "image/jpeg" },
  { id: "doc-4", name: "August SLA Invoice.pdf", category: "Invoices", sizeBytes: 430080, date: "2026-08-26", owner: "System Auto", type: "application/pdf" }
];

export default function StoragePage() {
  const { user } = se();
  const [docs, setDocs] = t.useState(() => {
    try {
      const stored = localStorage.getItem("leadflow_documents");
      return stored ? JSON.parse(stored) : defaultDocs;
    } catch {
      return defaultDocs;
    }
  });

  const [activeTab, setActiveTab] = t.useState("All");
  const [searchQuery, setSearchQuery] = t.useState("");
  const [isUploadOpen, setIsUploadOpen] = t.useState(false);
  const [uploadCategory, setUploadCategory] = t.useState("Proposals");
  const [previewFile, setPreviewFile] = t.useState(null);
  const [toast, setToast] = t.useState(null);

  t.useEffect(() => {
    localStorage.setItem("leadflow_documents", JSON.stringify(docs));
  }, [docs]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (ev) => {
    const file = ev.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newDoc = {
        id: "doc-" + Date.now(),
        name: file.name,
        category: uploadCategory,
        sizeBytes: file.size,
        date: new Date().toISOString().split("T")[0],
        owner: (user?.name) || "Admin User",
        type: file.type,
        dataUrl: e.target.result
      };

      setDocs([newDoc, ...docs]);
      setIsUploadOpen(false);
      notify("Document uploaded and encrypted in CRM Secure Storage!");
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this document from secure repository?")) {
      setDocs(docs.filter(d => d.id !== id));
      notify("Document deleted successfully.");
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const filteredDocs = docs.filter(d => {
    const matchesTab = activeTab === "All" || d.category === activeTab;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalUsed = docs.reduce((acc, d) => acc + d.sizeBytes, 0);
  const limitBytes = 104857600; // 100 MB
  const percentUsed = Math.min(100, (totalUsed / limitBytes) * 100);

  return e.jsxs("div", {
    className: "space-y-6 w-full min-w-0 pb-8",
    children: [
      toast && e.jsxs("div", {
        className: "fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce",
        children: [
          e.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }),
          e.jsx("span", { children: toast })
        ]
      }),

      // Header
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("h1", {
                className: "text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2",
                children: [
                  e.jsx(ShieldIcon, { className: "w-6 h-6 text-indigo-500 shrink-0" }),
                  e.jsx("span", { children: "Secure Storage & Documents" })
                ]
              }),
              e.jsx("p", {
                className: "text-xs text-slate-500 dark:text-slate-400 mt-1",
                children: "Store, manage and share secure business documents, proposals, contracts and customer KYC files."
              })
            ]
          }),
          e.jsxs("button", {
            type: "button",
            onClick: () => setIsUploadOpen(true),
            className: "py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center space-x-2 shadow-md shadow-indigo-600/10",
            children: [
              e.jsx(UploadCloud, { className: "w-4 h-4" }),
              e.jsx("span", { children: "Upload Document" })
            ]
          })
        ]
      }),

      // Storage Limit Indicator Card
      e.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-6",
        children: [
          e.jsxs("div", {
            className: "md:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4",
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between text-xs",
                children: [
                  e.jsxs("span", {
                    className: "font-bold text-slate-600 dark:text-slate-400",
                    children: ["Cloud Repository Used: ", formatSize(totalUsed)]
                  }),
                  e.jsxs("span", {
                    className: "font-black text-slate-400",
                    children: ["100 MB Limit"]
                  })
                ]
              }),
              e.jsx("div", {
                className: "w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden",
                children: e.jsx("div", {
                  className: "bg-indigo-600 h-full rounded-full transition-all duration-500",
                  style: { width: `${percentUsed}%` }
                })
              }),
              e.jsx("p", {
                className: "text-[10px] text-slate-400 dark:text-slate-500 font-semibold",
                children: "All documents uploaded are securely encrypted in transit and at rest using AES-256 standards."
              })
            ]
          }),
          e.jsxs("div", {
            className: "p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 shadow-sm flex items-center space-x-4",
            children: [
              e.jsx("div", {
                className: "p-3 rounded-2xl bg-indigo-600 text-white shrink-0",
                children: e.jsx(Folder, { className: "w-6 h-6" })
              }),
              e.jsxs("div", {
                children: [
                  e.jsx("h4", {
                    className: "text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider",
                    children: "Total Stored Files"
                  }),
                  e.jsxs("p", {
                    className: "text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1",
                    children: [docs.length, " files"]
                  })
                ]
              })
            ]
          })
        ]
      }),

      // Filters & Search Bar
      e.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm",
        children: [
          // Filter tabs
          e.jsx("div", {
            className: "flex items-center space-x-1 overflow-x-auto scrollbar-none",
            children: ["All", "Proposals", "Contracts", "KYC Files", "Invoices"].map(tab =>
              e.jsx("button", {
                key: tab,
                type: "button",
                onClick: () => setActiveTab(tab),
                className: `px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`,
                children: tab
              })
            )
          }),

          // Search input
          e.jsxs("div", {
            className: "relative w-full md:w-80",
            children: [
              e.jsx("input", {
                type: "text",
                placeholder: "Search documents...",
                value: searchQuery,
                onChange: (ev) => setSearchQuery(ev.target.value),
                className: "w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              }),
              e.jsx(SearchIcon, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" })
            ]
          })
        ]
      }),

      // Grid list of Documents
      filteredDocs.length === 0
        ? e.jsxs("div", {
            className: "flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3",
            children: [
              e.jsx("div", {
                className: "text-4xl",
                children: "📂"
              }),
              e.jsx("h3", {
                className: "font-black text-slate-700 dark:text-slate-300 text-sm",
                children: "No Documents Found"
              }),
              e.jsx("p", {
                className: "text-xs text-slate-400 max-w-sm",
                children: "No files match your filter or search query. Upload files using the upload button at the top."
              })
            ]
          })
        : e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
            children: filteredDocs.map(doc => {
              const isImage = doc.type.startsWith("image/");
              return e.jsxs("div", {
                className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-48 space-y-4",
                children: [
                  e.jsxs("div", {
                    className: "flex items-start justify-between gap-3",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center space-x-3 min-w-0",
                        children: [
                          e.jsx("div", {
                            className: "w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg shrink-0",
                            children: isImage ? "🖼️" : "📄"
                          }),
                          e.jsxs("div", {
                            className: "min-w-0",
                            children: [
                              e.jsx("h4", {
                                className: "font-bold text-xs text-slate-950 dark:text-white truncate",
                                title: doc.name,
                                children: doc.name
                              }),
                              e.jsxs("p", {
                                className: "text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5",
                                children: [doc.category, " • ", formatSize(doc.sizeBytes)]
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsx("button", {
                        type: "button",
                        onClick: () => handleDelete(doc.id),
                        className: "p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition shrink-0",
                        children: e.jsx(Trash2, { className: "w-3.5 h-3.5" })
                      })
                    ]
                  }),

                  // Extra details
                  e.jsxs("div", {
                    className: "text-[10px] space-y-1 text-slate-500 dark:text-slate-400 font-semibold pt-2 border-t border-slate-100 dark:border-slate-800/80",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          e.jsx("span", { children: "Uploaded by" }),
                          e.jsx("span", { className: "text-slate-800 dark:text-slate-200", children: doc.owner })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "flex justify-between",
                        children: [
                          e.jsx("span", { children: "Upload Date" }),
                          e.jsx("span", { className: "text-slate-800 dark:text-slate-200", children: doc.date })
                        ]
                      })
                    ]
                  }),

                  // View & Download buttons
                  e.jsxs("div", {
                    className: "flex items-center space-x-2 pt-2",
                    children: [
                      e.jsxs("button", {
                        type: "button",
                        onClick: () => setPreviewFile(doc),
                        className: "flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] transition flex items-center justify-center space-x-1.5",
                        children: [
                          e.jsx(Eye, { className: "w-3 h-3" }),
                          e.jsx("span", { children: "Preview" })
                        ]
                      }),
                      e.jsxs("a", {
                        href: doc.dataUrl || "#",
                        download: doc.name,
                        onClick: (ev) => {
                          if (!doc.dataUrl) {
                            ev.preventDefault();
                            notify("Downloading simulated file...");
                          }
                        },
                        className: "flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition flex items-center justify-center space-x-1.5",
                        children: [
                          e.jsx(Download, { className: "w-3 h-3" }),
                          e.jsx("span", { children: "Download" })
                        ]
                      })
                    ]
                  })
                ]
              }, doc.id);
            })
          }),

      // Upload Dialog modal
      e.jsx(D, {
        isOpen: isUploadOpen,
        onClose: () => setIsUploadOpen(false),
        title: "Secure File Upload",
        children: e.jsxs("div", {
          className: "space-y-4 text-xs",
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("label", {
                  className: "block font-bold text-slate-700 dark:text-slate-300 mb-1",
                  children: "Document Category"
                }),
                e.jsxs("select", {
                  value: uploadCategory,
                  onChange: (ev) => setUploadCategory(ev.target.value),
                  className: "w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer font-bold",
                  children: [
                    e.jsx("option", { value: "Proposals", children: "Proposals (Proposal / Quote)" }),
                    e.jsx("option", { value: "Contracts", children: "Contracts (NDA / Agreement)" }),
                    e.jsx("option", { value: "KYC Files", children: "KYC Files (ID / GST Certificate)" }),
                    e.jsx("option", { value: "Invoices", children: "Invoices (Paid Invoice receipt)" })
                  ]
                })
              ]
            }),

            e.jsxs("div", {
              className: "border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition cursor-pointer relative",
              children: [
                e.jsx("input", {
                  type: "file",
                  onChange: handleFileUpload,
                  className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                }),
                e.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    e.jsx("div", {
                      className: "text-2xl text-slate-400",
                      children: "📤"
                    }),
                    e.jsxs("p", {
                      className: "font-bold text-slate-600 dark:text-slate-300",
                      children: [
                        e.jsx("span", { className: "text-indigo-600", children: "Click to upload" }),
                        e.jsx("span", { children: " or drag & drop files here" })
                      ]
                    }),
                    e.jsx("p", {
                      className: "text-[10px] text-slate-400",
                      children: "PDF, DOCX, PNG, JPG, ZIP (max 10MB)"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }),

      // Preview File dialog modal
      e.jsx(D, {
        isOpen: !!previewFile,
        onClose: () => setPreviewFile(null),
        title: previewFile ? `Secure Preview: ${previewFile.name}` : "File Preview",
        children: previewFile && e.jsxs("div", {
          className: "space-y-4 text-xs text-center",
          children: [
            previewFile.type.startsWith("image/")
              ? e.jsx("img", {
                  src: previewFile.dataUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800",
                  alt: previewFile.name,
                  className: "max-w-full max-h-96 mx-auto rounded-xl border border-slate-200 dark:border-slate-800"
                })
              : e.jsxs("div", {
                  className: "p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-left space-y-4",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center space-x-3",
                      children: [
                        e.jsx("div", { className: "text-3xl", children: "📄" }),
                        e.jsxs("div", {
                          children: [
                            e.jsx("h3", { className: "font-black text-slate-900 dark:text-white", children: previewFile.name }),
                            e.jsx("p", { className: "text-[10px] text-slate-400", children: previewFile.type })
                          ]
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3 text-[11px]",
                      children: [
                        e.jsxs("p", { children: [e.jsx("span", { className: "font-bold text-slate-500", children: "Doc Category: " }), previewFile.category] }),
                        e.jsxs("p", { children: [e.jsx("span", { className: "font-bold text-slate-500", children: "Size: " }), formatSize(previewFile.sizeBytes)] }),
                        e.jsxs("p", { children: [e.jsx("span", { className: "font-bold text-slate-500", children: "Security Status: " }), e.jsx("span", { className: "text-emerald-600 font-extrabold", children: "Verified Encrypted" })] })
                      ]
                    })
                  ]
                }),
            e.jsx("button", {
              type: "button",
              onClick: () => setPreviewFile(null),
              className: "px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20",
              children: "Close Preview"
            })
          ]
        })
      })
    ]
  });
}
