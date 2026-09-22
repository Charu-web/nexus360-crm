'use client';

import React from 'react';
import Link from 'next/link';
import { Users, UserSquare2, Building2, CircleDollarSign, ArrowRight } from 'lucide-react';

export default function CRMHubPage() {
  const crmSections = [
    {
      title: 'Leads & Pipeline',
      description: 'Manage incoming leads, AI predictive scoring, stages, and deal conversions.',
      href: '/crm/leads',
      icon: Users,
      badge: 'Core Pipeline',
    },
    {
      title: 'Contacts Directory',
      description: 'Unified address book with stakeholder emails, phone numbers, and engagement history.',
      href: '/crm/contacts',
      icon: UserSquare2,
      badge: 'Stakeholders',
    },
    {
      title: 'Accounts & Companies',
      description: 'Corporate client accounts, domain enrichment, employee sizes, and revenue metrics.',
      href: '/crm/companies',
      icon: Building2,
      badge: 'Organizations',
    },
    {
      title: 'Deals & Revenue',
      description: 'Active revenue opportunities, proposal values, expected close dates, and win probabilities.',
      href: '/crm/deals',
      icon: CircleDollarSign,
      badge: 'Revenue',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">CRM & Pipeline Hub</h1>
        <p className="text-sm text-muted">Manage your end-to-end sales lifecycle, contacts, companies, and deals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crmSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.href}
              href={sec.href}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-border text-muted font-medium">
                    {sec.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-primary transition">{sec.title}</h3>
                <p className="text-sm text-muted mt-1 leading-relaxed">{sec.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-primary mt-6 group-hover:translate-x-1 transition">
                <span>Open Section</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
