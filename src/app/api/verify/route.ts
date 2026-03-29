import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Verification Request Received:', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      payload: data
    });

    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader ? authHeader.split(' ')[1] : null;

    // Use a server-side secret for verification
    const validApiKey = process.env.VERIFICATION_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      console.warn('Unauthorized Verification Attempt:', { 
        provided: apiKey ? '***' : 'none', 
        matches: apiKey === validApiKey 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference, status, amount, invoice_number, transkey, originalkey, rvslflag, debitcredit } = data;

    if (status.toLowerCase() !== 'success' && status.toLowerCase() !== 'completed') {
       // If not success, maybe just update status in transactions table?
       // But user said "when verification received... insert to completed_transactions"
       // Usually verification is only sent for successful payments.
       return NextResponse.json({ error: 'Only successful transactions can be completed' }, { status: 400 });
    }

    // Use unified utility to move record to completed_transactions
    const { completeTransaction } = await import('@/lib/supabase');
    
    try {
      console.log('Attempting to complete transaction for reference:', reference);
      const result = await completeTransaction(reference, parseFloat(amount), {
        local_id: invoice_number,
        transkey,
        originalkey,
        rvslflag,
        debitcredit
      });
      console.log('Transaction completion successful:', result);
    } catch (error: any) {
      console.error('Task move error:', error);
      return NextResponse.json({ error: error.message || 'Failed to complete transaction' }, { status: 500 });
    }

    return NextResponse.json({ status: 'SUCCESS', reference });
  } catch (err: any) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
