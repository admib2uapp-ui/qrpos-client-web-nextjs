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
import { Loader2 } from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import { MOCK_BRANCHES } from "../../lib/mock-data";

export default function SummaryDashboard() {
  const { transactions, loading } = useTransactions();
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
    <div className="space-y-8 animate-in fade-in duration-500">
 

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select range and filters to refine results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <Input
              type="date"
              className="w-full sm:w-[200px]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="hidden sm:inline">-</span>
            <Input
              type="date"
              className="w-full sm:w-[200px]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Branches</SelectItem>
                {MOCK_BRANCHES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); setBranchFilter("ALL"); }}>
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-sidebar/50 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalCount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-sidebar/50 border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction Chart</CardTitle>
            <CardDescription>Performance Overview</CardDescription>
          </div>
          <Select value={chartMode} onValueChange={(v) => setChartMode(v as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Count" />
                <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} name="Amount (LKR)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
