"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { fetchProfile, updateProfile, type Profile } from "../../lib/supabase";
import { Loader2, User, Mail, Building, ShieldCheck, Phone, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

export default function ProfileComponent() {
  const { user } = useAuth();
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
  return (
    <div className="space-y-[6vw] sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-[10vw] sm:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[6vw] sm:gap-6">
        <Card className="lg:col-span-1 h-fit rounded-[4vw] sm:rounded-xl overflow-hidden border-border/40 shadow-sm">
          <CardContent className="pt-[8vw] sm:pt-6 flex flex-col items-center text-center space-y-[4vw] sm:space-y-4">
            <Avatar className="w-[24vw] h-[24vw] max-w-[96px] max-h-[96px] border-[1vw] sm:border-4 border-primary/20 shadow-xl">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-[8vw] sm:text-2xl font-bold font-mono">JD</AvatarFallback>
            </Avatar>
            <div className="space-y-[1vw]">
              <CardTitle className="text-[6vw] sm:text-xl font-black tracking-tight">{fullName || "User"}</CardTitle>
              <CardDescription className="text-[3vw] sm:text-sm font-bold uppercase tracking-widest opacity-50">{profile?.company_name || "Merchant Admin"}</CardDescription>
            </div>
            <div className="flex gap-[2vw] justify-center">
              <Badge variant="outline" className="gap-[1vw] border-emerald-500/30 text-emerald-500 bg-emerald-500/5 px-[3vw] py-[1vw] text-[2.5vw] sm:text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-[3vw] h-[3vw] max-w-[12px] max-h-[12px]" /> Verified
              </Badge>
            </div>
            <Button className="w-full h-[12vw] sm:h-10 rounded-[3vw] sm:rounded-md text-[3.5vw] sm:text-sm font-black uppercase tracking-widest">Edit Avatar</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-[4vw] sm:rounded-xl overflow-hidden border-border/40 shadow-sm">
          <CardHeader className="p-[5vw] sm:p-6 pb-[2vw] sm:pb-4">
            <CardTitle className="text-[5vw] sm:text-xl font-black tracking-tight underline decoration-primary/20">Personal Information</CardTitle>
            <CardDescription className="text-[2.5vw] sm:text-xs uppercase tracking-widest font-bold opacity-40">Identity and contact details.</CardDescription>
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
                  className="h-[12vw] sm:h-10 rounded-[2.5vw] sm:rounded-md bg-secondary/30 border-border/50 text-[3.5vw] sm:text-sm font-bold" 
                />
              </div>
              <div className="space-y-[2vw] sm:space-y-2">
                <Label className="flex items-center gap-[2vw] sm:gap-2 text-[3vw] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Mail className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px]" /> Email Address
                </Label>
                <Input value={user?.email || ""} readOnly className="h-[12vw] sm:h-10 rounded-[2.5vw] sm:rounded-md bg-secondary/30 border-border/50 text-[3.5vw] sm:text-sm font-bold opacity-60 cursor-not-allowed" />
              </div>
              <div className="space-y-[2vw] sm:space-y-2">
                <Label className="flex items-center gap-[2vw] sm:gap-2 text-[3vw] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Building className="w-[4vw] h-[4vw] max-w-[16px] max-h-[16px]" /> Company Name
                </Label>
                <Input 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="h-[12vw] sm:h-10 rounded-[2.5vw] sm:rounded-md bg-secondary/30 border-border/50 text-[3.5vw] sm:text-sm font-bold" 
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
                  className="h-[12vw] sm:h-10 rounded-[2.5vw] sm:rounded-md bg-secondary/30 border-border/50 text-[3.5vw] sm:text-sm font-bold" 
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
                className="w-full sm:w-auto h-[10vw] sm:h-9 text-[2.8vw] sm:text-xs font-black uppercase tracking-widest rounded-full opacity-60"
              >
                Discard
              </Button>
              <Button 
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full sm:w-auto h-[12vw] sm:h-10 text-[3.5vw] sm:text-sm font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20"
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
