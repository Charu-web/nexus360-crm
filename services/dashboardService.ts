import { supabase } from './supabaseClient';

export interface DashboardStats {
  total_leads: number;
  new_leads: number;
  converted_leads: number;
  total_deals: number;
  open_pipeline_value: number;
  won_deals: number;
  lost_deals: number;
  won_value: number;
  total_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  upcoming_meetings: number;
  recent_activities: Array<{ id: string; title: string; type: string; created_at: string }>;
}

/** Server-computed, RLS-scoped — see get_dashboard_stats() in 0013_rpc_functions.sql */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc('get_dashboard_stats');
  if (error) throw error;
  return data as DashboardStats;
}
