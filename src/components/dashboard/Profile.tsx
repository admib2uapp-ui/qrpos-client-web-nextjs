"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { fetchProfile, updateProfile, type Profile } from "../../lib/supabase";
import { Loader2, User, Mail, Building, ShieldCheck, Phone, CheckCircle2, Pencil, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

export default function ProfileComponent() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const data = await fetchProfile(user.id);
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
          setCompanyName(data.company_name || "");
          setWhatsappNumber(data.whatsapp_number || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    setSuccess(false);
    try {
      const updated = await updateProfile(user.id, {
        full_name: fullName,
        company_name: companyName,
        whatsapp_number: whatsappNumber,
      });
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <div className="space-y-[6vw] sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-[10vw] sm:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[6vw] sm:gap-6">
        <Card className="lg:col-span-1 h-fit glass-card border-primary/10 overflow-hidden relative group shadow-xl shadow-primary/5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors z-10"
          >
            <Pencil className="w-4 h-4 text-primary" />
          </Button>
          <CardContent className="pt-[8vw] sm:pt-6 flex flex-col items-center text-center space-y-[4vw] sm:space-y-4">
            <Avatar className="w-[24vw] h-[24vw] max-w-[110px] max-h-[110px] border-4 border-primary shadow-2xl shadow-primary/30">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black font-mono">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight text-foreground">{fullName || "User"}</CardTitle>
              <CardDescription className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">{profile?.company_name || "Merchant Admin"}</CardDescription>
            </div>
            <div className="flex flex-col gap-[3vw] sm:gap-3 items-center w-full">
              <Badge variant="outline" className="gap-2 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
              </Badge>
              <Button 
                variant="ghost" 
                onClick={() => signOut()}
                className="gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest mt-4 rounded-xl px-6"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass-card border-primary/10 overflow-hidden shadow-xl shadow-primary/5">
          <CardHeader className="p-[5vw] sm:p-6 pb-[2vw] sm:pb-4">
            <CardTitle className="text-xl font-black tracking-tight text-primary uppercase">Personal Information</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold opacity-40">Identity and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="p-[5vw] sm:p-6 pt-0 sm:pt-0 space-y-[6vw] sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[4vw] sm:gap-4">
              <div className="space-y-[2vw] sm:space-y-2">
                <Label className="flex items-center gap-[2vw] sm:gap-2 text-[3vw] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                   <User className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px]" /> Full Name
                </Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="h-12 rounded-xl bg-primary/5 border-primary/10 text-sm font-black focus:ring-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-[2vw] sm:space-y-2">
                <Label className="flex items-center gap-[2vw] sm:gap-2 text-[3vw] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Mail className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px]" /> Email Address
                </Label>
                <Input value={user?.email || ""} readOnly className="h-12 rounded-xl bg-muted/10 border-muted/20 text-sm font-bold opacity-60 cursor-not-allowed" />
              </div>
              <div className="space-y-[2vw] sm:space-y-2">
                <Label className="flex items-center gap-[2vw] sm:gap-2 text-[3vw] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Building className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px]" /> Company Name
                </Label>
                <Input 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="h-12 rounded-xl bg-primary/5 border-primary/10 text-sm font-black focus:ring-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-[2vw] sm:space-y-2">
                <Label className="flex items-center gap-[2vw] sm:gap-2 text-[3vw] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Phone className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px]" /> WhatsApp Number
                </Label>
                <Input 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+94 ..."
                  className="h-12 rounded-xl bg-primary/5 border-primary/10 text-sm font-black focus:ring-primary/20 transition-all text-primary" 
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-[3vw] sm:gap-3 lg:mt-6">
              {success && (
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest mr-auto py-2">
                  <CheckCircle2 className="w-4 h-4" /> Profile Updated
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFullName(profile?.full_name || "");
                  setCompanyName(profile?.company_name || "");
                  setWhatsappNumber(profile?.whatsapp_number || "");
                }}
                className="w-full sm:w-auto h-12 text-xs font-black uppercase tracking-widest rounded-xl border-primary/10 hover:bg-primary/5 transition-all opacity-60"
              >
                Discard Changes
              </Button>
              <Button 
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full sm:w-auto h-12 px-8 text-sm font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
