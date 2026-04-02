"use client";

import { fetchMerchantDetails, supabase, createTransaction, DbTransaction } from './supabase';

export interface QRRequestPayload {
  merchant_id: string;
  amount: string;
  merchant_name: string;
  merchant_city: string;
  mcc: string;
  currency_code: string;
  country_code: string;
  bank_code: string;
  terminal_id: string;
  invoice_number?: string;
  reference_number?: string;
  callback_url?: string;
}

/**
 * Generates a unique reference number based on date and counter
 */
/**
 * Generates a high-fidelity 16-digit reference number:
 * 1. Day of Year (3 digits, 001-366)
 * 2. Merchant Sequence (8 digits)
 * 3. Daily Transaction Counter (5 digits)
 */
export async function generate16DigitReference(merchantId: string, merchantSequence: number | null): Promise<string> {
  const now = new Date();
  
  // 1. Day of Year (3 digits)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay).toString().padStart(3, '0');

  // 2. Merchant Sequence (8 digits)
  const mSeq = (merchantSequence || 0).toString().slice(0, 8).padStart(8, '0');

  // 3. Daily Transaction Counter (5 digits)
  const dateKey = now.toISOString().slice(0, 10);
  
  // Use the ATOMIC RPC to avoid race conditions and duplicates
  // This requires the 'increment_daily_counter' function to be defined in Supabase
  const { data: newCounter, error } = await supabase.rpc('increment_daily_counter', { 
    p_merchant_id: merchantId,
    p_date_key: dateKey 
  });
  
  if (error || !newCounter) {
    console.error("RPC Error:", error);
    // If RPC is missing, this is the first day it's used. Provide a helpful error.
    throw new Error('Failed to increment daily sequence. Ensure SQL migration was applied.');
  }

  const tSeq = newCounter.toString().slice(0, 5).padStart(5, '0');

  return `${dayOfYear}${mSeq}${tSeq}`;
}

export async function generateReferenceNumber(): Promise<string> {
  // Legacy fallback or standard random id
  return Math.random().toString(36).slice(2, 10).toUpperCase() + Date.now().toString().slice(-8);
}

/**
 * Initiates a transaction by saving it to Supabase
 */
export async function initiateTransaction(amount: number, manualRef: string | null, userId: string): Promise<DbTransaction> {
  const merchant = await fetchMerchantDetails(userId);
  if (!merchant) {
    throw new Error('Merchant profile not found');
  }

  // If user didn't enter an invoice number, generate the high-fidelity 16-digit reference
  let finalReference: string;
  if (!manualRef) {
    finalReference = await generate16DigitReference(merchant.id, merchant.sequence);
  } else {
    finalReference = await generateReferenceNumber(); // Fallback to standard random ID as unique ref
  }
  
  // Save to transactions table
  const transaction = await createTransaction(amount, finalReference, manualRef, merchant.id);
  
  return transaction;
}

/**
 * Fetches the QR image from the proxy API
 */
export async function generateQRData(amount: string, transaction: DbTransaction, userId: string): Promise<{ image: string; reference: string }> {
  // 1. Fetch merchant details
  const merchant = await fetchMerchantDetails(userId);
  if (!merchant) {
    throw new Error('Merchant not found for this user');
  }

  // 2. Prepare payload
  const payload: QRRequestPayload = {
    merchant_id: merchant.merchant_id,
    amount: parseFloat(amount).toFixed(2),
    merchant_name: merchant.merchant_name,
    merchant_city: merchant.merchant_city,
    mcc: merchant.mcc || '5999',
    currency_code: merchant.currency_code || '144',
    country_code: merchant.country_code || 'LK',
    bank_code: merchant.bank_code,
    terminal_id: merchant.terminal_id,
    callback_url: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/verify' 
      : 'https://qrpos-nextjs.vercel.app/api/verify'
  };

  // Logic: XOR payload - only one of invoice_number or reference_number is sent
  if (transaction.invoice_no) {
    payload.invoice_number = transaction.invoice_no;
    // Omit reference_number entirely
  } else {
    payload.reference_number = transaction.reference_no; // This is the 16-digit ID
    // Omit invoice_number entirely
  }

  // 3. Call the INTERNAL API proxy
  const response = await fetch('/api/qr/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `QR Generation failed: ${response.status}`);
  }

  // 4. Parse the JSON response
  const data = await response.json();
  const { image, reference } = data;

  // 5. If the worker returned a new reference number, update the transaction record
  if (reference && reference !== transaction.reference_no) {
    await supabase
      .from('transactions')
      .update({ reference_no: reference })
      .eq('id', transaction.id);
  }

  return { image, reference: reference || transaction.reference_no };
}
