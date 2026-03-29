"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { QrCode, TrendingUp } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTransactions } from "../../hooks/useTransactions";
import { initiateTransaction } from "../../lib/qrService";
import { isToday } from "date-fns";

const MAX_AMOUNT = 99999999.99;

type Operator = "+" | "-" | "*" | "/" | "%" | null;

const getOperatorSymbol = (op: Operator): string => {
  switch (op) {
    case "+": return "+";
    case "-": return "-";
    case "*": return "×";
    case "/": return "÷";
    case "%": return "%";
    default: return "";
  }
};

export function MobileAmountInput() {
  const auth = useAuth();
  const { transactions } = useTransactions();
  const [displayValue, setDisplayValue] = useState("0");
  const [expression, setExpression] = useState("");
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const [showRefInput, setShowRefInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { todaySalesCount, todaySalesAmount } = useMemo(() => {
    if (!transactions) return { todaySalesCount: 0, todaySalesAmount: 0 };
    const todayTransactions = transactions.filter(t => 
      (t.status === 'SUCCESS' || t.status === 'COMPLETED') && 
      t.created_at && 
      isToday(new Date(t.created_at))
    );
    return {
      todaySalesCount: todayTransactions.length,
      todaySalesAmount: todayTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
    };
  }, [transactions]);

  const calculate = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : 0;
      case "%": return a * (b / 100);
      default: return b;
    }
  };

  const handleDigit = (digit: string) => {
    if (shouldResetDisplay) {
      setDisplayValue(digit);
      setShouldResetDisplay(false);
    } else if (displayValue === "0" && digit !== ".") {
      setDisplayValue(digit);
    } else if (digit === "." && displayValue.includes(".")) {
      return;
    } else {
      const newValue = displayValue + digit;
      const num = parseFloat(newValue);
      if (!isNaN(num) && num <= MAX_AMOUNT) {
        setDisplayValue(newValue);
      }
    }
  };

  const handleOperator = (op: Operator) => {
    const currentValue = parseFloat(displayValue);
    
    if (pendingValue !== null && operator && !shouldResetDisplay) {
      const result = calculate(pendingValue, currentValue, operator);
      setPendingValue(result);
      setDisplayValue(result.toString());
      setExpression(`${result} ${getOperatorSymbol(op)}`);
    } else {
      setPendingValue(currentValue);
      setExpression(`${displayValue} ${getOperatorSymbol(op)}`);
    }
    
    setOperator(op);
    setShouldResetDisplay(true);
  };

  const handleEquals = () => {
    if (pendingValue !== null && operator) {
      const currentValue = parseFloat(displayValue);
      const result = calculate(pendingValue, currentValue, operator);
      
      if (result > MAX_AMOUNT) {
        setDisplayValue(MAX_AMOUNT.toString());
        setExpression(`${pendingValue} ${getOperatorSymbol(operator)} ${currentValue} = ${MAX_AMOUNT}`);
      } else {
        setDisplayValue(result.toString());
        setExpression(`${pendingValue} ${getOperatorSymbol(operator)} ${currentValue} =`);
      }
      
      setPendingValue(null);
      setOperator(null);
      setShouldResetDisplay(true);
    } else if (expression) {
      setExpression("");
    }
  };

  const handlePercent = () => {
    const currentValue = parseFloat(displayValue);
    const percentValue = currentValue / 100;
    setDisplayValue(percentValue.toString());
    setExpression(`${displayValue}%`);
  };

  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplayValue("0.");
      setShouldResetDisplay(false);
    } else if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
    }
  };

  const handleBackspace = () => {
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue("0");
    }
  };

  const handleClear = () => {
    setDisplayValue("0");
    setPendingValue(null);
    setOperator(null);
    setExpression("");
    setShouldResetDisplay(false);
  };

  const handleSubmit = async () => {
    const amountNum = parseFloat(displayValue);
    if (!displayValue || amountNum <= 0 || auth.loading || !auth.user) {
      return;
    }
    setIsSubmitting(true);
    try {
      const referenceNo = await initiateTransaction(amountNum, manualRef || null, auth.user.id);
      router.push(`/mobile/qr?amount=${encodeURIComponent(displayValue)}&ref=${encodeURIComponent(referenceNo)}`);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      router.push(`/mobile/qr?amount=${encodeURIComponent(displayValue)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplay = (value: string) => {
    if (!value || value === "0") return "0.00";
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00";
    const parts = num.toFixed(2).split(".");
    return `${parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${parts[1]}`;
  };

  const renderKey = (label: string, onPress: () => void, style = "") => (
    <button
      onClick={onPress}
      className={`relative flex items-center justify-center h-16 rounded-2xl bg-secondary/30 dark:bg-white/5 backdrop-blur-md border border-border/50 dark:border-white/10 shadow-sm active:scale-95 active:bg-secondary/50 dark:active:bg-white/10 transition-all text-2xl font-medium text-foreground group overflow-hidden ${style}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden font-sans relative">
      {/* Dynamic Background Elements - softer for light mode */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50 dark:opacity-100 transition-opacity">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Header Area / Sales Card */}
      <div className="px-4 pt-2 pb-4 z-10">
         <div className="bg-[#34b4ea] dark:bg-primary rounded-[28px] p-5 shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-1">
               <span className="text-white/80 text-[11px] font-medium tracking-wide">Total Sales Today</span>
               <button 
                  onClick={() => setShowRefInput(!showRefInput)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full px-3 py-1 text-[9px] font-bold text-white uppercase tracking-wider transition-all"
               >
                  {manualRef ? `REF: ${manualRef}` : "Add Ref"}
               </button>
            </div>
            
            <div className="flex items-baseline gap-1.5 mb-1.5">
               <span className="text-white text-3xl font-bold tracking-tight">
                  LKR {Number(todaySalesAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
               </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-medium uppercase tracking-[0.05em]">
               <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,1)]" />
               {todaySalesCount} successful transactions
            </div>
         </div>
      </div>

      {/* Amount Section */}
      <div className="flex-1 flex flex-col justify-center px-6 transition-all duration-500 z-10">
        <div className="text-center relative">
          <div className="flex items-baseline justify-center gap-2 mb-1">
             <span className="text-2xl font-light text-primary/60">LKR</span>
             <span className="text-7xl font-bold tracking-tighter tabular-nums drop-shadow-sm">
                {formatDisplay(displayValue)}
             </span>
          </div>
          {expression && (
            <div className="h-6 text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
              {expression}
            </div>
          )}
          
          {/* Subtle Ref Input */}
          <div className={`mt-4 transition-all duration-300 overflow-hidden ${showRefInput ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
             <input 
               type="text" 
               placeholder="ENTER REFERENCE NO"
               value={manualRef}
               onChange={(e) => setManualRef(e.target.value.toUpperCase())}
               className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-center text-xs font-bold tracking-widest text-primary focus:border-primary/50 focus:bg-secondary outline-none transition-all placeholder:text-muted-foreground/30"
             />
          </div>
        </div>
      </div>

      {/* Keypad Section - reduced padding to hit BottomNav */}
      <div className="px-4 pb-20 space-y-3 z-10 overflow-y-auto">
        <div className="grid grid-cols-4 gap-3">
          {renderKey("C", handleClear, "text-destructive font-bold bg-destructive/5 border-destructive/10")}
          {renderKey("÷", () => handleOperator("/"), "text-primary bg-primary/5 border-primary/10")}
          {renderKey("×", () => handleOperator("*"), "text-primary bg-primary/5 border-primary/10")}
          {renderKey("⌫", handleBackspace, "text-rose-400 bg-rose-400/5 border-rose-400/10")}
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3 grid grid-cols-3 gap-3">
            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map(num => (
              renderKey(num, () => handleDigit(num))
            ))}
            {renderKey(".", handleDecimal)}
            {renderKey("0", () => handleDigit("0"))}
            {renderKey("%", handlePercent, "text-primary/60 text-xl")}
          </div>
          
          <div className="col-span-1 flex flex-col gap-3">
            {renderKey("-", () => handleOperator("-"), "flex-1 text-primary bg-primary/5 border-primary/10")}
            {renderKey("+", () => handleOperator("+"), "flex-1 text-primary bg-primary/5 border-primary/10")}
            <button
              onClick={handleEquals}
              className="flex-1 rounded-2xl bg-primary text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              =
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || parseFloat(displayValue) <= 0}
          className={`w-full h-18 rounded-[24px] flex items-center justify-center gap-3 text-lg font-bold tracking-widest uppercase transition-all shadow-xl ${
            isSubmitting || parseFloat(displayValue) <= 0
              ? "bg-muted text-muted-foreground/30 border border-border/50 cursor-not-allowed"
              : "bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95 active:shadow-none"
          }`}
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <QrCode className="w-6 h-6" />
              Generate QR
            </>
          )}
        </button>
      </div>
    </div>
  );
}