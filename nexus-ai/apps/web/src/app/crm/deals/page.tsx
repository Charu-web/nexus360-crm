'use client';

import React from 'react';
import { CircleDollarSign, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DealsPage() {
  const deals = [
    { id: '1', name: 'Global Tech Enterprise License', company: 'Global Tech Dynamics', value: 120000, stage: 'PROPOSAL', probability: '75%', closeDate: '2026-10-15' },
    { id: '2', name: 'Chen Capital Data Intelligence', company: 'Chen Capital Partners', value: 85000, stage: 'NEGOTIATION', probability: '90%', closeDate: '2026-09-30' },
    { id: '3', name: 'Vanguard Industrial Automation', company: 'Vanguard Robotics', value: 45000, stage: 'DISCOVERY', probability: '40%', closeDate: '2026-11-01' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deals & Opportunities</h1>
          <p className="text-sm text-muted">Track revenue pipeline, contract negotiations, and expected close dates.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="text-xs text-muted font-medium">Active Pipeline Value</div>
          <div className="text-2xl font-bold text-white mt-1">$250,000</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="text-xs text-muted font-medium">Weighted Forecast</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">$184,500</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="text-xs text-muted font-medium">Average Deal Size</div>
          <div className="text-2xl font-bold text-accent-purple mt-1">$83,333</div>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs text-muted uppercase font-semibold border-b border-border">
            <tr>
              <th className="py-3 px-4">Deal Name</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Value</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Probability</th>
              <th className="py-3 px-4">Target Close</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map((d) => (
              <tr key={d.id} className="hover:bg-white/5 transition">
                <td className="py-3.5 px-4 font-semibold text-white">{d.name}</td>
                <td className="py-3.5 px-4 text-muted">{d.company}</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400">${d.value.toLocaleString()}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                    {d.stage}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-muted">{d.probability}</td>
                <td className="py-3.5 px-4 text-muted">{d.closeDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
