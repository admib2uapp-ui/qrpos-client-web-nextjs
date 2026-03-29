"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Keyboard, Calculator } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { initiateTransaction } from "../../lib/qrService";

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
  const [inputMode, setInputMode] = useState<"keypad" | "normal">("keypad");
  const [displayValue, setDisplayValue] = useState("0");
  const [expression, setExpression] = useState("");
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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


  const handleInputChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > MAX_AMOUNT) return;
    setDisplayValue(cleaned || "0");
  };

  const handleSubmit = async () => {
    const amountNum = parseFloat(displayValue);
    if (!displayValue || amountNum <= 0 || auth.loading || !auth.user) {
      return;
    }
    if (amountNum > MAX_AMOUNT) {
      return;
    }

    setIsSubmitting(true);
    setExpression("");

    try {
      const referenceNo = await initiateTransaction(amountNum, manualRef || null, auth.user.id);
      router.push(`/mobile/qr?amount=${encodeURIComponent(displayValue)}&ref=${encodeURIComponent(referenceNo)}`);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      // Fallback redirect if DB save fails, but ideally we should show an error
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
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  };

  const renderKey = (label: string, onPress: () => void, style?: string) => (
    <button
      onClick={onPress}
      className={`flex items-center justify-center h-14 rounded-2xl bg-card shadow-[0_4px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[2px] transition-all text-2xl font-bold text-foreground border border-border/60 dark:border-white/20 hover:bg-secondary/20 ${style || ""}`}
    >
      {label}
    </button>
  );

  const renderOperatorKey = (label: string, onPress: () => void, style?: string) => (
    <button
      onClick={onPress}
      className={`flex items-center justify-center rounded-2xl shadow-md active:scale-95 transition-all text-xl font-black ${style || "bg-primary/10 text-primary border border-primary/30 dark:border-primary/40 hover:bg-primary/20"}`}
    >
      {label}
    </button>
  );


  return (
    <div className="flex flex-col h-full bg-background px-4 py-2">
      {/* Toggle Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => setInputMode(inputMode === "keypad" ? "normal" : "keypad")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-md text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/50 active:scale-95 transition-all"
        >
          {inputMode === "keypad" ? (
            <>
              <Keyboard className="w-4 h-4" />
              Keyboard
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Calculator
            </>
          )}
        </button>
      </div>

      {/* Spacer to push content down slightly */}
      <div className="flex-1 min-h-[10px]" />

      {/* Amount Display */}
      <div className="bg-card rounded-3xl p-6 shadow-2xl border border-border/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        {/* Manual Reference Input */}
        <div className="mb-4">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">Reference Number (Optional)</p>
          <input
            type="text"
            value={manualRef}
            onChange={(e) => setManualRef(e.target.value.toUpperCase())}
            placeholder="AUTO-GENERATED"
            className="w-full bg-secondary/30 rounded-lg px-3 py-2 text-sm font-mono font-bold text-foreground border border-border/50 outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center mb-2 opacity-70">Transaction Amount (LKR)</p>
        
        {inputMode === "normal" ? (
            <input
            type="number"
            value={displayValue === "0" ? "" : displayValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="0.00"
            className="text-5xl font-bold text-foreground bg-transparent text-center w-full outline-none"
            inputMode="decimal"
          />
        ) : (
          <>
            {expression ? (
              <p className="text-sm text-muted-foreground text-center mb-1 min-h-[20px]">
                {expression}
              </p>
            ) : displayValue === "0" ? (
              <p className="text-sm text-muted-foreground/50 text-center mb-1 min-h-[20px]">
                ENTER AMOUNT
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center mb-1 min-h-[20px]"></p>
            )}
            <p className="text-5xl font-bold text-foreground text-center">
              {formatDisplay(displayValue)}
            </p>
          </>
        )}
      </div>

      {/* Spacer between display and keypad */}
      <div className="flex-1 min-h-[10px]" />

      {/* Keypad */}
      <div className="flex flex-col justify-end pb-4">
        {inputMode === "normal" ? (
          <div className="flex flex-col items-center justify-end h-full pb-4">
            {/* Normal numeric pad - Android style */}
            <div className="space-y-2 w-full max-w-sm">
              <div className="grid grid-cols-3 gap-2">
                {renderKey("1", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "1";
                  setDisplayValue(newValue);
                })}
                {renderKey("2", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "2";
                  setDisplayValue(newValue);
                })}
                {renderKey("3", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "3";
                  setDisplayValue(newValue);
                })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {renderKey("4", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "4";
                  setDisplayValue(newValue);
                })}
                {renderKey("5", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "5";
                  setDisplayValue(newValue);
                })}
                {renderKey("6", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "6";
                  setDisplayValue(newValue);
                })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {renderKey("7", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "7";
                  setDisplayValue(newValue);
                })}
                {renderKey("8", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "8";
                  setDisplayValue(newValue);
                })}
                {renderKey("9", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "9";
                  setDisplayValue(newValue);
                })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {renderKey(".", () => {
                  if (!displayValue.includes(".")) setDisplayValue(displayValue + ".");
                })}
                {renderKey("0", () => {
                  const newValue = (displayValue === "0" ? "" : displayValue) + "0";
                  setDisplayValue(newValue);
                })}
                {renderKey("⌫", handleBackspace, "bg-destructive/10 text-destructive border-destructive/30 dark:border-destructive/40 active:bg-destructive/20 shadow-none")}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
          {/* Row 1: C, %, ×, - */}
          <div className="grid grid-cols-4 gap-2 h-14">
            {renderOperatorKey("C", handleClear, "bg-orange-500/10 text-orange-500 border border-orange-500/30 dark:border-orange-500/40 hover:bg-orange-500/20")}
            {renderOperatorKey("%", handlePercent, "bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 dark:border-indigo-500/40 hover:bg-indigo-500/20")}
            {renderOperatorKey("×", () => handleOperator("*"), "bg-blue-500/10 text-blue-500 border border-blue-500/30 dark:border-blue-500/40 hover:bg-blue-500/20")}
            {renderOperatorKey("-", () => handleOperator("-"), "bg-blue-500/10 text-blue-500 border border-blue-500/30 dark:border-blue-500/40 hover:bg-blue-500/20")}
          </div>

          {/* Rows 2-3: 7,8,9 with + */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-3 gap-2 h-14">
                {renderKey("7", () => handleDigit("7"))}
                {renderKey("8", () => handleDigit("8"))}
                {renderKey("9", () => handleDigit("9"))}
              </div>
              <div className="grid grid-cols-3 gap-2 h-14">
                {renderKey("4", () => handleDigit("4"))}
                {renderKey("5", () => handleDigit("5"))}
                {renderKey("6", () => handleDigit("6"))}
              </div>
            </div>
            <button
              onClick={() => handleOperator("+")}
              className="w-20 h-[120px] rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30 dark:border-blue-500/40 shadow-md active:scale-95 transition-all text-2xl font-black flex items-center justify-center hover:bg-blue-500/20"
            >
              +
            </button>
          </div>

          {/* Rows 4-5: 1,2,3 with = */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-3 gap-2 h-14">
                {renderKey("1", () => handleDigit("1"))}
                {renderKey("2", () => handleDigit("2"))}
                {renderKey("3", () => handleDigit("3"))}
              </div>
              <div className="grid grid-cols-3 gap-2 h-14">
                {renderKey("⌫", handleBackspace, "bg-destructive/10 text-destructive border-destructive/30 dark:border-destructive/40 active:bg-destructive/20 shadow-none")}
                {renderKey("0", () => handleDigit("0"))}
                {renderKey(".", handleDecimal)}
              </div>
            </div>
            <button
              onClick={handleEquals}
              className="w-20 h-[120px] rounded-2xl bg-emerald-500 text-white shadow-[0_4px_0_0_#059669] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.5)] border border-emerald-400/20 active:shadow-none active:translate-y-[2px] transition-all text-3xl font-black flex items-center justify-center h-full"
            >
              =
            </button>
          </div>
          </div>
        )}

        {/* Generate QR Button - Fixed at bottom */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={!displayValue || parseFloat(displayValue) <= 0 || isSubmitting}
            className={`w-full h-16 rounded-2xl shadow-xl active:scale-95 active:translate-y-[2px] transition-all flex items-center justify-center gap-3 text-xl font-black text-white ${
              displayValue && parseFloat(displayValue) > 0 && !isSubmitting 
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" 
                : "bg-muted text-muted-foreground border border-border/50 shadow-none opacity-50"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <QrCode className="w-7 h-7" />
                Generate Payment QR
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}