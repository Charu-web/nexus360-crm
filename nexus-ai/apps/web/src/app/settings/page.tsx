'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Key, Building2, Bell, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, currentOrg } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Organization & Workspace Settings</h1>
        <p className="text-sm text-muted">Manage your organization profile, security configurations, and API keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">General Information</h3>
          <p className="text-xs text-muted">Basic identity and workspace branding details.</p>
        </div>

        <div className="md:col-span-2 p-6 rounded-xl bg-card border border-border space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Organization Name</label>
            <input
              type="text"
              defaultValue={currentOrg?.name || 'NexusAI Enterprise'}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-white text-sm focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Organization Slug</label>
            <input
              type="text"
              disabled
              defaultValue={currentOrg?.slug || 'enterprise-org'}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-muted text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Owner Email</label>
            <input
              type="text"
              disabled
              defaultValue={user?.email || 'owner@nexusai.io'}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-muted text-sm cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition"
            >
              {saved ? <Check className="w-4 h-4 text-white" /> : null}
              <span>{saved ? 'Changes Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">Security & API Keys</h3>
          <p className="text-xs text-muted">Configure external LLM providers and webhook secrets.</p>
        </div>

        <div className="md:col-span-2 p-6 rounded-xl bg-card border border-border space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">NexusAI API Access Token</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value="nx_live_99834892478328947239847239"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-muted text-sm font-mono"
              />
              <button className="px-3 py-2 rounded-lg bg-white/5 border border-border text-xs font-semibold text-white hover:bg-white/10 transition">
                Roll Key
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            Tenant Data Encryption is Active (AES-256 at Rest & TLS in Transit).
          </div>
        </div>
      </div>
    </div>
  );
}
