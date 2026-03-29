"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Bell, Shield, Building2, Store, CreditCard, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { fetchMerchantDetails, type Merchant } from "../../lib/supabase";

export default function Settings() {
  const { user } = useAuth();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMerchant() {
      if (!user) return;
      try {
        const data = await fetchMerchantDetails(user.id);
        setMerchant(data);
      } catch (error) {
        console.error("Error loading merchant details:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMerchant();
  }, [user]);

  return (
    <div className="space-y-[6vw] sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-[20vw] sm:pb-0">
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
                  <div className="flex items-start gap-[3vw] sm:gap-3">
                    <div className="p-[2vw] sm:p-2 rounded-[2vw] sm:rounded-lg bg-primary/10">
                      <CreditCard className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px] text-primary" />
                    </div>
                    <div>
                      <Label className="text-[2.2vw] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-[0.5vw]">Merchant ID</Label>
                      <div className="text-[3.5vw] sm:text-sm font-mono font-bold opacity-60 tracking-tighter">{merchant.merchant_id}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-[4vw] sm:space-y-4">
                  <div className="flex items-start gap-[3vw] sm:gap-3">
                    <div className="p-[2vw] sm:p-2 rounded-[2vw] sm:rounded-lg bg-emerald-500/10">
                      <CreditCard className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px] text-emerald-500" />
                    </div>
                    <div>
                      <Label className="text-[2.2vw] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-[0.5vw]">Terminal ID</Label>
                      <div className="text-[3.5vw] sm:text-sm font-mono font-bold opacity-60 tracking-tighter">{merchant.terminal_id}</div>
                    </div>
                  </div>
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
              <div className="flex flex-col items-center justify-center py-[8vw] sm:py-8 text-center bg-muted/20 rounded-[4vw] sm:rounded-xl border border-dashed border-border/60">
                <p className="text-[3vw] sm:text-sm text-muted-foreground font-bold italic">No business records linked.</p>
                <Button variant="link" className="text-[2.8vw] sm:text-xs font-black uppercase tracking-widest">Connect Merchant</Button>
              </div>
            )}
          </CardContent>
        </Card>

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
