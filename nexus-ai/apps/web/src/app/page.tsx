'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Bot,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { currentOrg } = useAuth();
  const [data, setData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overviewRes, tasksRes] = await Promise.all([
          ApiClient.get('/analytics/overview'),
          ApiClient.get('/crm/tasks?status=TODO'),
        ]);

        if (overviewRes.success) setData(overviewRes.data);
        if (tasksRes.success) setTasks(tasksRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [currentOrg]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-card rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-card rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-card rounded-xl" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalLeads: 0,
    wonLeads: 0,
    conversionRate: 0,
    totalPipelineValue: 0,
    avgAiScore: 0,
    tasksOpen: 0,
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-muted">
            Overview for <span className="text-primary font-semibold">{currentOrg?.name}</span> • Real-time AI Intelligence & Pipeline Analytics
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/crm/leads"
            className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/20 transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Leads</span>
          </Link>
          <Link
            href="/ai/assistant"
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-border text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Bot className="w-3.5 h-3.5 text-accent-purple" />
            <span>AI Copilot</span>
          </Link>
        </div>
      </div>

      {/* AI Dynamic Insights Banner */}
      {data?.aiInsights && data.aiInsights.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-accent-purple/10 via-primary/10 to-transparent border border-accent-purple/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-accent-purple uppercase tracking-wider mb-1">
              Autonomous AI Business Intelligence
            </div>
            <div className="space-y-1">
              {data.aiInsights.map((insight: string, idx: number) => (
                <p key={idx} className="text-xs text-gray-200">
                  • {insight}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted">Pipeline Value</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${metrics.totalPipelineValue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active deals across all stages</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted">Total Leads</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalLeads}</div>
          <div className="mt-1 text-[11px] text-primary font-medium">
            {metrics.qualifiedLeads} Qualified • {metrics.wonLeads} Won
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted">Conversion Rate</span>
            <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.conversionRate}%</div>
          <div className="mt-1 text-[11px] text-muted">Lead to closed-won conversion</div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted">Avg AI Lead Score</span>
            <div className="p-2 rounded-lg bg-accent-amber/10 text-accent-amber">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.avgAiScore}/100</div>
          <div className="mt-1 text-[11px] text-accent-amber font-medium">
            AI-computed intent velocity
          </div>
        </div>
      </div>

      {/* Charts & Tasks Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Funnel Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Lead Pipeline Stages</h3>
            <span className="text-xs text-muted font-medium">Real-time Volume</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.leadFunnel || []}>
                <XAxis dataKey="status" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Open Tasks */}
        <div className="p-5 rounded-xl bg-card border border-border flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Upcoming Tasks</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-muted">
              {tasks.length} Pending
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs text-muted">All caught up! No pending tasks.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-background/50 border border-border/80 hover:border-gray-600 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-white truncate">{task.title}</div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        task.priority === 'HIGH' || task.priority === 'URGENT'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-[11px] text-muted mt-1 line-clamp-1">{task.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
