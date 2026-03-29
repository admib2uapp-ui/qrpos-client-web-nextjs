import { createClient, type User, type Session } from '@supabase/supabase-js';

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
}

export const fetchMerchantDetails = async (userId: string): Promise<Merchant | null> => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
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
      reference_number: t.reference_no,
      amount: t.amount.toString(),
      currency: 'LKR',
      status: t.status === 'pending' ? 'PENDING' : t.status === 'completed' ? 'SUCCESS' : 'FAILED',
      created_at: t.created_at,
    });

    const mapCompleted = (t: CompletedTransaction, idx: number) => ({
      transaction_uuid: `completed-${t.id}-${idx}`,
      transaction_id: t.local_id || t.id.slice(0, 8),
      reference_number: t.reference_no,
      amount: t.amount.toString(),
      currency: 'LKR',
      status: 'SUCCESS' as const,
      created_at: t.created_at,
    });

    const mapCancelled = (t: CancelledTransaction, idx: number) => ({
      transaction_uuid: `cancelled-${t.id}-${idx}`,
      transaction_id: t.local_id || t.id.slice(0, 8),
      reference_number: t.reference_no,
      amount: t.amount.toString(),
      currency: 'LKR',
      status: 'FAILED' as const,
      created_at: t.created_at,
    });

    const all = [
      ...pending.map((t, idx) => mapPending(t, idx)),
      ...completed.map((t, idx) => mapCompleted(t, idx)),
      ...cancelled.map((t, idx) => mapCancelled(t, idx)),
    ];

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
  merchantId?: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      merchant_id: merchantId,
      reference_no: referenceNo,
      amount: amount,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};