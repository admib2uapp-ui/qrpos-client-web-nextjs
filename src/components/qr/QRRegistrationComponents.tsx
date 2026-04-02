"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format, isToday } from "date-fns";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Loader2,
  AlertCircle,
  Zap,
  Activity
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export function MerchantPulseCard({ transactions }: { transactions: any[] }) {
  const todayTxs = transactions.filter(tx => isToday(new Date(tx.created_at)) && tx.status === 'SUCCESS');
  const todayVolume = todayTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const todayCount = todayTxs.length;

  return (
    <Card className="glass-card overflow-hidden border-primary/5 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Merchant Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider text-nowrap">Today's Volume</p>
          <p className="text-xl font-black text-primary truncate">
             LKR {todayVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="space-y-1 border-l border-primary/10 pl-4">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Tx Count</p>
          <p className="text-xl font-black text-foreground">
            {todayCount}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MerchantMomentumCard({ transactions }: { transactions: any[] }) {
  // Filter for today's successful transactions and sort by time ascending
  const todayTxs = transactions
    .filter(tx => isToday(new Date(tx.created_at)) && tx.status === 'SUCCESS')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const chartData = todayTxs.map(tx => ({
    time: format(new Date(tx.created_at), "HH:mm"),
    amount: Number(tx.amount || 0),
    ref: tx.reference_no
  }));

  return (
    <Card className="glass-card overflow-hidden border-primary/5 bg-primary/5/30 mt-4 h-full flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Today's Transaction Scatter
          </CardTitle>
          <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-tight">
             Velocity View
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <div className="h-[500px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                tickFormatter={(value) => `LKR ${value}`}
                hide
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: '#10b981' }}
                cursor={{ stroke: 'rgba(16,185,129,0.2)', strokeWidth: 2 }}
                formatter={(value: any, name: any, props: any) => [
                  `LKR ${Number(value).toLocaleString()}`, 
                  `Ref: ${props.payload.ref}`
                ]}
              />
              <Line 
                type="linear" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'rgba(0,0,0,0.5)' }}
                activeDot={{ r: 6, fill: '#34d399' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-primary/5 pt-3">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Max Today</p>
            <p className="text-lg font-black text-foreground leading-none mt-1">
              LKR {todayTxs.length > 0 ? Math.max(...todayTxs.map(t => Number(t.amount))).toLocaleString() : '0.00'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider text-nowrap">Avg Ticket Size</p>
            <p className="text-lg font-black text-muted-foreground/80 leading-none mt-1">
              LKR {todayTxs.length > 0 ? (todayTxs.reduce((s,t) => s + Number(t.amount), 0) / todayTxs.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0.00'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveActivityFeed({ transactions }: { transactions: any[] }) {
  // Show the last 5 transactions regardless of status
  const recentPayments = transactions.slice(0, 5);

  return (
    <Card className="glass-card flex flex-col h-full flex-1 overflow-hidden border-primary/10 min-h-[400px]">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
        {recentPayments.length > 0 ? (
          <div className="divide-y divide-primary/5">
            {recentPayments.map((tx, idx) => {
              const isConfirmed = tx.status === 'SUCCESS';
              const isPending = tx.status === 'PENDING' || !tx.status;
              
              return (
                <div key={tx.id || `tx-${idx}`} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors group">
                   <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                       isConfirmed ? "bg-emerald-500/10 border-emerald-500/20" : 
                       isPending ? "bg-amber-500/10 border-amber-500/20" : 
                       "bg-rose-500/10 border-rose-500/20"
                     }`}>
                       {isConfirmed ? (
                         <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       ) : isPending ? (
                         <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                       ) : (
                         <AlertCircle className="w-5 h-5 text-rose-500" />
                       )}
                     </div>
                     <div>
                       <p className="font-black text-foreground leading-tight">LKR {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{tx.reference_no}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-[11px] font-black text-muted-foreground/80">{format(new Date(tx.created_at), 'HH:mm')}</p>
                     <p className={`text-[9px] font-bold uppercase ${
                       isConfirmed ? "text-emerald-500/70" : 
                       isPending ? "text-amber-500/70" : 
                       "text-rose-500/70"
                     }`}>
                       {tx.status || 'Pending'}
                     </p>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
            <Calendar className="w-12 h-12 mb-3" />
            <p className="text-sm font-bold uppercase tracking-widest">No activity today yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
