'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Workflow, Play, Plus, Clock, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

export default function WorkflowsPage() {
  const { currentOrg } = useAuth();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      const res = await ApiClient.get('/workflows');
      if (res.success) setWorkflows(res.data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [currentOrg]);

  const handleExecute = async (id: string) => {
    setExecutingId(id);
    try {
      const res = await ApiClient.post(`/workflows/${id}/execute`, {
        triggerData: {
          leadId: 'demo-lead-id',
          name: 'Marcus Vance',
          companyName: 'TechFlow Cloud Inc',
          estimatedValue: 75000,
        },
      });
      if (res.success) {
        alert('Workflow execution completed successfully! Check execution logs.');
        await fetchWorkflows();
      }
    } catch (err: any) {
      alert(err.message || 'Execution error');
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-6 h-6 text-accent-purple" />
            <span>AI Workflow Automation Engine</span>
          </h1>
          <p className="text-xs text-muted">
            Build event-driven autonomous business logic combining AI analysis, conditional logic, and CRM actions.
          </p>
        </div>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="p-8 text-center text-muted">No workflows configured.</div>
        ) : (
          workflows.map((wf) => (
            <div key={wf.id} className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent-purple/20 text-accent-purple">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{wf.name}</h3>
                    <p className="text-xs text-muted">{wf.description || 'Event-driven automated pipeline'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted font-medium">
                    {wf._count?.executions || wf.executionCount || 0} Executions
                  </span>
                  <button
                    onClick={() => handleExecute(wf.id)}
                    disabled={executingId === wf.id}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{executingId === wf.id ? 'Running...' : 'Test Run'}</span>
                  </button>
                </div>
              </div>

              {/* Visual Node Chain */}
              <div className="p-4 rounded-xl bg-background border border-border/80 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-[600px] text-xs">
                  {Array.isArray(wf.nodes) &&
                    wf.nodes.map((node: any, idx: number) => (
                      <React.Fragment key={idx}>
                        <div
                          className={`px-3 py-2 rounded-lg font-semibold border ${
                            node.type === 'TRIGGER'
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : node.type === 'CONDITION'
                              ? 'bg-accent-amber/20 text-accent-amber border-accent-amber/30'
                              : 'bg-accent-purple/20 text-accent-purple border-accent-purple/30'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold block opacity-70 mb-0.5">
                            {node.type}
                          </span>
                          <span>{node.label}</span>
                        </div>
                        {idx < wf.nodes.length - 1 && <ArrowRight className="w-4 h-4 text-muted shrink-0" />}
                      </React.Fragment>
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
