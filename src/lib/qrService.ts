"use client";

import { fetchMerchantDetails, supabase, createTransaction } from './supabase';

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
  reference_number: string;
}

/**
 * Generates a unique reference number based on date and counter
 */
export async function generateReferenceNumber(): Promise<string> {
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);
  
  // Use Admin client for reliable counter increment
  const { supabaseAdmin } = await import('./supabase');
  const db = supabaseAdmin || supabase;
  
  const { data: counterData } = await db
    .from('reference_counters')
    .select('counter')
    .eq('date', dateKey)
    .maybeSingle();
  
  let newCounter = 1;
  if (counterData) {
    newCounter = counterData.counter + 1;
    await db
      .from('reference_counters')
      .update({ counter: newCounter })
      .eq('date', dateKey);
  } else {
    await db
      .from('reference_counters')
      .insert({ date: dateKey, counter: 1 });
  }
  
  const MM = (today.getMonth() + 1).toString().padStart(2, '0');
  const DD = today.getDate().toString().padStart(2, '0');
  const sequenceNum = newCounter.toString().padStart(6, '0');
  
  return `${MM}${DD}${sequenceNum}`;
}

/**
 * Initiates a transaction by saving it to Supabase
 */
export async function initiateTransaction(amount: number, manualRef: string | null, userId: string): Promise<string> {
  const merchant = await fetchMerchantDetails(userId);
  if (!merchant) {
    throw new Error('Merchant profile not found');
  }

  const referenceNo = manualRef || await generateReferenceNumber();
  
  // Save to transactions table
  await createTransaction(amount, referenceNo, merchant.id);
  
  return referenceNo;
}

/**
 * Fetches the QR image from the proxy API
 */
export async function generateQRData(amount: string, referenceNo: string, userId: string): Promise<string> {
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
    reference_number: referenceNo
  };

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

  // Normalize the base64 string
  let base64Image = await response.text();
  base64Image = base64Image.trim();
  
  if (base64Image.startsWith('"') && base64Image.endsWith('"')) {
    base64Image = base64Image.slice(1, -1);
  }

  if (base64Image.startsWith('{')) {
    try {
      const parsed = JSON.parse(base64Image);
      base64Image = parsed.base64 || parsed.image || parsed.qr_code || base64Image;
    } catch (e) {
      // Not valid JSON
    }
  }

  return base64Image;
}
