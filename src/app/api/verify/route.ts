import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyHMAC } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const data = JSON.parse(rawBody);
    
    console.log('Verification Request Received:', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      payload: data
    });

    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader ? authHeader.split(' ')[1] : null;
    const signature = request.headers.get('x-signature');

    const validApiKey = process.env.VERIFICATION_API_KEY || process.env.QR_SERVICE_API_KEY;
    const secret = process.env.QR_SERVICE_SECRET_KEY;

    // 1. Basic API Key Check
    if (!apiKey || apiKey !== validApiKey) {
      console.warn('Unauthorized Verification Attempt: Invalid API Key');
      return NextResponse.json({ status: 'ERROR', message: 'Unauthorized (1)' }, { status: 401 });
    }

    // 2. HMAC Signature Verification
    if (secret) {
        if (!signature) {
            console.warn('Unauthorized Verification Attempt: Missing Signature');
            return NextResponse.json({ status: 'ERROR', message: 'Unauthorized (2)' }, { status: 401 });
        }

        const isSignatureValid = verifyHMAC(rawBody, signature, secret);
        if (!isSignatureValid) {
            console.warn('Unauthorized Verification Attempt: Invalid Signature');
            return NextResponse.json({ status: 'ERROR', message: 'Unauthorized (3)' }, { status: 401 });
        }
        
        console.log('HMAC Signature Verified [SECURE]');
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
