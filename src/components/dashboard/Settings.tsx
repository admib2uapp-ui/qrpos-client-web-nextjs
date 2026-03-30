"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Bell, Shield, Building2, Store, CreditCard, MapPin, Loader2, QrCode, Upload, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { fetchMerchantDetails, fetchAllMerchants, setActiveMerchant, upsertMerchantDetails, type Merchant } from "../../lib/supabase";
import { readQRFromFile } from "../../lib/qr";
import { BANK_NAMES } from "../../lib/constants";

export default function Settings() {
  const { user } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMerchant();
  }, [user]);

  async function loadMerchant() {
    if (!user) return;
    try {
      const [active, all] = await Promise.all([
        fetchMerchantDetails(user.id),
        fetchAllMerchants(user.id)
      ]);
      setMerchant(active);
      setAllMerchants(all);
    } catch (error) {
      console.error("Error loading merchant details:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setQrLoading(true);
    setQrError(null);
    setQrResult(null);

    try {
      const qrText = await readQRFromFile(file);
      if (!qrText) {
        throw new Error("No LankaQR code found in the image. Please try a clearer photo.");
      }

      const response = await fetch('/api/qr/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: qrText })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to parse QR code");
      }

      setQrResult(result.data);
    } catch (err: any) {
      setQrError(err.message || "An error occurred while processing the QR code.");
    } finally {
      setQrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveMerchantData = async () => {
    if (!user || !qrResult) return;

    setLoading(true);
    try {
      await upsertMerchantDetails(user.id, {
        merchant_id: qrResult.merchant_id,
        bank_code: qrResult.bank_code,
        terminal_id: qrResult.terminal_id,
        merchant_name: qrResult.merchant_name,
        merchant_city: qrResult.merchant_city,
        mcc: qrResult.mcc,
        currency_code: qrResult.currency_code,
        country_code: qrResult.country_code,
      });
      
      setQrResult(null);
      await loadMerchant();
    } catch (err: any) {
      setQrError("Failed to save merchant details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (merchantId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await setActiveMerchant(user.id, merchantId);
      await loadMerchant();
    } catch (err: any) {
      setQrError("Failed to switch profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-[6vw] sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-[20vw] sm:pb-0">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleQrUpload}
      />
      
      <div className="grid grid-cols-1 gap-[6vw] sm:gap-6">
        {/* Merchant Profile Card */}
        <Card className="rounded-[4vw] sm:rounded-xl overflow-hidden border-border/40 shadow-xl bg-gradient-to-br from-card to-card/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/5 skew-x-[-20deg] translate-x-[20%]" />
          <CardHeader className="p-[5vw] sm:p-6 pb-[2vw] sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-[1vw] sm:space-y-1">
                <CardTitle className="text-[5vw] sm:text-xl font-black tracking-tight flex items-center gap-[2vw] sm:gap-2 underline decoration-primary/20">
                  <Building2 className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-primary" /> Merchant Profile
                </CardTitle>
                <CardDescription className="text-[2.5vw] sm:text-xs uppercase tracking-widest font-bold opacity-50">Business identification details.</CardDescription>
              </div>
              {loading && <Loader2 className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px] animate-spin text-muted-foreground" />}
            </div>
          </CardHeader>
          <CardContent className="p-[5vw] sm:p-6 pt-0 sm:pt-0 space-y-[6vw] sm:space-y-6">
            {!loading && merchant ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[6vw] sm:gap-6">
                <div className="space-y-[4vw] sm:space-y-4">
                  <div className="flex items-start gap-[3vw] sm:gap-3">
                    <div className="p-[2vw] sm:p-2 rounded-[2vw] sm:rounded-lg bg-primary/10">
                      <Store className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px] text-primary" />
                    </div>
                    <div>
                      <Label className="text-[2.2vw] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-[0.5vw]">Business Name</Label>
                      <div className="text-[4vw] sm:text-base font-black text-foreground">{merchant.merchant_name}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-[4vw] sm:space-y-4">
                  <div className="flex items-start gap-[3vw] sm:gap-3">
                    <div className="p-[2vw] sm:p-2 rounded-[2vw] sm:rounded-lg bg-primary/10">
                      <MapPin className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px] text-primary" />
                    </div>
                    <div>
                      <Label className="text-[2.2vw] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-[0.5vw]">Location</Label>
                      <div className="text-[4vw] sm:text-base font-black text-foreground">{merchant.merchant_city}, {merchant.country_code}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loading && (
              <div className="space-y-[4vw] sm:space-y-4 text-center py-[10vw]">
                <p className="text-[3vw] sm:text-sm text-muted-foreground font-bold italic mb-[4vw]">No business records linked.</p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full px-[6vw] font-black uppercase tracking-widest text-[2.8vw] sm:text-xs h-auto py-[3vw] sm:py-2"
                >
                  <QrCode className="w-[4vw] h-[4vw] mr-[2vw]" /> Connect with LankaQR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {(allMerchants.length > 0 || qrResult || qrLoading || qrError) && (
          <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-[6vw] sm:rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
            <CardHeader className="p-[5vw] sm:p-6 pb-[2vw] sm:pb-4">
              <div className="flex flex-col gap-[4vw] sm:gap-4">
                <div className="flex items-center gap-[3vw] sm:gap-4">
                  <div className="p-[2.5vw] sm:p-2.5 rounded-[3vw] sm:rounded-xl bg-primary/10">
                    <Building2 className="w-[5vw] h-[5vw] sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-[4vw] sm:text-lg font-black tracking-tight">Saved Business Profiles</CardTitle>
                    <CardDescription className="text-[2.8vw] sm:text-xs font-bold opacity-70">Manage your linked bank QR codes</CardDescription>
                  </div>
                </div>
                {!qrResult && !qrLoading && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-auto py-[3vw] sm:py-2.5 rounded-[3vw] sm:rounded-xl text-[2.8vw] sm:text-xs font-black uppercase tracking-[0.2em] border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/5"
                  >
                    <Plus className="w-[3.5vw] h-[3.5vw] mr-[2vw]" /> Link New Bank QR
                  </Button>
                )}

                {qrLoading && (
                  <div className="flex flex-col items-center gap-[2vw] py-[4vw] bg-muted/10 rounded-[4vw] border border-dashed animate-pulse">
                    <Loader2 className="w-[8vw] h-[8vw] max-w-[32px] max-h-[32px] animate-spin text-primary" />
                    <p className="text-[3vw] sm:text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">Parsing QR... wait</p>
                  </div>
                )}

                {qrError && (
                  <div className="flex items-center gap-[2vw] p-[3vw] bg-rose-500/10 rounded-[2vw] text-rose-500 font-bold text-[3vw] sm:text-xs border border-rose-500/20">
                    <AlertCircle className="w-[4vw] h-[4vw] shrink-0" />
                    <span>{qrError}</span>
                  </div>
                )}

                {qrResult && (
                  <div className="bg-primary/5 rounded-[4vw] sm:rounded-xl border border-primary/20 p-[5vw] sm:p-5 space-y-[4vw] sm:space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[3.5vw] sm:text-sm font-black uppercase tracking-widest text-primary flex items-center gap-[2vw]">
                         <CheckCircle2 className="w-[4vw] h-[4vw]" /> New Profile Found
                       </h4>
                       <Button variant="ghost" size="sm" className="h-6 text-[2.5vw] sm:text-[10px] font-black text-rose-500 border-2 border-rose-500/50 hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500" onClick={() => setQrResult(null)}>Cancel</Button>
                    </div>
                    
                    <div className="space-y-[3vw] sm:space-y-3 text-[3.2vw] sm:text-xs">
                      <div className="flex items-center justify-between border-b border-primary/10 pb-[1vw]">
                        <Label className="text-[2.2vw] sm:text-[9px] text-muted-foreground uppercase font-black opacity-60 w-[30%]">Merchant</Label>
                        <div className="font-bold truncate text-right w-[70%]">{qrResult.merchant_name}</div>
                      </div>
                      <div className="flex items-center justify-between border-b border-primary/10 pb-[1vw]">
                        <Label className="text-[2.2vw] sm:text-[9px] text-muted-foreground uppercase font-black opacity-60 w-[30%]">Bank</Label>
                        <div className="font-bold truncate text-right w-[70%] text-primary">{BANK_NAMES[qrResult.bank_code] || qrResult.bank_code}</div>
                      </div>
                      <div className="flex items-center justify-between pb-[1vw]">
                        <Label className="text-[2.2vw] sm:text-[9px] text-muted-foreground uppercase font-black opacity-60 w-[30%]">City</Label>
                        <div className="font-bold truncate text-right w-[70%]">{qrResult.merchant_city}</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] h-auto py-[4vw] sm:py-3 rounded-[3vw] sm:rounded-lg shadow-lg shadow-primary/20"
                      onClick={saveMerchantData}
                    >
                      Save business profile
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-[5vw] sm:p-6 space-y-[4vw] sm:space-y-4">
              {allMerchants.map((m) => (
                <div 
                  key={m.id} 
                  className={`relative p-[4vw] sm:p-4 rounded-[4vw] sm:rounded-xl border transition-all duration-300 ${
                    m.is_active 
                      ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/5" 
                      : "bg-muted/10 border-border/40 hover:bg-muted/20"
                  }`}
                >
                  {m.is_active && (
                    <span className="absolute top-[3vw] right-[3vw] sm:top-3 sm:right-3 bg-primary text-primary-foreground text-[2vw] sm:text-[9px] font-black px-[2vw] py-[0.8vw] sm:px-2 sm:py-0.5 rounded-full uppercase tracking-tighter flex items-center justify-center min-w-[12vw] sm:min-w-[40px]">
                      Active
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="space-y-[1vw]">
                      <div className="flex items-center gap-[2vw]">
                        <span className="text-[3.2vw] sm:text-sm font-black">{m.merchant_name}</span>
                      </div>
                      <div className="flex items-center gap-[2vw] text-muted-foreground font-bold text-[2.5vw] sm:text-[10px] opacity-70">
                        <MapPin className="w-[3vw] h-[3vw]" />
                        <span>{BANK_NAMES[m.bank_code] || m.bank_code}, {m.merchant_city}</span>
                      </div>
                    </div>
                    
                    {!m.is_active && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-auto py-[2vw] sm:py-2 px-[4vw] sm:px-4 rounded-full text-[2.5vw] sm:text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleSetDefault(m.id)}
                        disabled={loading}
                      >
                        Switch
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Other Settings Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[4vw] sm:gap-4">
          <Card className="rounded-[4vw] sm:rounded-xl overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="p-[5vw] sm:p-6 pb-[2vw] sm:pb-4">
              <CardTitle className="text-[5vw] sm:text-lg font-black tracking-tight flex items-center gap-[2vw] sm:gap-2 underline decoration-primary/10">
                <Bell className="w-[4vw] h-[4vw] max-w-[18px] max-h-[18px] text-primary" /> Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-[5vw] sm:p-6 pt-0 sm:pt-0 space-y-[4vw] sm:space-y-4">
              <div className="flex items-center justify-between py-[2vw] sm:py-2">
                <div className="space-y-[0.5vw] sm:space-y-0.5">
                  <Label className="text-[3.5vw] sm:text-sm font-black">Daily Summary</Label>
                  <div className="text-[2.5vw] sm:text-xs text-muted-foreground font-bold opacity-60">Push delivery enabled.</div>
                </div>
                <Switch defaultChecked className="scale-125 sm:scale-100" />
              </div>
              <div className="flex items-center justify-between py-[2vw] sm:py-2 border-t border-border/10">
                <div className="space-y-[0.5vw] sm:space-y-0.5">
                  <Label className="text-[3.5vw] sm:text-sm font-black">Audit Trails</Label>
                  <div className="text-[2.5vw] sm:text-xs text-muted-foreground font-bold opacity-60">Log all admin changes.</div>
                </div>
                <Switch defaultChecked className="scale-125 sm:scale-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[4vw] sm:rounded-xl overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="p-[5vw] sm:p-6 pb-[2vw] sm:pb-4">
              <CardTitle className="text-[5vw] sm:text-lg font-black tracking-tight flex items-center gap-[2vw] sm:gap-2 underline decoration-rose-500/10">
                <Shield className="w-[4vw] h-[4vw] max-w-[18px] max-h-[18px] text-rose-500" /> Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-[5vw] sm:p-6 pt-0 sm:pt-0 space-y-[4vw] sm:space-y-4">
              <div className="flex items-center justify-between py-[2vw] sm:py-2">
                <div className="space-y-[0.5vw] sm:space-y-0.5">
                  <Label className="text-[3.5vw] sm:text-sm font-black">2FA Security</Label>
                  <div className="text-[2.5vw] sm:text-xs text-muted-foreground font-bold opacity-60">Multi-factor login.</div>
                </div>
                <Button variant="outline" size="sm" className="h-[8vw] sm:h-8 rounded-full text-[2.5vw] sm:text-[10px] font-black uppercase tracking-widest px-[4vw] sm:px-3">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
