import { supabase, supabaseAdmin } from '../lib/supabase';

export interface LeadPayload {
  id?: string;
  tenant_id?: string;
  customer_name: string;
  phone: string;
  email?: string;
  city?: string;
  loan_type?: string;
  amount?: number;
  source?: string;
  status?: string;
  notes?: string;
  assigned_to_id?: string;
  pipeline_id?: string;
  stage_id?: string;
}

export interface CustomerPayload {
  id?: string;
  tenant_id?: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  company?: string;
  status?: string;
  total_deals?: number;
  lifetime_value?: number;
}

export interface DealPayload {
  id?: string;
  tenant_id?: string;
  title: string;
  amount: number;
  pipeline_id?: string;
  stage_id?: string;
  customer_id?: string;
  lead_id?: string;
  status?: string;
  expected_close_date?: string;
  assigned_to_id?: string;
}

export interface TaskPayload {
  id?: string;
  tenant_id?: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_date: string;
  assigned_to_id?: string;
  lead_id?: string;
  deal_id?: string;
}

export interface MeetingPayload {
  id?: string;
  tenant_id?: string;
  title: string;
  description?: string;
  meeting_date: string;
  location?: string;
  status?: string;
  lead_id?: string;
  contact_id?: string;
  deal_id?: string;
  host_id?: string;
}

export class SupabaseDataService {
  // LEADS SERVICES
  static async getLeads(tenantId?: string, search?: string, status?: string) {
    let query = supabase.from('leads').select('*, assigned_to:profiles(id, full_name, email)');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`customer_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createLead(payload: LeadPayload) {
    const { data, error } = await supabase.from('leads').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateLead(id: string, payload: Partial<LeadPayload>) {
    const { data, error } = await supabase.from('leads').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteLead(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // CUSTOMERS SERVICES
  static async getCustomers(tenantId?: string) {
    let query = supabase.from('customers').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createCustomer(payload: CustomerPayload) {
    const { data, error } = await supabase.from('customers').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateCustomer(id: string, payload: Partial<CustomerPayload>) {
    const { data, error } = await supabase.from('customers').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteCustomer(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // DEALS SERVICES
  static async getDeals(tenantId?: string) {
    let query = supabase.from('deals').select('*, stage:pipeline_stages(name, color), assigned_to:profiles(full_name)');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createDeal(payload: DealPayload) {
    const { data, error } = await supabase.from('deals').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateDealStage(id: string, stageId: string, status?: string) {
    const updateData: any = { stage_id: stageId };
    if (status) updateData.status = status;
    const { data, error } = await supabase.from('deals').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteDeal(id: string) {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // TASKS SERVICES
  static async getTasks(tenantId?: string) {
    let query = supabase.from('tasks').select('*, assigned_to:profiles(full_name)');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query.order('due_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async createTask(payload: TaskPayload) {
    const { data, error } = await supabase.from('tasks').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateTaskStatus(id: string, status: string) {
    const { data, error } = await supabase.from('tasks').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // MEETINGS SERVICES
  static async getMeetings(tenantId?: string) {
    let query = supabase.from('meetings').select('*');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query.order('meeting_date', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async createMeeting(payload: MeetingPayload) {
    const { data, error } = await supabase.from('meetings').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  // DASHBOARD STATISTICS
  static async getDashboardStats(tenantId?: string) {
    let leadQuery = supabase.from('leads').select('id, status, amount', { count: 'exact' });
    let dealQuery = supabase.from('deals').select('id, status, amount', { count: 'exact' });
    let taskQuery = supabase.from('tasks').select('id, status', { count: 'exact' });
    let meetingQuery = supabase.from('meetings').select('id, status', { count: 'exact' });

    if (tenantId) {
      leadQuery = leadQuery.eq('tenant_id', tenantId);
      dealQuery = dealQuery.eq('tenant_id', tenantId);
      taskQuery = taskQuery.eq('tenant_id', tenantId);
      meetingQuery = meetingQuery.eq('tenant_id', tenantId);
    }

    const [leadsRes, dealsRes, tasksRes, meetingsRes] = await Promise.all([
      leadQuery,
      dealQuery,
      taskQuery,
      meetingQuery,
    ]);

    const leads = leadsRes.data || [];
    const deals = dealsRes.data || [];
    const tasks = tasksRes.data || [];
    const meetings = meetingsRes.data || [];

    const totalLeads = leadsRes.count || leads.length;
    const newLeads = leads.filter(l => l.status === 'New').length;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;

    const totalDeals = dealsRes.count || deals.length;
    const pipelineValue = deals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    const wonDeals = deals.filter(d => d.status === 'WON').length;
    const lostDeals = deals.filter(d => d.status === 'LOST').length;

    const totalTasks = tasksRes.count || tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const totalMeetings = meetingsRes.count || meetings.length;

    return {
      totalLeads,
      newLeads,
      convertedLeads,
      totalDeals,
      pipelineValue,
      wonDeals,
      lostDeals,
      totalTasks,
      pendingTasks,
      totalMeetings,
    };
  }
}
