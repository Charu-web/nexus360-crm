'use client';

import React, { useState } from 'react';
import { Building2, Search, Plus, Globe, Users } from 'lucide-react';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const companies = [
    { id: '1', name: 'Global Tech Dynamics', domain: 'globaltech.com', industry: 'Enterprise SaaS', employees: '500-1000', location: 'San Francisco, CA' },
    { id: '2', name: 'Chen Capital Partners', domain: 'chencapital.io', industry: 'Financial Services', employees: '50-100', location: 'New York, NY' },
    { id: '3', name: 'Vanguard Robotics', domain: 'vanguardrobotics.de', industry: 'Industrial Automation', employees: '200-500', location: 'Munich, Germany' },
  ];

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Companies & Accounts</h1>
          <p className="text-sm text-muted">Manage target organizations, firmographics, and enterprise accounts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
        <Search className="w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search companies by name, domain, or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-muted"
        />
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs text-muted uppercase font-semibold border-b border-border">
            <tr>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Industry</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3" />
                    <span>{c.domain}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-300">
                  <span className="px-2 py-0.5 rounded text-xs bg-white/5 border border-border">
                    {c.industry}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-muted">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{c.employees}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-muted">{c.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
