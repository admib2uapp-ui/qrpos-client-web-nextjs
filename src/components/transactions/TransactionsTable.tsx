"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Search, Loader2, Calendar } from "lucide-react";
import { 
  format, 
  subDays, 
  subWeeks, 
  subMonths, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth 
} from 'date-fns';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangePreset, setRangePreset] = useState('ALL');

  const handleRangePreset = (preset: string) => {
    setRangePreset(preset);
    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
      return;
    }

    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'TODAY':
        start = startOfDay(new Date());
        end = endOfDay(new Date());
        break;
      case 'YESTERDAY':
        start = startOfDay(subDays(new Date(), 1));
        end = endOfDay(subDays(new Date(), 1));
        break;
      case 'THIS_WEEK':
        start = startOfWeek(new Date(), { weekStartsOn: 1 });
        end = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case 'LAST_WEEK':
        start = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        end = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        break;
      case 'THIS_MONTH':
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case 'LAST_MONTH':
        start = startOfMonth(subMonths(new Date(), 1));
        end = endOfMonth(subMonths(new Date(), 1));
        break;
    }
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const created = new Date(tx.created_at);
      if (startDate && created < startOfDay(new Date(startDate))) return false;
      if (endDate) {
        const e = endOfDay(new Date(endDate));
        if (created > e) return false;
      }

      const searchMatch = searchTerm === '' ||
        tx.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
      return searchMatch;
    });
  }, [transactions, searchTerm, statusFilter, startDate, endDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'FAILED': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 

      <Card className="glass-card border-primary/10 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">History</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-40">Real-time transaction log.</CardDescription>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{filteredTransactions.length} Entries</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-12 border-primary/10 bg-primary/5 focus-visible:ring-primary/20 transition-all rounded-xl font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-primary/5 p-1 rounded-xl border border-primary/10">
              <Input
                type="date"
                className="h-10 border-none bg-transparent focus-visible:ring-0 text-[10px] sm:text-xs font-black uppercase tracking-tight"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setRangePreset('CUSTOM');
                }}
              />
              <span className="text-muted-foreground/30 text-xs font-bold">to</span>
              <Input
                type="date"
                className="h-10 border-none bg-transparent focus-visible:ring-0 text-[10px] sm:text-xs font-black uppercase tracking-tight"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setRangePreset('CUSTOM');
                }}
              />
            </div>

            <Select value={rangePreset} onValueChange={handleRangePreset}>
              <SelectTrigger className="w-[140px] h-12 border-primary/10 bg-primary/5 focus-visible:ring-primary/20 transition-all font-black text-[10px] uppercase tracking-widest rounded-xl">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Time</SelectItem>
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="YESTERDAY">Yesterday</SelectItem>
                <SelectItem value="THIS_WEEK">This Week</SelectItem>
                <SelectItem value="LAST_WEEK">Last Week</SelectItem>
                <SelectItem value="THIS_MONTH">This Month</SelectItem>
                <SelectItem value="LAST_MONTH">Last Month</SelectItem>
                <SelectItem value="CUSTOM">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-12 border-primary/10 bg-primary/5 focus-visible:ring-primary/20 transition-all font-black text-[10px] uppercase tracking-widest rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => { 
                setSearchTerm(''); 
                setStatusFilter('ALL'); 
                setStartDate(''); 
                setEndDate(''); 
                setRangePreset('ALL');
              }}
              className="h-12 border-primary/10 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all rounded-xl text-muted-foreground"
            >
              Reset
            </Button>
          </div>

          <div className="border border-primary/10 rounded-2xl overflow-hidden bg-primary/5 backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-primary/10">
                <TableRow className="border-primary/10 hover:bg-transparent">
                  <TableHead className="font-black text-primary uppercase tracking-widest text-[10px] py-4">Timestamp</TableHead>
                  <TableHead className="font-black text-primary uppercase tracking-widest text-[10px] py-4">Transaction Details</TableHead>
                  <TableHead className="font-black text-primary uppercase tracking-widest text-[10px] py-4">Invoice ID</TableHead>
                  <TableHead className="text-right font-black text-primary uppercase tracking-widest text-[10px] py-4">Status</TableHead>
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
                    <TableRow key={tx.transaction_uuid} className="border-primary/5 hover:bg-primary/5 transition-all group cursor-default">
                      <TableCell className="text-muted-foreground/70 font-medium py-4">{format(new Date(tx.created_at), 'Pp')}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-foreground group-hover:text-primary transition-colors">LKR {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">Processed: {tx.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold py-4">{tx.invoice_number}</TableCell>
                      <TableCell className="text-right py-4">
                        <Badge variant="outline" className={`rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-2 ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </Badge>
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
