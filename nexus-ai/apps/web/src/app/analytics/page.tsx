'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, TrendingUp, PieChart as PieIcon, DollarSign, Users, Award } from 'lucide-react';
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

export default function AnalyticsPage() {
  const { currentOrg } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await ApiClient.get('/analytics/overview');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentOrg]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <span>Business Analytics & Performance</span>
        </h1>
        <p className="text-xs text-muted">
          Aggregated database metrics, conversion funnels, and sales channel effectiveness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Pie */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-white mb-4">Lead Source Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.leadSources || []}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.source} (${entry.count})`}
                >
                  {(data?.leadSources || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Velocity Bar */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-bold text-white mb-4">Sales Pipeline Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.leadFunnel || []}>
                <XAxis dataKey="status" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
