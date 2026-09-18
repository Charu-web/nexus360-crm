import { supabase } from './supabaseClient';

export interface LeadFilters {
  status?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** RLS already scopes rows to the caller's tenant + role — no manual tenant_id filter needed. */
export async function listLeads(filters: LeadFilters = {}) {
  const { status, assignedToId, search, page = 1, pageSize = 25 } = filters;
  let query = supabase.from('leads').select('*', { count: 'exact' }).eq('is_deleted', false);

  if (status) query = query.eq('status', status);
  if (assignedToId) query = query.eq('assigned_to_id', assignedToId);
  if (search) query = query.or(`customer_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;
  return { leads: data, total: count ?? 0 };
}

export async function createLead(payload: Record<string, unknown>) {
  const { data: auth } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', auth.user!.id).single();
  const { data, error } = await supabase
    .from('leads')
    .insert({ ...payload, tenant_id: profile!.tenant_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase.from('leads').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('leads').update({ is_deleted: true }).eq('id', id);
  if (error) throw error;
}

export function subscribeToLeads(onChange: () => void) {
  return supabase
    .channel('leads-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, onChange)
    .subscribe();
}
