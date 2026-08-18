'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check saved session or Supabase session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@kllyeein.com',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url,
            role: 'customer'
          });
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@kllyeein.com',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url,
            role: 'customer'
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local demo guest check
      const savedUser = localStorage.getItem('kllyeein_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
    } else {
      // Mock Google Login for local demo mode
      const mockUser: UserProfile = {
        id: 'user-google-101',
        email: 'cyber.member@kllyeein.com',
        fullName: 'Cyber VIP Member',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        role: 'customer'
      };
      setUser(mockUser);
      localStorage.setItem('kllyeein_user', JSON.stringify(mockUser));
      setIsAuthModalOpen(false);
    }
  };

  const signInWithEmail = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
    } else {
      const mockUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'customer'
      };
      setUser(mockUser);
      localStorage.setItem('kllyeein_user', JSON.stringify(mockUser));
      setIsAuthModalOpen(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('kllyeein_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
