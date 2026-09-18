import{o as c}from"./index-Ftt5f73P.js";

const DEFAULT_LEADS = [
  {
    _id: "lead-1",
    name: "Sarah Connor",
    company: "Cyberdyne Systems",
    email: "sarah@cyberdyne.io",
    phone: "+1 555-0199",
    status: "qualified",
    priority: "high",
    source: "website",
    value: 65000,
    score: 88,
    classification: "hot",
    assignedTo: "Rahul Sharma",
    altAssignedTo: "Preeti Patel",
    nextFollowupDate: "2026-08-27",
    notes: [
      { text: "Interested in enterprise cloud upgrade and 24/7 dedicated support.", createdBy: "Preeti Patel", createdAt: "2026-08-15T10:00:00.000Z" }
    ],
    timeline: [
      { type: "call", title: "Discovery Call Completed", date: "2026-08-15 10:30 AM", user: "Rahul Sharma" }
    ],
    isDeleted: false
  },
  {
    _id: "lead-2",
    name: "John Doe",
    company: "Acme Logistics",
    email: "john@acme.com",
    phone: "+1 555-0381",
    status: "new",
    priority: "medium",
    source: "referral",
    value: 24500,
    score: 72,
    classification: "warm",
    assignedTo: "Preeti Patel",
    altAssignedTo: "Amit Verma",
    nextFollowupDate: "2026-08-28",
    notes: [],
    timeline: [
      { type: "inbound", title: "Captured from Website Form", date: "2026-08-16 09:15 AM", user: "System" }
    ],
    isDeleted: false
  },
  {
    _id: "lead-3",
    name: "Alex Rivera",
    company: "Nexus Tech",
    email: "alex@nexus.io",
    phone: "+1 555-0921",
    status: "proposal",
    priority: "high",
    source: "linkedin",
    value: 85000,
    score: 94,
    classification: "hot",
    assignedTo: "Sarah Miller",
    altAssignedTo: "Rahul Sharma",
    nextFollowupDate: "2026-08-26",
    notes: [
      { text: "Proposal sent for 100 license seats. Awaiting procurement sign-off.", createdBy: "Rahul Sharma", createdAt: "2026-08-14T14:30:00.000Z" }
    ],
    timeline: [
      { type: "proposal", title: "Quotation #QT-2026-08 Sent", date: "2026-08-14 02:30 PM", user: "Sarah Miller" }
    ],
    isDeleted: false
  },
  {
    _id: "lead-4",
    name: "Vikram Malhotra",
    company: "Apex Retail Solutions",
    email: "vikram@apexretail.in",
    phone: "+91 98200 11223",
    status: "new",
    priority: "high",
    source: "indiamart",
    value: 42000,
    score: 82,
    classification: "hot",
    assignedTo: "Rahul Sharma",
    altAssignedTo: "Preeti Patel",
    nextFollowupDate: "2026-08-26",
    notes: [{ text: "Requested demo for retail billing & inventory integration.", createdBy: "System", createdAt: "2026-08-26T08:00:00.000Z" }],
    timeline: [{ type: "webhook", title: "IndiaMART Lead Ingested", date: "2026-08-26 08:00 AM", user: "IndiaMART API" }],
    isDeleted: false
  },
  {
    _id: "lead-5",
    name: "Anita Desai",
    company: "Zenith Financials",
    email: "anita@zenithfin.com",
    phone: "+91 99300 44556",
    status: "processing",
    priority: "medium",
    source: "google_ads",
    value: 31000,
    score: 65,
    classification: "warm",
    assignedTo: "Amit Verma",
    altAssignedTo: "Sarah Miller",
    nextFollowupDate: "2026-08-27",
    notes: [],
    timeline: [{ type: "call", title: "Introduction call scheduled", date: "2026-08-26 09:30 AM", user: "Amit Verma" }],
    isDeleted: false
  }
];

const getStoredLeads = () => {
  const stored = localStorage.getItem("leadflow_leads");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEFAULT_LEADS;
    } catch {
      return DEFAULT_LEADS;
    }
  }
  localStorage.setItem("leadflow_leads", JSON.stringify(DEFAULT_LEADS));
  return DEFAULT_LEADS;
};

const saveStoredLeads = (leads) => {
  localStorage.setItem("leadflow_leads", JSON.stringify(leads));
};

const calculateLeadScore = (lead) => {
  let score = 50;
  const val = Number(lead.value) || 0;
  if (val > 50000) score += 25;
  else if (val > 20000) score += 15;
  else if (val > 5000) score += 5;

  if (lead.priority === "high") score += 15;
  else if (lead.priority === "medium") score += 5;

  if (lead.phone && lead.email) score += 10;
  if (lead.source === "referral" || lead.source === "website") score += 5;
  if (lead.status === "qualified" || lead.status === "proposal") score += 15;

  score = Math.min(100, Math.max(10, score));
  const classification = score >= 80 ? "hot" : score >= 50 ? "warm" : "cold";
  return { score, classification };
};

const getLeads = async (params = {}) => {
  try {
    const res = await c.get("/leads", { params });
    if (res.data && res.data.success) return res.data;
  } catch {}

  let leads = getStoredLeads();
  const showDeleted = params.isDeleted === true || params.status === "trash";

  leads = leads.filter(l => (showDeleted ? l.isDeleted === true : !l.isDeleted));

  if (params.status && params.status !== "all" && params.status !== "trash") {
    if (params.status === "processing") {
      leads = leads.filter(l => l.status === "processing" || l.status === "contacted" || l.status === "in_progress");
    } else if (params.status === "close_by") {
      leads = leads.filter(l => l.status === "proposal" || l.status === "negotiation" || l.status === "close_by");
    } else {
      leads = leads.filter(l => l.status === params.status);
    }
  }

  if (params.classification && params.classification !== "all") {
    leads = leads.filter(l => l.classification === params.classification);
  }

  if (params.assignedTo && params.assignedTo !== "all") {
    leads = leads.filter(l => l.assignedTo === params.assignedTo);
  }

  if (params.search) {
    const s = params.search.toLowerCase();
    leads = leads.filter(l =>
      (l.name && l.name.toLowerCase().includes(s)) ||
      (l.company && l.company.toLowerCase().includes(s)) ||
      (l.email && l.email.toLowerCase().includes(s)) ||
      (l.phone && l.phone.includes(s))
    );
  }

  return { success: true, data: leads, total: leads.length };
};

const createLead = async (leadData) => {
  try {
    const res = await c.post("/leads", leadData);
    if (res.data && res.data.success) return res.data;
  } catch {}

  const leads = getStoredLeads();
  const numVal = Number(leadData.value) || 0;
  const { score, classification } = calculateLeadScore({ ...leadData, value: numVal });

  const staffMembers = ["Rahul Sharma", "Preeti Patel", "Sarah Miller", "Amit Verma"];
  const autoAssign = leadData.assignedTo || staffMembers[leads.length % staffMembers.length];
  const autoAltAssign = leadData.altAssignedTo || staffMembers[(leads.length + 1) % staffMembers.length];

  const newLead = {
    _id: "lead-" + Date.now(),
    name: leadData.name || "New Lead",
    company: leadData.company || "Company",
    email: leadData.email || "",
    phone: leadData.phone || "",
    status: leadData.status || "new",
    priority: leadData.priority || "medium",
    source: leadData.source || "website",
    value: numVal,
    score,
    classification,
    assignedTo: autoAssign,
    altAssignedTo: autoAltAssign,
    nextFollowupDate: leadData.nextFollowupDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: leadData.note ? [{ text: leadData.note, createdBy: "Admin", createdAt: new Date().toISOString() }] : [],
    timeline: [
      { type: "created", title: "Lead Created in Empire CRM", date: new Date().toLocaleString(), user: "Admin" }
    ],
    isDeleted: false,
    createdAt: new Date().toISOString()
  };

  const updated = [newLead, ...leads];
  saveStoredLeads(updated);
  return { success: true, data: newLead };
};

const updateLeadStatus = async (id, status) => {
  try {
    const res = await c.patch(`/leads/${id}/status`, { status });
    if (res.data && res.data.success) return res.data;
  } catch {}

  const leads = getStoredLeads();
  let updatedLead = null;
  const updated = leads.map(l => {
    if (l._id === id) {
      const { score, classification } = calculateLeadScore({ ...l, status });
      const timeline = [
        ...(l.timeline || []),
        { type: "status", title: `Status changed to ${status.toUpperCase()}`, date: new Date().toLocaleString(), user: "Admin" }
      ];
      updatedLead = { ...l, status, score, classification, timeline };
      return updatedLead;
    }
    return l;
  });
  saveStoredLeads(updated);
  return { success: true, data: updatedLead };
};

const addLeadNote = async (id, text) => {
  try {
    const res = await c.post(`/leads/${id}/notes`, { text });
    if (res.data && res.data.success) return res.data;
  } catch {}

  const leads = getStoredLeads();
  let updatedLead = null;
  const updated = leads.map(l => {
    if (l._id === id) {
      const notes = [...(l.notes || []), { text, createdBy: "Admin User", createdAt: new Date().toISOString() }];
      const timeline = [...(l.timeline || []), { type: "note", title: "Note Added", date: new Date().toLocaleString(), user: "Admin User" }];
      updatedLead = { ...l, notes, timeline };
      return updatedLead;
    }
    return l;
  });
  saveStoredLeads(updated);
  return { success: true, data: updatedLead };
};

const deleteLead = async (id, permanent = false) => {
  try {
    await c.delete(`/leads/${id}`);
  } catch {}

  const leads = getStoredLeads();
  let updated;
  if (permanent) {
    updated = leads.filter(l => l._id !== id);
  } else {
    updated = leads.map(l => (l._id === id ? { ...l, isDeleted: true, deletedAt: new Date().toISOString() } : l));
  }
  saveStoredLeads(updated);
  return { success: true };
};

const restoreLead = async (id) => {
  const leads = getStoredLeads();
  const updated = leads.map(l => (l._id === id ? { ...l, isDeleted: false, deletedAt: null } : l));
  saveStoredLeads(updated);
  return { success: true };
};

const convertLeadToCustomer = async (lead) => {
  const customersRaw = localStorage.getItem("leadflow_customers");
  let customers = [];
  try {
    const parsed = customersRaw ? JSON.parse(customersRaw) : [];
    customers = Array.isArray(parsed) ? parsed : [];
  } catch {
    customers = [];
  }

  const existingCust = customers.find(c => (lead.email && c.email === lead.email) || (lead.phone && c.phone === lead.phone));
  if (existingCust) {
    return { success: true, customer: existingCust, alreadyExisted: true };
  }

  const newCustomer = {
    id: "cust-" + Date.now(),
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    status: "Active",
    type: "Client",
    value: lead.value || 0,
    leadId: lead._id,
    dealsCount: 1,
    invoicesCount: 0,
    outstandingBalance: 0,
    address: "Primary Office",
    createdAt: new Date().toISOString()
  };

  customers.unshift(newCustomer);
  localStorage.setItem("leadflow_customers", JSON.stringify(customers));

  // Mark lead as won/converted
  await updateLeadStatus(lead._id, "won");
  return { success: true, customer: newCustomer };
};

const convertLeadToDeal = async (lead, dealStage = "proposal") => {
  const dealsRaw = localStorage.getItem("leadflow_deals");
  let deals = [];
  try {
    const parsed = dealsRaw ? JSON.parse(dealsRaw) : [];
    deals = Array.isArray(parsed) ? parsed : [];
  } catch {
    deals = [];
  }

  const newDeal = {
    id: "deal-" + Date.now(),
    title: `${lead.company || lead.name} - Enterprise Solution`,
    clientName: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    value: lead.value || 25000,
    stage: dealStage,
    probability: dealStage === "won" ? 100 : dealStage === "proposal" ? 60 : 40,
    expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    assignedTo: lead.assignedTo || "Rahul Sharma",
    createdAt: new Date().toISOString()
  };

  deals.unshift(newDeal);
  localStorage.setItem("leadflow_deals", JSON.stringify(deals));
  return { success: true, deal: newDeal };
};

const autoDistributeLeads = async () => {
  const staff = ["Rahul Sharma", "Preeti Patel", "Sarah Miller", "Amit Verma"];
  const leads = getStoredLeads();
  let idx = 0;
  const updated = leads.map(l => {
    if (!l.isDeleted) {
      const assigned = staff[idx % staff.length];
      const alt = staff[(idx + 1) % staff.length];
      idx++;
      return { ...l, assignedTo: assigned, altAssignedTo: alt };
    }
    return l;
  });
  saveStoredLeads(updated);
  return { success: true, count: leads.length };
};

export {
  getLeads as g,
  createLead as c,
  updateLeadStatus as u,
  addLeadNote as a,
  deleteLead as d,
  restoreLead as r,
  convertLeadToCustomer as cc,
  convertLeadToDeal as cd,
  autoDistributeLeads as ad
};
