import { createClient, type User, type Session } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  whatsapp_number: string | null;
  updated_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Admin client for server-side operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface Merchant {
  id: string;
  user_id: string;
  merchant_id: string;
  bank_code: string;
  terminal_id: string;
  merchant_name: string;
  merchant_city: string;
  mcc: string;
  country_code: string;
  currency_code: string;
  details_locked: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  payment_status: string;
  last_payment_date: string | null;
  payment_due_time: string | null;
  consecutive_missed_days: number;
  latitude: number | null;
  longitude: number | null;
  last_location_update: string | null;
  referral_code: string | null;
  referral_points: number;
  referred_by_code: string | null;
  sequence: number | null;
}

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
};

export const updateProfile = async (userId: string, profile: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchMerchantDetails = async (userId: string): Promise<Merchant | null> => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  
  // Fallback to first one if no active one found
  if (!data) {
    const { data: first } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    return first;
  }
  
  return data;
};

export const fetchAllMerchants = async (userId: string): Promise<Merchant[]> => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const setActiveMerchant = async (userId: string, merchantId: string): Promise<void> => {
  // 1. Deactivate all
  const { error: deactivateError } = await supabase
    .from('merchants')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (deactivateError) throw deactivateError;

  // 2. Activate the selected one
  const { error: activateError } = await supabase
    .from('merchants')
    .update({ is_active: true })
    .eq('id', merchantId);

  if (activateError) throw activateError;
};

export const upsertMerchantDetails = async (userId: string, details: Partial<Merchant>): Promise<Merchant> => {
  // If this is the first merchant, make it active
  const existing = await fetchAllMerchants(userId);
  const shouldBeActive = existing.length === 0;

  const { data, error } = await supabase
    .from('merchants')
    .upsert({
      user_id: userId,
      ...details,
      is_active: shouldBeActive || details.is_active,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,bank_code'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'failed';

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export interface DbTransaction {
  id: string;
  local_id: string | null;
  merchant_id: string | null;
  reference_no: string;
  invoice_no: string | null;
  amount: number;
  status: string;
  sms_content: string | null;
  qr_payload: string | null;
  created_at: string;
  completed_at: string | null;
  synced_at: string | null;
  tag: string | null;
}

export interface CompletedTransaction {
  id: string;
  local_id: string | null;
  merchant_id: string | null;
  reference_no: string;
  invoice_no: string | null;
  amount: number;
  tag: string | null;
  created_at: string;
  transkey: string | null;
  originalkey: string | null;
  rvslflag: string | null;
  debitcredit: string | null;
}

export interface CancelledTransaction {
  id: string;
  local_id: string | null;
  merchant_id: string | null;
  reference_no: string;
  invoice_no: string | null;
  amount: number;
  tag: string | null;
  created_at: string;
}

export const fetchTransactions = async (merchantId?: string): Promise<DbTransaction[]> => {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (merchantId) {
    query = query.eq('merchant_id', merchantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const fetchCompletedTransactions = async (merchantId?: string): Promise<CompletedTransaction[]> => {
  let query = supabase
    .from('completed_transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (merchantId) {
    query = query.eq('merchant_id', merchantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const fetchCancelledTransactions = async (merchantId?: string): Promise<CancelledTransaction[]> => {
  let query = supabase
    .from('cancelled_transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (merchantId) {
    query = query.eq('merchant_id', merchantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const fetchAllTransactions = async (merchantId?: string) => {
  console.log('fetchAllTransactions: Starting fetch for merchant:', merchantId || 'ALL');
  try {
    const [pending, completed, cancelled] = await Promise.all([
      fetchTransactions(merchantId).then(d => { console.log('fetchAllTransactions: pending success'); return d; }),
      fetchCompletedTransactions(merchantId).then(d => { console.log('fetchAllTransactions: completed success'); return d; }),
      fetchCancelledTransactions(merchantId).then(d => { console.log('fetchAllTransactions: cancelled success'); return d; }),
    ]);

    console.log('fetchAllTransactions: All fetches done', { 
      pending: pending.length, 
      completed: completed.length, 
      cancelled: cancelled.length 
    });

    const mapPending = (t: DbTransaction, idx: number) => ({
      transaction_uuid: `pending-${t.id}-${idx}`,
      transaction_id: t.local_id || t.id.slice(0, 8),
      invoice_number: t.invoice_no || t.reference_no,
      amount: t.amount.toString(),
      currency: 'LKR',
      status: t.status === 'pending' ? 'PENDING' : t.status === 'completed' ? 'SUCCESS' : 'FAILED',
      created_at: t.created_at,
    });

    const mapCompleted = (t: CompletedTransaction, idx: number) => ({
      transaction_uuid: `completed-${t.id}-${idx}`,
      transaction_id: t.local_id || t.id.slice(0, 8),
      invoice_number: t.invoice_no || t.reference_no,
      amount: t.amount.toString(),
      currency: 'LKR',
      status: 'SUCCESS' as const,
      created_at: t.created_at,
    });

    const mapCancelled = (t: CancelledTransaction, idx: number) => ({
      transaction_uuid: `cancelled-${t.id}-${idx}`,
      transaction_id: t.local_id || t.id.slice(0, 8),
      invoice_number: t.invoice_no || t.reference_no,
      amount: t.amount.toString(),
      currency: 'LKR',
      status: 'FAILED' as const,
      created_at: t.created_at,
    });

    // De-duplicate transactions that might be in transition (appearing in both pending and completed/cancelled)
    // We use a Map keyed by reference_no and overwrite pending with more final statuses
    const deduplicated = new Map<string, any>();

    pending.forEach((t, idx) => {
      deduplicated.set(t.reference_no, mapPending(t, idx));
    });
    completed.forEach((t, idx) => {
      deduplicated.set(t.reference_no, mapCompleted(t, idx));
    });
    cancelled.forEach((t, idx) => {
      deduplicated.set(t.reference_no, mapCancelled(t, idx));
    });

    const all = Array.from(deduplicated.values());
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return all;
  } catch (error) {
    console.error('fetchAllTransactions: Error during fetch:', error);
    throw error;
  }
};

export const createTransaction = async (
  amount: number,
  referenceNo: string,
  invoiceNo: string | null,
  merchantId?: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      merchant_id: merchantId,
      reference_no: referenceNo,
      invoice_no: invoiceNo,
      amount: amount,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const completeTransaction = async (
  referenceNo: string,
  verifiedAmount?: number,
  additionalData?: Partial<CompletedTransaction>
) => {
  console.log(`[completeTransaction] Initiating move for ref: ${referenceNo}`);
  const db = supabaseAdmin || supabase; // Fallback to standard if no service key

  // 1. Fetch the pending transaction
  const { data: tx, error: fetchError } = await db
    .from('transactions')
    .select('*')
    .eq('reference_no', referenceNo)
    .single();

  if (fetchError || !tx) {
    if (fetchError?.code === 'PGRST116') {
      console.error(`[completeTransaction] No pending transaction found with reference: ${referenceNo}`);
      throw new Error(`Transaction with reference "${referenceNo}" not found in pending list. Please generate the QR first.`);
    }
    console.error(`[completeTransaction] Fetch failed for ${referenceNo}:`, fetchError);
    throw new Error(fetchError?.message || 'Transaction not found');
  }

  console.log(`[completeTransaction] Found pending transaction (ID: ${tx.id}), moving to completed...`);

  // 2. Insert into completed_transactions
  const { error: insertError } = await db
    .from('completed_transactions')
    .insert({
      merchant_id: tx.merchant_id,
      reference_no: tx.reference_no,
      invoice_no: tx.invoice_no,
      amount: verifiedAmount || tx.amount,
      local_id: tx.local_id,
      tag: tx.tag,
      created_at: tx.created_at, // Preserve original creation time
      ...additionalData
    });

  if (insertError) {
    console.error(`[completeTransaction] Insert failed for ${referenceNo}:`, insertError);
    throw insertError;
  }

  console.log(`[completeTransaction] Successfully inserted into completed_transactions.`);

  // 3. Delete from transactions table
  const { error: deleteError } = await db
    .from('transactions')
    .delete()
    .eq('id', tx.id);

  if (deleteError) {
    console.error(`[completeTransaction] Delete failed for ${referenceNo}:`, deleteError);
    throw deleteError;
  }

  console.log(`[completeTransaction] Successfully deleted from pending transactions. Move complete.`);

  return { success: true, reference_no: referenceNo };
};