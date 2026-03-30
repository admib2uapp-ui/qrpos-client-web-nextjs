"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { fetchMerchantDetails, fetchAllTransactions } from '../lib/supabase';

export function useTransactions() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (authLoading || !user) return;
    
    setLoading(true);
    setError(null);
    try {
      const merchantData = await fetchMerchantDetails(user.id);
      setMerchant(merchantData);

      if (!merchantData) {
        setData([]);
        setLoading(false);
        return;
      }

      // Transactions are filtered by the merchant row UUID (merchantData.id)
      const transactions = await fetchAllTransactions(merchantData.id);
      setData(transactions);
    } catch (err: any) {
      console.error('useTransactions: Error fetching data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    transactions: data,
    merchant,
    loading: loading || authLoading,
    error,
    refresh: loadData
  };
}
