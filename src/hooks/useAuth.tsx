"use client";

import { createContext, useContext, useState, useEffect, type ReactNode, type JSX } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, onAuthStateChange, getSession } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthProvider: Initializing auth...');
      try {
        const session = await getSession();
        console.log('AuthProvider: Session check done, user:', session?.user?.email);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('AuthProvider: Error checking session:', error);
      } finally {
        setLoading(false);
        console.log('AuthProvider: Auth loading set to false');
      }
    };

    initAuth();

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('AuthProvider: Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
