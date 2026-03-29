import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader ? authHeader.split(' ')[1] : null;

    // Use a server-side secret for verification
    const validApiKey = process.env.VERIFICATION_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference, status, amount, invoice_number } = data;

    // Update the transaction in the database
    const { error } = await supabase
      .from('transactions') // Assuming you want to update the 'transactions' table
      .update({ 
        status: status.toLowerCase(),
        amount: amount,
        reference_no: reference
      })
      .eq('reference_no', reference);

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ status: 'SUCCESS', reference });
  } catch (err: any) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
