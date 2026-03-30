"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Search, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTransactions } from "../../hooks/useTransactions";

export default function TransactionsTable() {
  const { transactions, loading, refresh } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Logic for manual data loading is removed as useTransactions handles it

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const searchMatch = searchTerm === '' ||
        tx.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
      return searchMatch;
    });
  }, [transactions, searchTerm, statusFilter]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'default';
      case 'FAILED': return 'destructive';
      case 'PENDING': return 'secondary';
      default: return 'outline';
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Real-time transaction log.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by amount, invoice..."
                className="pl-9 h-10 border-sidebar-border/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
              disabled={searchTerm === '' && statusFilter === 'ALL'}
              className="h-10"
            >
              Clear
            </Button>
          </div>

          <div className="border border-sidebar-border/30 rounded-xl overflow-hidden bg-sidebar/20">
            <Table>
              <TableHeader className="bg-sidebar/40">
                <TableRow className="border-sidebar-border/30">
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Amount</TableHead>
                  <TableHead className="font-semibold text-foreground">Invoice</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.transaction_uuid} className="border-sidebar-border/20 hover:bg-sidebar/30 transition-colors">
                      <TableCell className="text-muted-foreground">{format(new Date(tx.created_at), 'Pp')}</TableCell>
                      <TableCell className="font-medium">{parseFloat(tx.amount).toFixed(2)} {tx.currency}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.invoice_number}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getStatusVariant(tx.status)} className="rounded-full px-3">{tx.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
