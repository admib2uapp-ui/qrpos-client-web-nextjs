"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { User, Mail, Building, ShieldCheck } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-xl">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">John Doe</CardTitle>
              <CardDescription>Merchant Admin</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            </div>
            <Button className="w-full">Edit Avatar</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Updated 2 days ago.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> Full Name</Label>
                <Input value="John Doe" readOnly className="bg-sidebar/10 border-sidebar-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> Email Address</Label>
                <Input value="john.doe@example.com" readOnly className="bg-sidebar/10 border-sidebar-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Building className="w-4 h-4 text-muted-foreground" /> Company Name</Label>
                <Input value="Lanka Solutions PBC" readOnly className="bg-sidebar/10 border-sidebar-border/50" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-muted-foreground" /> Role</Label>
                <Input value="Administrator" readOnly className="bg-sidebar/10 border-sidebar-border/50" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Discard Changes</Button>
              <Button>Save Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
