'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Filter, Clock, User, Globe, AlertCircle } from 'lucide-react';

export default function AuditLogsPage() {
  const { currentOrg } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await ApiClient.get('/audit-logs');
        if (res.success) setLogs(res.data);
      } catch (err) {
        console.error('Audit load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudit();
  }, [currentOrg]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span>Security & Compliance Audit Logs</span>
        </h1>
        <p className="text-xs text-muted">
          Immutable event stream capturing authentications, data mutations, AI invocations, and workflow executions.
        </p>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-sidebar/50 text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="p-3.5 pl-5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Resource</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5 pr-5">IP Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">Loading audit trail...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">No audit events recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3.5 pl-5 text-muted font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">{log.resource}</td>
                    <td className="p-3.5 text-gray-300">{log.user?.fullName || log.user?.email || 'System'}</td>
                    <td className="p-3.5 text-muted">{log.details || '—'}</td>
                    <td className="p-3.5 pr-5 font-mono text-[11px] text-muted">{log.ipAddress || '127.0.0.1'}</td>
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
