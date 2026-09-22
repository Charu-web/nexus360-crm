'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Building2, UserPlus, Shield, Mail, Trash2, Crown } from 'lucide-react';

export default function TeamPage() {
  const { currentOrg } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await ApiClient.get('/orgs/members');
      if (res.success) setMembers(res.data);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrg]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const res = await ApiClient.post('/orgs/invite', { email: inviteEmail, role: inviteRole });
      if (res.success) {
        alert(`Invitation dispatched to ${inviteEmail}!`);
        setInviteEmail('');
        await fetchMembers();
      }
    } catch (err: any) {
      alert(err.message || 'Invitation failed');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await ApiClient.patch(`/orgs/members/${userId}/role`, { role: newRole });
      if (res.success) {
        await fetchMembers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <span>Team & Role-Based Access Control</span>
          </h1>
          <p className="text-xs text-muted">
            Manage organization members, assign roles (Owner, Admin, Manager, Employee, Viewer), and invite colleagues.
          </p>
        </div>
      </div>

      {/* Invite Member Box */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          <span>Invite Team Member</span>
        </h3>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
            className="flex-1 px-3.5 py-2 bg-background border border-border rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3.5 py-2 bg-background border border-border rounded-lg text-xs text-gray-300 focus:outline-none"
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition"
          >
            Send Invite
          </button>
        </form>
      </div>

      {/* Members Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-sidebar/50 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="p-3.5 pl-5">Member</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted">Loading team...</td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3.5 pl-5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {m.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span>{m.user?.fullName}</span>
                      {m.role === 'OWNER' && <Crown className="w-3.5 h-3.5 text-accent-amber" />}
                    </td>
                    <td className="p-3.5 text-muted">{m.user?.email}</td>
                    <td className="p-3.5">
                      <select
                        value={m.role}
                        disabled={m.role === 'OWNER'}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                        className="px-2.5 py-1 bg-background border border-border rounded text-xs text-gray-200 focus:outline-none disabled:opacity-50"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </td>
                    <td className="p-3.5 pr-5 text-right text-muted">
                      {m.role === 'OWNER' ? 'Primary' : 'Active'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
