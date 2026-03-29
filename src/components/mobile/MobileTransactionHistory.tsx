"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { useTransactions } from "../../hooks/useTransactions";

type FilterTab = "All" | "Completed" | "Pending" | "Failed";

const FILTER_TABS: FilterTab[] = ["All", "Completed", "Pending", "Failed"];

export function MobileTransactionHistory() {
  const { transactions, loading } = useTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return { icon: "✓", color: "#4CAF50", bgColor: "rgba(76, 175, 80, 0.1)" };
      case "PENDING":
        return { icon: "⏳", color: "#FF9800", bgColor: "rgba(255, 152, 0, 0.1)" };
      case "FAILED":
        return { icon: "✕", color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" };
      default:
        return { icon: "?", color: "#666", bgColor: "rgba(102, 102, 102, 0.1)" };
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    switch (activeFilter) {
      case "Completed":
        filtered = filtered.filter((t) => t.status === "SUCCESS");
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
      const ref = (t.reference_number || "").toLowerCase();
      // Adjusting to match the actual data structure from fetchAllTransactions
      const amtRaw = String(t.amount || "");
      const amtClean = amtRaw.replace(/[,\s]/g, "");
      return ref.includes(q) || amtRaw.includes(q) || amtClean.includes(q);
    });
  }, [transactions, searchQuery, activeFilter]);

  const getTotalSales = () => {
    return filteredTransactions
      .filter((t) => t.status === "SUCCESS")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  const formatAmount = (amount: number) => {
    const numStr = amount.toFixed(2);
    const parts = numStr.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card px-4 py-3 border-b border-border/50 shadow-sm">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Activity</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-card/60 backdrop-blur-sm border-b border-border/40">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 transition-transform"
            >
              <span className="text-muted-foreground font-bold">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-card border-b border-border/40 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all active:scale-95 ${
                activeFilter === tab
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-secondary text-muted-foreground border border-border hover:bg-secondary/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="px-4 py-3">
        <div className="bg-primary rounded-2xl p-4 shadow-lg">
          <p className="text-sm text-white/70">
            {activeFilter === "All" ? "Total Sales" : `${activeFilter} Transactions`}
          </p>
          <p className="text-2xl font-bold text-white">
            LKR {formatAmount(getTotalSales())}
          </p>
          <p className="text-xs text-white/70 mt-1">
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1
              ? "transaction"
              : "transactions"}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3 pt-2">
            {filteredTransactions.map((tx) => {
              const statusConfig = getStatusConfig(tx.status);
              // Ensure we use the correct UUID for key from the database record
              const key = tx.id || tx.transaction_uuid;
              return (
                <div
                  key={key}
                  className="bg-card rounded-xl p-4 shadow-sm border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          borderColor: "rgba(0,0,0,0.05)",
                        }}
                      >
                        <span style={{ color: statusConfig.color }}>
                          {statusConfig.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground tracking-tight">
                          Ref: {tx.reference_number || tx.reference_no}
                        </p>
                        <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-wider">
                          {tx.created_at ? format(new Date(tx.created_at), "MMM dd, yyyy • HH:mm") : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-black tracking-tight ${
                          tx.status === "SUCCESS"
                            ? "text-foreground"
                            : "text-muted-foreground/40"
                        }`}
                      >
                        LKR {formatAmount(parseFloat(tx.amount || 0))}
                      </p>
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10"
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
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
            <p className="text-sm font-mono font-bold tracking-widest uppercase">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
