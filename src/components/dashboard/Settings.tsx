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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-6">
        {/* Merchant Profile Card */}
        <Card className="shadow-xl bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" /> Merchant Profile
                </CardTitle>
                <CardDescription>Your registered business details.</CardDescription>
              </div>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!loading && merchant ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Store className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Business Name</Label>
                      <div className="font-medium text-foreground">{merchant.merchant_name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Merchant ID</Label>
                      <div className="font-mono text-sm">{merchant.merchant_id}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Terminal ID</Label>
                      <div className="font-mono text-sm">{merchant.terminal_id}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Location</Label>
                      <div className="text-foreground">{merchant.merchant_city}, {merchant.country_code}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20">
                <p className="text-sm text-muted-foreground">No merchant details found for this account.</p>
                <Button variant="link" className="text-xs">Setup Merchant Account</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Notifications</CardTitle>
            <CardDescription>Control how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-xs text-muted-foreground">Receive daily summaries via email.</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-sidebar-border/20">
              <div className="space-y-0.5">
                <Label>Audit Logs</Label>
                <div className="text-xs text-muted-foreground">Log all administrative actions.</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Security</CardTitle>
            <CardDescription>Protect your merchant account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <div className="text-xs text-muted-foreground">Require a code to sign in.</div>
              </div>
              <Button variant="outline" size="sm" className="bg-sidebar/10">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
