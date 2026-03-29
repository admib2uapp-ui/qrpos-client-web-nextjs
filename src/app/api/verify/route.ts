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
      console.warn('Unauthorized Verification Attempt');
      return NextResponse.json({ status: 'ERROR', message: 'Unauthorized' }, { status: 401 });
    }

    const { reference, status, amount, invoice_number, transkey, originalkey, rvslflag, debitcredit } = data;

    if (status.toLowerCase() !== 'success' && status.toLowerCase() !== 'completed') {
       return NextResponse.json({ status: 'ERROR', message: 'Only successful transactions can be completed' }, { status: 400 });
    }

    // Use unified utility to move record to completed_transactions
    const { completeTransaction } = await import('@/lib/supabase');
    
    try {
      console.log('Attempting to complete transaction for reference:', reference);
      await completeTransaction(reference, parseFloat(amount), {
        local_id: invoice_number,
        transkey,
        originalkey,
        rvslflag,
        debitcredit
      });
      console.log('Transaction completion successful');
    } catch (error: any) {
      console.error('Task move error:', error);
      const isNotFound = error.message?.includes('not found');
      return NextResponse.json(
        { status: 'ERROR', message: isNotFound ? 'Transaction not found' : 'Database error' }, 
        { status: isNotFound ? 404 : 500 }
      );
    }

    return NextResponse.json({ status: 'SUCCESS', message: 'OK' });
  } catch (err: any) {
    console.error('Verification error:', err);
    return NextResponse.json({ status: 'ERROR', message: 'Internal Server Error' }, { status: 500 });
  }
}
