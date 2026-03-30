"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ResponsiveContainer,
  ComposedChart
} from "recharts";
import { Loader2, Building2 } from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import { BANK_NAMES } from "../../lib/constants";
import { MOCK_BRANCHES } from "../../lib/mock-data";

export default function SummaryDashboard() {
  const { transactions, merchant, loading } = useTransactions();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartMode, setChartMode] = useState<"monthly" | "daily">("monthly");
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Logic for manual data loading is removed as useTransactions handles it

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const created = new Date(tx.created_at);
      if (startDate && created < new Date(startDate)) return false;
      if (endDate) {
        const e = new Date(endDate);
        e.setDate(e.getDate() + 1);
        if (created >= e) return false;
      }
      if (tx.status !== 'SUCCESS') return false;
      // Since we don't have real branch data in transactions yet, 
      // branch filter might not work with real data unless added to the table
      if (branchFilter !== 'ALL' && tx.branchId !== branchFilter) return false;
      return true;
    });
  }, [transactions, startDate, endDate, branchFilter]);

  const monthMap: Record<string, { count: number; amount: number }> = {};
  filteredTransactions.forEach((tx) => {
    const date = new Date(tx.created_at);
    const monthName = date.toLocaleString('default', { month: 'short' });
    if (!monthMap[monthName]) monthMap[monthName] = { count: 0, amount: 0 };
    monthMap[monthName].count += 1;
    monthMap[monthName].amount += Number(tx.amount) || 0;
  });

  const chartData = Object.keys(monthMap)
    .map((name) => ({ name, ...monthMap[name] }))
    .sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.name) - months.indexOf(b.name);
    });

  const totalCount = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  return (
    <div className="space-y-[4vw] sm:space-y-8 animate-in fade-in duration-500 pb-[10vw] sm:pb-0">
      <Card className="rounded-[4vw] sm:rounded-xl overflow-hidden border-border/40 shadow-sm">
        <CardHeader className="p-[5vw] sm:p-6">
          <CardTitle className="text-[5vw] sm:text-xl font-black tracking-tight underline decoration-primary/20">Dashboard Filters</CardTitle>
          <CardDescription className="text-[3vw] sm:text-sm uppercase tracking-widest font-bold opacity-50">Refine your transaction analytics.</CardDescription>
        </CardHeader>
        <CardContent className="px-[4vw] py-[3vw] sm:p-6 space-y-[4vw] sm:space-y-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-[3vw] sm:gap-4">
            <Input
              type="date"
              className="w-full sm:w-[200px] h-[12vw] sm:h-10 rounded-[2.5vw] sm:rounded-md text-[3.5vw] sm:text-sm font-bold bg-secondary/30"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="hidden sm:inline text-muted-foreground">-</span>
            <Input
              type="date"
              className="w-full sm:w-[200px] h-[12vw] sm:h-10 rounded-[2.5vw] sm:rounded-md text-[3.5vw] sm:text-sm font-bold bg-secondary/30"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="flex-1 min-w-[200px] h-[12vw] sm:h-10 rounded-[2.5vw] sm:rounded-md bg-secondary/10 border border-border/20 px-4 flex items-center gap-3">
              <Building2 className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-[3vw] sm:text-sm font-black text-foreground truncate">
                  {merchant?.merchant_name || 'No Active Merchant'}
                </span>
                <span className="text-[2.2vw] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  {merchant ? (BANK_NAMES[merchant.bank_code] || merchant.bank_code) : 'N/A'}
                </span>
              </div>
            </div>
            <Button 
                variant="outline" 
                onClick={() => { setStartDate(""); setEndDate(""); setBranchFilter("ALL"); }}
                className="w-full sm:w-auto h-[10vw] sm:h-9 text-[3vw] sm:text-xs font-black uppercase tracking-widest rounded-full"
            >
              Reset Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vw] sm:gap-4">
            <div className="bg-[#34b4ea] dark:bg-primary rounded-[4vw] sm:rounded-xl px-[4vw] py-[3vw] sm:p-6 shadow-xl shadow-primary/10 relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <p className="text-[2.8vw] sm:text-xs font-bold text-white/70 uppercase tracking-[0.2em] mb-[0.5vw]">Volume</p>
               <p className="text-[8vw] sm:text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
                 {totalCount.toLocaleString()}
               </p>
               <p className="text-[2.2vw] sm:text-[10px] font-black text-white/40 uppercase tracking-widest mt-[0.5vw]">Verified Transactions</p>
            </div>
            <div className="bg-secondary/30 dark:bg-card border border-border/40 rounded-[4vw] sm:rounded-xl px-[4vw] py-[3vw] sm:p-6 shadow-sm">
               <p className="text-[2.8vw] sm:text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-[0.5vw]">Value</p>
               <p className="text-[8vw] sm:text-3xl font-black text-primary tracking-tighter tabular-nums leading-none">
                 LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
               </p>
               <p className="text-[2.2vw] sm:text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mt-[0.5vw]">Total Settlement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-[4vw] py-[3vw] sm:p-6 pb-0 sm:pb-4 border-b border-sidebar-border/20">
          <div className="space-y-[1vw] sm:space-y-1">
            <CardTitle className="text-[5vw] sm:text-xl font-black tracking-tight underline decoration-emerald-500/20">Performance Chart</CardTitle>
            <CardDescription className="text-[2.5vw] sm:text-xs uppercase tracking-widest font-bold opacity-40">Monthly Volume Analytics</CardDescription>
          </div>
          <Select value={chartMode} onValueChange={(v) => setChartMode(v as any)}>
            <SelectTrigger className="w-[30vw] sm:w-[120px] h-[8vw] sm:h-9 rounded-[2vw] sm:rounded-md text-[2.5vw] sm:text-xs font-bold bg-secondary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-[5vw] sm:p-6 pt-0 sm:pt-0">
          <div className="h-[30vh] min-h-[220px] max-h-[350px] w-full sm:pt-4">
            <ResponsiveContainer width="100%" height="100%" minHeight={200} debounce={50}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: '2.5vw' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: '2.5vw' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: '2.5vw' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', padding: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar yAxisId="left" dataKey="count" fill="#34b4ea" radius={[6, 6, 0, 0]} name="Count" />
                <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Value" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
