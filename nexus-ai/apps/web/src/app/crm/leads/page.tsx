'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  Sparkles,
  Filter,
  ArrowUpDown,
  CheckCircle,
  X,
  Phone,
  Mail,
  Building,
  MoreVertical,
} from 'lucide-react';

export default function LeadsPage() {
  const { currentOrg } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);

  // Modal / Drawer state
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // New Lead form
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    industry: 'Software / SaaS',
    estimatedValue: 25000,
    source: 'INBOUND_WEB',
  });

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      let query = `/crm/leads?search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (priorityFilter) query += `&priority=${priorityFilter}`;

      const res = await ApiClient.get(query);
      if (res.success) setLeads(res.data);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentOrg, statusFilter, priorityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleScoreLead = async (leadId: string) => {
    setScoringLeadId(leadId);
    try {
      const res = await ApiClient.post(`/ai/score/${leadId}`, {});
      if (res.success) {
        // Refresh leads list to display new score & rationale
        await fetchLeads();
        if (selectedLead?.id === leadId) {
          const updated = await ApiClient.get(`/crm/leads/${leadId}`);
          if (updated.success) setSelectedLead(updated.data);
        }
      }
    } catch (err) {
      console.error('Scoring error:', err);
    } finally {
      setScoringLeadId(null);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post('/crm/leads', newLead);
      if (res.success) {
        setIsCreateModalOpen(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          companyName: '',
          industry: 'Software / SaaS',
          estimatedValue: 25000,
          source: 'INBOUND_WEB',
        });
        await fetchLeads();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create lead');
    }
  };

  const handleExportCSV = async () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/crm/leads/export?token=${ApiClient.getToken()}`, '_blank');
  };

  const handleImportCSV = async () => {
    if (!csvContent) return;
    try {
      const res = await ApiClient.post('/crm/leads/import', { csvData: csvContent });
      if (res.success) {
        alert(`Successfully imported ${res.data.importedCount} leads!`);
        setIsImportModalOpen(false);
        setCsvContent('');
        await fetchLeads();
      }
    } catch (err: any) {
      alert(err.message || 'Import failed');
    }
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return <span className="text-xs text-muted">Unscored</span>;
    let bg = 'bg-primary/20 text-primary border-primary/30';
    if (score >= 80) bg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    else if (score < 50) bg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${bg}`}>
        <Sparkles className="w-3 h-3" />
        <span>{score}/100</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads & Account Pipeline</h1>
          <p className="text-xs text-muted">
            Manage prospects, trigger automated AI scoring, and track sales velocity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-border text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-border text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads, companies, emails..."
            className="w-full pl-9 pr-3.5 py-2 bg-background border border-border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-xs text-gray-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="WON">Closed Won</option>
            <option value="LOST">Closed Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-xs text-gray-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-sidebar/50 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="p-3.5 pl-5">Lead / Contact</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Est. Value</th>
                <th className="p-3.5">AI Lead Score</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    Loading CRM leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No leads found matching current criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3.5 pl-5">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="font-bold text-white hover:text-primary transition text-left"
                      >
                        {lead.name}
                      </button>
                      <div className="text-[11px] text-muted">{lead.email || lead.phone || 'No email provided'}</div>
                    </td>
                    <td className="p-3.5 text-gray-300 font-medium">
                      {lead.companyName || lead.company?.name || '—'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/5 border border-border text-gray-200">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[11px] font-bold ${
                          lead.priority === 'URGENT' || lead.priority === 'HIGH'
                            ? 'text-rose-400'
                            : 'text-primary'
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      ${lead.estimatedValue.toLocaleString()}
                    </td>
                    <td className="p-3.5">{getScoreBadge(lead.aiScore)}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleScoreLead(lead.id)}
                          disabled={scoringLeadId === lead.id}
                          title="Run AI Lead Score"
                          className="p-1.5 rounded-lg bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple border border-accent-purple/30 transition disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Details Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-lg bg-card border-l border-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedLead.name}</h2>
                <p className="text-xs text-muted">{selectedLead.companyName || 'Lead Profile'}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1 text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Intelligence Block */}
            <div className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-purple uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Lead Intelligence
                </span>
                <span className="text-sm font-bold text-white">{selectedLead.aiScore || 'N/A'}/100</span>
              </div>

              {selectedLead.aiScoreReason ? (
                <>
                  <p className="text-xs text-gray-200">{selectedLead.aiScoreReason}</p>
                  <div className="p-2.5 rounded bg-background/60 border border-accent-purple/20">
                    <span className="text-[11px] font-bold text-accent-purple uppercase block mb-0.5">Recommended Next Action:</span>
                    <span className="text-xs text-white">{selectedLead.aiRecommendedAction}</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted">
                  AI scoring has not yet run for this lead.
                  <button
                    onClick={() => handleScoreLead(selectedLead.id)}
                    className="mt-2 block px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold"
                  >
                    Compute AI Score
                  </button>
                </div>
              )}
            </div>

            {/* Key Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Account Information</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-background border border-border">
                  <span className="text-muted block text-[11px]">Email</span>
                  <span className="text-white font-medium">{selectedLead.email || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border">
                  <span className="text-muted block text-[11px]">Phone</span>
                  <span className="text-white font-medium">{selectedLead.phone || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border">
                  <span className="text-muted block text-[11px]">Estimated ARR</span>
                  <span className="text-white font-medium">${selectedLead.estimatedValue?.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border">
                  <span className="text-muted block text-[11px]">Status</span>
                  <span className="text-white font-medium">{selectedLead.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-white">Create New Lead</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white"
                  placeholder="e.g. Marcus Vance"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={newLead.companyName}
                    onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white"
                    placeholder="TechFlow Inc"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Est. Value ($)</label>
                  <input
                    type="number"
                    value={newLead.estimatedValue}
                    onChange={(e) => setNewLead({ ...newLead, estimatedValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-white"
                  placeholder="marcus@techflow.io"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition"
              >
                Save Lead to CRM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
