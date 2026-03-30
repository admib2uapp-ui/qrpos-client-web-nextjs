"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { useTransactions } from "../../hooks/useTransactions";
import { Building2 } from "lucide-react";
import { BANK_NAMES } from "../../lib/constants";

type FilterTab = "All" | "Completed" | "Pending" | "Failed";

const FILTER_TABS: FilterTab[] = ["All", "Completed", "Pending", "Failed"];

export function MobileTransactionHistory() {
  const { transactions, merchant, loading } = useTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "COMPLETED":
        return { icon: "✓", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" };
      case "PENDING":
        return { icon: "⏳", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)" };
      case "FAILED":
        return { icon: "✕", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" };
      default:
        return { icon: "?", color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)" };
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions || [];

    switch (activeFilter) {
      case "Completed":
        filtered = filtered.filter((t) => t.status === "SUCCESS" || t.status === "COMPLETED");
        break;
      case "Pending":
        filtered = filtered.filter((t) => t.status === "PENDING");
        break;
      case "Failed":
        filtered = filtered.filter((t) => t.status === "FAILED");
        break;
      case "All":
      default:
        break;
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return filtered;

    return filtered.filter((t) => {
      const ref = (t.reference_number || t.reference_no || "").toLowerCase();
      const amtRaw = String(t.amount || "");
      const amtClean = amtRaw.replace(/[,\s]/g, "");
      return ref.includes(q) || amtRaw.includes(q) || amtClean.includes(q);
    });
  }, [transactions, searchQuery, activeFilter]);

  const getTotalSales = () => {
    return filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300">

      {/* Active Merchant Header */}
      <div className="px-[4vw] py-[1.2vh] bg-card/10 border-b border-border/10 flex items-center gap-[3vw]">
        <div className="p-[2.5vw] rounded-[3vw] bg-primary/10">
          <Building2 className="w-[5vw] h-[5vw] text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-[3.5vw] sm:text-sm font-black text-foreground">
            {merchant?.merchant_name || 'No Active Merchant'}
          </span>
          <span className="text-[2.2vw] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            {merchant ? (BANK_NAMES[merchant.bank_code] || merchant.bank_code) : 'Waiting for profile...'}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-[4vw] py-[1.2vh] bg-card/30 backdrop-blur-sm border-b border-border/20">
        <div className="relative group">
          <Search className="absolute left-[3vw] top-1/2 -translate-y-1/2 w-[4.5vw] h-[4.5vw] max-w-[20px] max-h-[20px] text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-[12vw] max-h-[50px] pl-[10vw] pr-[10vw] rounded-[3vw] border border-border bg-secondary/30 text-foreground text-[3.5vw] sm:text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground/40"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-[3vw] top-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 transition-transform"
            >
              <div className="w-[6vw] h-[6vw] flex items-center justify-center rounded-full bg-muted/50">
                <span className="text-[3vw] text-muted-foreground font-black">✕</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-[4vw] py-[1vh] bg-card/20 border-b border-border/10 overflow-hidden">
        <div className="flex gap-[2vw] overflow-x-auto pb-[0.5vh] scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-[5vw] py-[2.5vw] rounded-full text-[2.8vw] sm:text-xs font-black tracking-widest whitespace-nowrap transition-all active:scale-95 uppercase ${
                activeFilter === tab
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-secondary/50 text-muted-foreground/60 border border-border/50 hover:bg-secondary/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card - Matching Calculator Style */}
      <div className="px-[4vw] py-[1vh]">
        <div className="bg-[#34b4ea] dark:bg-primary rounded-[6vw] px-[5vw] py-[3.5vw] shadow-xl shadow-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-white/10 skew-x-[-20deg] translate-x-[20%] transition-transform group-hover:translate-x-[10%]" />
          <p className="text-[2.8vw] sm:text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] mb-[0.5vw]">
            {activeFilter === "All" ? "Total Sales Volume" : `${activeFilter} Summary`}
          </p>
          <div className="flex items-baseline gap-[2vw]">
            <span className="text-[8vw] sm:text-4xl font-black text-white tracking-tighter">
              LKR {formatAmount(getTotalSales())}
            </span>
          </div>
          <p className="text-[2.5vw] sm:text-[10px] font-black text-white/50 uppercase tracking-widest mt-[0.5vw]">
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1
              ? "transaction record"
              : "transaction records"}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-auto px-[4vw] pb-[min(22vw,88px)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-[10vh] gap-[4vw]">
            <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[2.8vw] sm:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Synching with blockchain...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-[2vw] pt-[0.5vh]">
            {filteredTransactions.map((tx) => {
              const statusConfig = getStatusConfig(tx.status);
              const key = tx.id || tx.transaction_uuid;
              return (
                <div
                  key={key}
                  className="bg-card/40 hover:bg-card/60 rounded-[4vw] p-[3vw] shadow-sm border border-border/30 backdrop-blur-sm transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[3vw]">
                      <div
                        className="w-[11vw] h-[11vw] max-w-[48px] max-h-[48px] rounded-[3vw] flex items-center justify-center border shadow-inner"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          borderColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        <span className="text-[5vw] sm:text-xl" style={{ color: statusConfig.color }}>
                          {statusConfig.icon}
                        </span>
                      </div>
                      <div className="flex flex-col gap-[0.5vw]">
                        <p className="text-[3.5vw] sm:text-sm font-black text-foreground tracking-tight underline decoration-muted-foreground/10">
                          REF: {tx.reference_number || tx.reference_no}
                        </p>
                        <p className="text-[2.2vw] sm:text-[9px] uppercase font-black text-muted-foreground/40 tracking-wider">
                          {tx.created_at ? format(new Date(tx.created_at), "MMM dd, HH:mm:ss") : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-[4vw] sm:text-base font-black tracking-tight ${
                          tx.status === "SUCCESS" || tx.status === "COMPLETED"
                            ? "text-foreground"
                            : "text-muted-foreground/30"
                        }`}
                      >
                        LKR {formatAmount(parseFloat(tx.amount || 0))}
                      </p>
                      <span
                        className="inline-block px-[2vw] py-[0.5vw] rounded-full text-[2vw] sm:text-[8px] font-black uppercase tracking-[0.2em] border border-white/5 opacity-80"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-[10vh] text-muted-foreground opacity-30">
            <Search className="w-[12vw] h-[12vw] mb-[3vw]" />
            <p className="text-[3vw] sm:text-xs font-black font-mono tracking-[0.4em] uppercase">No logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
