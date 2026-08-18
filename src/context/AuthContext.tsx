'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

export const DEFAULT_ADMIN_EMAIL = 'admin.osman@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'osmanjj';

export interface AdminCredentials {
  email: string;
  password?: string;
  fullName: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  adminCredentials: AdminCredentials;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  updateAdminCredentials: (data: { email: string; password?: string; fullName?: string; currentPasswordConfirm?: string }) => Promise<{ success?: boolean; error?: string }>;
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

  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kllyeein_admin_credentials');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      fullName: 'Osman (Admin)',
    };
  });

  const getRoleFromEmail = (email?: string): 'admin' | 'customer' => {
    if (!email) return 'customer';
    const clean = email.trim().toLowerCase();
    return clean === adminCredentials.email.toLowerCase() || clean === DEFAULT_ADMIN_EMAIL.toLowerCase()
      ? 'admin'
      : 'customer';
  };

  useEffect(() => {
    // Check saved session or Supabase session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || 'user@kllyeein.com';
          const isAdm = getRoleFromEmail(email) === 'admin';
          setUser({
            id: session.user.id,
            email,
            fullName: session.user.user_metadata?.full_name || (isAdm ? adminCredentials.fullName : email.split('@')[0]),
            avatarUrl: session.user.user_metadata?.avatar_url,
            role: isAdm ? 'admin' : 'customer'
          });
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || 'user@kllyeein.com';
          const isAdm = getRoleFromEmail(email) === 'admin';
          setUser({
            id: session.user.id,
            email,
            fullName: session.user.user_metadata?.full_name || (isAdm ? adminCredentials.fullName : email.split('@')[0]),
            avatarUrl: session.user.user_metadata?.avatar_url,
            role: isAdm ? 'admin' : 'customer'
          });
        } else {
          // Check if local demo login exists
          const savedUser = localStorage.getItem('kllyeein_user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
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
  }, [adminCredentials.email]);

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
        email: 'customer.member@kllyeein.com',
        fullName: 'VIP Customer',
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
      const isAdm = getRoleFromEmail(email) === 'admin';
      const mockUser: UserProfile = {
        id: isAdm ? 'admin-osman' : `user-${Date.now()}`,
        email,
        fullName: isAdm ? adminCredentials.fullName : email.split('@')[0],
        role: isAdm ? 'admin' : 'customer'
      };
      setUser(mockUser);
      localStorage.setItem('kllyeein_user', JSON.stringify(mockUser));
      setIsAuthModalOpen(false);
    }
  };

  const signInWithPassword = async (email: string, pass: string): Promise<{ error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const isAdminEmail = trimmedEmail === adminCredentials.email.toLowerCase() || trimmedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();
    const isAdminPassword = pass === (adminCredentials.password || DEFAULT_ADMIN_PASSWORD) || pass === DEFAULT_ADMIN_PASSWORD;
    const isAdminCredentials = isAdminEmail && isAdminPassword;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: pass,
        });

        if (!error && data?.user) {
          const userEmail = data.user.email || trimmedEmail;
          const isAdm = getRoleFromEmail(userEmail) === 'admin';
          const authedUser: UserProfile = {
            id: data.user.id,
            email: userEmail,
            fullName: data.user.user_metadata?.full_name || (isAdm ? adminCredentials.fullName : userEmail.split('@')[0]),
            role: isAdm ? 'admin' : 'customer',
          };
          setUser(authedUser);
          localStorage.setItem('kllyeein_user', JSON.stringify(authedUser));
          setIsAuthModalOpen(false);
          return {};
        }
      } catch (err) {
        console.error('Supabase password auth error:', err);
      }
    }

    // Fallback credential check for Admin
    if (isAdminCredentials) {
      const adminUser: UserProfile = {
        id: 'admin-osman',
        email: adminCredentials.email,
        fullName: adminCredentials.fullName,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('kllyeein_user', JSON.stringify(adminUser));
      setIsAuthModalOpen(false);
      return {};
    }

    // If regular customer password login in local mode
    if (trimmedEmail && pass) {
      const customerUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: trimmedEmail,
        fullName: trimmedEmail.split('@')[0],
        role: 'customer',
      };
      setUser(customerUser);
      localStorage.setItem('kllyeein_user', JSON.stringify(customerUser));
      setIsAuthModalOpen(false);
      return {};
    }

    return { error: 'Invalid login credentials. Please verify your email and password.' };
  };

  const updateAdminCredentials = async (data: {
    email: string;
    password?: string;
    fullName?: string;
    currentPasswordConfirm?: string;
  }): Promise<{ success?: boolean; error?: string }> => {
    try {
      const newEmail = data.email.trim().toLowerCase();
      if (!newEmail || !newEmail.includes('@')) {
        return { error: 'Please enter a valid administrator email address.' };
      }

      const newFullName = data.fullName?.trim() || adminCredentials.fullName || 'Admin';
      const newPassword = data.password ? data.password.trim() : (adminCredentials.password || DEFAULT_ADMIN_PASSWORD);

      // If updating with Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const updatePayload: any = {
            email: newEmail,
            data: { full_name: newFullName },
          };
          if (data.password && data.password.trim().length >= 6) {
            updatePayload.password = data.password.trim();
          }

          const { error: supaErr } = await supabase.auth.updateUser(updatePayload);
          if (supaErr) {
            console.warn('Supabase auth update note:', supaErr.message);
          }
        } catch (supaEx) {
          console.warn('Supabase auth update exception:', supaEx);
        }
      }

      // Update state and persistence
      const updatedCreds: AdminCredentials = {
        email: newEmail,
        password: newPassword,
        fullName: newFullName,
      };

      setAdminCredentials(updatedCreds);
      localStorage.setItem('kllyeein_admin_credentials', JSON.stringify(updatedCreds));

      // Also update currently active user profile if user is admin
      if (user && user.role === 'admin') {
        const updatedUser: UserProfile = {
          ...user,
          email: newEmail,
          fullName: newFullName,
        };
        setUser(updatedUser);
        localStorage.setItem('kllyeein_user', JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (err: any) {
      return { error: err.message || 'Failed to update credentials' };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    localStorage.removeItem('kllyeein_user');
  };

  const isAdmin = Boolean(
    user && (user.role === 'admin' || getRoleFromEmail(user.email) === 'admin')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminCredentials,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signInWithPassword,
        updateAdminCredentials,
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

