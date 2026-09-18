import { supabase } from './supabaseClient';

/** Step 1 of signup: create the Supabase Auth user (no tenant yet). */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Step 2 of signup (call immediately after signUp, while the session is
 * active): provisions a brand-new tenant + default roles/pipeline and
 * attaches the current user as that tenant's ADMIN.
 * See migration 0013_rpc_functions.sql -> complete_signup_provisioning().
 */
export async function provisionTenant(tenantName: string, slug: string, fullName: string) {
  const { data, error } = await supabase.rpc('complete_signup_provisioning', {
    p_tenant_name: tenantName,
    p_slug: slug,
    p_full_name: fullName,
  });
  if (error) throw error;
  return data as string; // new tenant id
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/** Current user's profile row (tenant, role, name, etc.) */
export async function getCurrentProfile() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*, role:roles(name, permissions), tenant:tenants(name, slug, status)')
    .eq('id', auth.user.id)
    .single();
  if (error) throw error;
  return data;
}
