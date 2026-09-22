'use client';

import React, { useState } from 'react';
import { UserSquare2, Search, Plus, Mail, Phone, Building2 } from 'lucide-react';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const contacts = [
    { id: '1', name: 'Dr. Sarah Mitchell', email: 's.mitchell@globaltech.com', phone: '+1 (555) 234-5678', company: 'Global Tech Dynamics', title: 'VP of Engineering' },
    { id: '2', name: 'Marcus Chen', email: 'marcus@chencapital.io', phone: '+1 (555) 876-5432', company: 'Chen Capital Partners', title: 'Managing Director' },
    { id: '3', name: 'Elena Rostova', email: 'elena@vanguardrobotics.de', phone: '+49 30 123456', company: 'Vanguard Robotics', title: 'Head of Operations' },
  ];

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contacts Directory</h1>
          <p className="text-sm text-muted">Manage company contacts, stakeholders, and communication channels.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
        <Search className="w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search contacts by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-muted"
        />
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs text-muted uppercase font-semibold border-b border-border">
            <tr>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span>{c.email}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted" />
                    <span>{c.company}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-muted">{c.title}</td>
                <td className="py-3.5 px-4 text-muted">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{c.phone}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
