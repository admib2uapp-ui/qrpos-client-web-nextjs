"use client";

import { fetchMerchantDetails } from './supabase';

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
    reference_number: referenceNo || `REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
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

  // The internal API returns the base64 string
  let base64Image = await response.text();
  base64Image = base64Image.trim();
  
  // Remove surrounding quotes if present
  if (base64Image.startsWith('"') && base64Image.endsWith('"')) {
    base64Image = base64Image.slice(1, -1);
  }

  return base64Image;
}
