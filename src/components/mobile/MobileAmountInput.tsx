"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calculator, LayoutGrid, Grid3X3, ArrowRight, Wallet, History, Info, QrCode, TrendingUp } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTransactions } from "../../hooks/useTransactions";
import { initiateTransaction } from "../../lib/qrService";
import { isToday } from "date-fns";

const MAX_AMOUNT = 500000.00;

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
  const [isCalculatorMode, setIsCalculatorMode] = useState(true);
  const [displayValue, setDisplayValue] = useState("0");
  const [expression, setExpression] = useState("");
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const [showRefInput, setShowRefInput] = useState(false);
  const [focusedField, setFocusedField] = useState<'amount' | 'ref'>('amount');
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
    if (focusedField === 'ref') {
      const newVal = (manualRef + digit).toUpperCase();
      if (newVal.length <= 15) setManualRef(newVal);
      return;
    }

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
      setExpression((prev) => `${prev} ${displayValue} ${getOperatorSymbol(op)}`);
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
        setExpression((prev) => `${prev} ${displayValue} =`);
      } else {
        setDisplayValue(result.toString());
        setExpression((prev) => `${prev} ${displayValue} =`);
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
    if (focusedField === 'ref') {
      setManualRef(prev => prev.slice(0, -1));
      return;
    }

    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue("0");
    }
  };

  const handleClear = () => {
    if (focusedField === 'ref') {
      setManualRef("");
      return;
    }
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

  const renderKey = (label: string, onPress: () => void, style = "", key?: string | number) => (
    <button
      key={key}
      onClick={onPress}
      className={`relative flex items-center justify-center rounded-2xl bg-secondary/30 dark:bg-white/5 backdrop-blur-md border border-border/50 dark:border-white/10 shadow-sm active:scale-95 active:bg-secondary/50 dark:active:bg-white/10 transition-all group overflow-hidden ${style}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden font-sans relative transition-colors duration-300">
      {/* Dynamic Background Elements - softer for light mode */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50 dark:opacity-100 transition-opacity">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Header Area / Sales Card */}
      <div className="px-[4vw] pt-[1vh] pb-[1vh] z-10 shrink-0">
         <div className="bg-[#34b4ea] dark:bg-primary rounded-[6vw] px-[5vw] py-[3.5vw] shadow-lg shadow-primary/10 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-start mb-[0.5vw]">
               <span className="text-white/80 text-[2.8vw] sm:text-xs font-medium tracking-wide">Total Sales Today</span>
            </div>
            
            <div className="flex items-baseline gap-[1.5vw] mb-[0.5vw]">
               <span className="text-white text-[8vw] sm:text-4xl font-bold tracking-tight">
                  LKR {Number(todaySalesAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
               </span>
            </div>
            
            <div className="flex items-center gap-[1.5vw] text-white/70 text-[2.5vw] sm:text-[10px] font-medium uppercase tracking-[0.05em]">
               <div className="w-[1.2vw] h-[1.2vw] max-w-[6px] max-h-[6px] bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,1)]" />
               {todaySalesCount} successful transactions
            </div>
         </div>
      </div>

      {/* Amount Section - Aligned with Card Width */}
      <div 
        className="px-[4vw] flex-1 flex flex-col justify-center transition-all duration-500 z-10 min-h-[15vh]"
        onClick={() => setFocusedField('amount')}
      >
        <div className={`text-center relative py-[4vw] px-[2vw] rounded-[6vw] transition-all duration-300 ${focusedField === 'amount' ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}>
          <div className="flex items-baseline justify-center gap-[2vw] mb-[0.5vh]">
             <span className="text-[4vw] sm:text-2xl font-light text-primary/60">LKR</span>
             <span className="text-[16vw] sm:text-8xl font-bold tracking-tighter tabular-nums drop-shadow-sm leading-none">
                {formatDisplay(displayValue)}
             </span>
          </div>
          {expression && (
            <div className="h-[3vh] text-[4vw] sm:text-lg font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
              {expression}
            </div>
          )}
          
          {/* Compressed Ref Input - Use stopPropagation to ensure focus remains here when clicking inside */}
          <div 
            className={`mt-[1vh] transition-all duration-300 overflow-hidden ${showRefInput ? "max-h-[8vh] opacity-100" : "max-h-0 opacity-0"}`}
            onClick={(e) => e.stopPropagation()} 
          >
             <input 
               type="text" 
               placeholder="ENTER REFERENCE NO"
               value={manualRef}
               onChange={(e) => setManualRef(e.target.value.toUpperCase())}
               className={`w-full bg-secondary/50 border rounded-xl px-4 py-[1.2vh] text-center text-[2.8vw] sm:text-[10px] font-bold tracking-widest text-primary focus:bg-secondary outline-none transition-all placeholder:text-muted-foreground/30 ${focusedField === 'ref' ? "border-primary ring-2 ring-primary/40 shadow-sm" : "border-border"}`}
               onFocus={() => setFocusedField('ref')}
             />
          </div>
        </div>
      </div>

      {/* Keypad Section - Dynamic Layouts */}
      <div className="px-[3vw] pb-[min(22vw,88px)] space-y-[2vw] z-20 transition-all duration-300 min-h-[min(45vh,420px)] flex flex-col justify-end">
        {/* Keypad Mode Toggle & Ref Button - Icon only for minimal width and zero overlap */}
        <div className="flex justify-between items-center mb-[0.8vh]">
          <button 
            onClick={() => setShowRefInput(!showRefInput)}
            className="bg-secondary/20 dark:bg-white/5 backdrop-blur-md rounded-full px-[3vw] py-[1.2vw] text-[2.5vw] sm:text-[10px] font-bold text-primary uppercase tracking-wider transition-all border border-border/20 shadow-sm"
          >
            {manualRef ? `REF: ${manualRef}` : "+ ADD REF"}
          </button>

          <div className="bg-secondary/20 dark:bg-white/5 p-[0.6vw] rounded-full flex gap-[1vw] border border-border/20 backdrop-blur-sm shadow-sm transition-all overflow-hidden">
          <button
            onClick={() => setIsCalculatorMode(true)}
            className={`px-[2.5vw] py-[1.2vw] rounded-full transition-all flex items-center justify-center ${
              isCalculatorMode 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                : "text-muted-foreground/40 hover:text-muted-foreground"
            }`}
          >
            <LayoutGrid className="w-[3.5vw] h-[3.5vw] min-w-[14px] min-h-[14px]" />
          </button>
          <button
            onClick={() => setIsCalculatorMode(false)}
            className={`px-[2.5vw] py-[1.2vw] rounded-full transition-all flex items-center justify-center ${
              !isCalculatorMode 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                : "text-muted-foreground/40 hover:text-muted-foreground"
            }`}
          >
            <Grid3X3 className="w-[3.5vw] h-[3.5vw] min-w-[14px] min-h-[14px]" />
          </button>
        </div>
      </div>
        
        {isCalculatorMode ? (
          <>
            <div className="grid grid-cols-4 gap-[2vw]">
              {renderKey("C", handleClear, "text-destructive font-bold bg-destructive/5 border-destructive/10 h-[6.5svh] min-h-[44px] text-[5.5vw] sm:text-2xl", "clear")}
              {renderKey("÷", () => handleOperator("/"), "text-primary bg-primary/5 border-primary/10 h-[6.5svh] min-h-[44px] text-[5.5vw] sm:text-2xl", "divide")}
              {renderKey("×", () => handleOperator("*"), "text-primary bg-primary/5 border-primary/10 h-[6.5svh] min-h-[44px] text-[5.5vw] sm:text-2xl", "multiply")}
              {renderKey("⌫", handleBackspace, "text-rose-400 bg-rose-400/5 border-rose-400/10 h-[6.5svh] min-h-[44px] text-[5.5vw] sm:text-2xl", "backspace")}
            </div>
            
            <div className="grid grid-cols-4 gap-[2vw]">
              <div className="col-span-3 grid grid-cols-3 gap-[2vw]">
                {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map(num => (
                  renderKey(num, () => handleDigit(num), "bg-secondary/30 dark:bg-white/5 h-[6.5svh] min-h-[44px] text-[5.5vw] sm:text-2xl", num)
                ))}
                {renderKey(".", handleDecimal, "bg-secondary/30 dark:bg-white/5 h-[6.5svh] min-h-[44px] text-[5.5vw] sm:text-2xl", "decimal")}
                {renderKey("0", () => handleDigit("0"), "bg-secondary/30 dark:bg-white/5 h-[6.5svh] min-h-[44px] text-[5.5vw] sm:text-2xl", "zero")}
                {renderKey("%", handlePercent, "text-primary/60 bg-secondary/30 dark:bg-white/5 h-[6.5svh] min-h-[44px] text-[5vw] sm:text-xl", "percent")}
              </div>
              
              <div className="col-span-1 flex flex-col gap-[2vw]">
                {renderKey("-", () => handleOperator("-"), "flex-1 text-primary bg-primary/5 border-primary/10 text-[6vw] sm:text-2xl", "minus")}
                {renderKey("+", () => handleOperator("+"), "flex-1 text-primary bg-primary/5 border-primary/10 text-[6vw] sm:text-2xl", "plus")}
                <button
                  key="equals"
                  onClick={handleEquals}
                  className="flex-1 rounded-2xl bg-primary text-primary-foreground text-[8vw] sm:text-4xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all min-h-[80px]"
                >
                  =
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-[2vw] transition-all duration-300 animate-in fade-in zoom-in-95">
            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map(num => (
              renderKey(num, () => handleDigit(num), "bg-secondary/30 dark:bg-white/10 h-[8.2svh] min-h-[56px] text-[7vw] sm:text-3xl", num)
            ))}
            {renderKey(".", handleDecimal, "bg-secondary/30 dark:bg-white/10 h-[8.2svh] min-h-[56px] text-[7vw] sm:text-3xl", "decimal")}
            {renderKey("0", () => handleDigit("0"), "bg-secondary/30 dark:bg-white/10 h-[8.2svh] min-h-[56px] text-[7vw] sm:text-3xl", "zero")}
            {renderKey("⌫", handleBackspace, "text-rose-400 bg-rose-400/5 border-rose-400/10 h-[8.2svh] min-h-[56px] text-[6vw] sm:text-2xl", "backspace")}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || parseFloat(displayValue) <= 0}
          className={`w-full h-[7.5vh] min-h-[56px] rounded-[6vw] flex items-center justify-center gap-[3vw] text-[4.2vw] sm:text-lg font-bold tracking-[0.2em] uppercase transition-all shadow-xl ${
            isSubmitting || parseFloat(displayValue) <= 0
              ? "bg-muted text-muted-foreground/30 border border-border/50 cursor-not-allowed"
              : "bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95 active:shadow-none"
          }`}
        >
          {isSubmitting ? (
            <div className="w-[6vw] h-[6vw] max-w-[24px] max-h-[24px] border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <QrCode className="w-[6vw] h-[6vw] max-w-[24px] max-h-[24px]" />
              Generate QR
            </>
          )}
        </button>
      </div>
    </div>
  );
}