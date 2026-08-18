'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';
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
  isAuthModalOpen: boolean;
  authModalContext: 'general' | 'checkout';
  setIsAuthModalOpen: (open: boolean, context?: 'general' | 'checkout') => void;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithPassword: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithPassword: (fullName: string, email: string, pass: string) => Promise<{ error?: string }>;
  updateAdminCredentials: (data: { email: string; password?: string; fullName?: string }) => Promise<{ success?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requireAuthForCheckout: (proceedToCheckout: () => void) => void;
  isSupabaseConfigured: boolean;
  saveSupabaseSettings: (url: string, key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpenState] = useState(false);
  const [authModalContext, setAuthModalContext] = useState<'general' | 'checkout'>('general');
  const [pendingCheckoutCallback, setPendingCheckoutCallback] = useState<(() => void) | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

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

  // Helper to open auth modal with optional context
  const setIsAuthModalOpen = (open: boolean, context: 'general' | 'checkout' = 'general') => {
    setAuthModalContext(context);
    setIsAuthModalOpenState(open);
    if (!open) {
      setPendingCheckoutCallback(null);
    }
  };

  // Trigger pending checkout if one was waiting
  const handleAuthSuccess = useCallback((authedUser: UserProfile) => {
    setUser(authedUser);
    localStorage.setItem('kllyeein_user', JSON.stringify(authedUser));
    setIsAuthModalOpenState(false);

    if (pendingCheckoutCallback) {
      const callback = pendingCheckoutCallback;
      setPendingCheckoutCallback(null);
      setTimeout(() => {
        callback();
      }, 100);
    }
  }, [pendingCheckoutCallback]);

  // Initial Auth Check & Supabase Session Listener
  useEffect(() => {
    const client = getSupabaseClient();
    const config = getSupabaseConfig();
    setSupabaseReady(config.isConfigured);

    if (config.isConfigured && client) {
      // 1. Check active session (including returning from Google OAuth redirect)
      client.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        }

        if (session?.user) {
          const email = session.user.email || '';
          const isAdm = getRoleFromEmail(email) === 'admin';
          const name =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            (isAdm ? adminCredentials.fullName : email.split('@')[0]);
          const avatar =
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email || 'user')}`;

          const userObj: UserProfile = {
            id: session.user.id,
            email,
            fullName: name,
            avatarUrl: avatar,
            role: isAdm ? 'admin' : 'customer',
          };
          setUser(userObj);
          localStorage.setItem('kllyeein_user', JSON.stringify(userObj));
        } else {
          // Check local persistence
          const savedUser = localStorage.getItem('kllyeein_user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(null);
            }
          }
        }
        setIsLoading(false);
      });

      // 2. Real-time Supabase Auth state changes
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const email = session.user.email || '';
          const isAdm = getRoleFromEmail(email) === 'admin';
          const name =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            (isAdm ? adminCredentials.fullName : email.split('@')[0]);
          const avatar =
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email || 'user')}`;

          const userObj: UserProfile = {
            id: session.user.id,
            email,
            fullName: name,
            avatarUrl: avatar,
            role: isAdm ? 'admin' : 'customer',
          };
          setUser(userObj);
          localStorage.setItem('kllyeein_user', JSON.stringify(userObj));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('kllyeein_user');
        }
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local persistence check when Supabase is not yet connected
      const savedUser = localStorage.getItem('kllyeein_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    }
  }, [adminCredentials.email]);

  // Real Supabase Google OAuth Sign In
  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    const client = getSupabaseClient();
    const config = getSupabaseConfig();

    if (!config.isConfigured || !client) {
      return {
        error:
          'Supabase is not configured yet. Please configure your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Settings or the Admin Database Tab.',
      };
    }

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : undefined;

      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Google OAuth failed to initialize.' };
    }
  };

  // Password Sign In
  const signInWithPassword = async (email: string, pass: string): Promise<{ error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = pass.trim();

    if (!trimmedEmail || !trimmedPass) {
      return { error: 'Please enter both email and password.' };
    }

    const isAdminEmail = trimmedEmail === adminCredentials.email.toLowerCase() || trimmedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();
    const isAdminPassword = trimmedPass === (adminCredentials.password || DEFAULT_ADMIN_PASSWORD) || trimmedPass === DEFAULT_ADMIN_PASSWORD;

    // Check if Administrator
    if (isAdminEmail && isAdminPassword) {
      const adminUser: UserProfile = {
        id: 'admin-osman',
        email: adminCredentials.email,
        fullName: adminCredentials.fullName,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        role: 'admin',
      };
      handleAuthSuccess(adminUser);
      return {};
    }

    // Check Supabase if configured
    const client = getSupabaseClient();
    const config = getSupabaseConfig();

    if (config.isConfigured && client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPass,
        });

        if (error) {
          return { error: error.message };
        }

        if (data?.user) {
          const isAdm = getRoleFromEmail(data.user.email) === 'admin';
          const userObj: UserProfile = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            fullName: data.user.user_metadata?.full_name || (isAdm ? adminCredentials.fullName : trimmedEmail.split('@')[0]),
            avatarUrl: data.user.user_metadata?.avatar_url,
            role: isAdm ? 'admin' : 'customer',
          };
          handleAuthSuccess(userObj);
          return {};
        }
      } catch (err: any) {
        return { error: err.message || 'Sign in failed. Please check your credentials.' };
      }
    }

    // Local registered users pool fallback
    if (typeof window !== 'undefined') {
      const storedUsersRaw = localStorage.getItem('kllyeein_registered_users');
      if (storedUsersRaw) {
        try {
          const storedUsers: Array<{ email: string; password?: string; fullName: string }> = JSON.parse(storedUsersRaw);
          const found = storedUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
          if (found) {
            if (found.password && found.password !== trimmedPass) {
              return { error: 'Incorrect password. Please try again.' };
            }
            const authedUser: UserProfile = {
              id: `user-${Date.now()}`,
              email: found.email,
              fullName: found.fullName,
              role: getRoleFromEmail(found.email),
            };
            handleAuthSuccess(authedUser);
            return {};
          }
        } catch {
          // ignore
        }
      }
    }

    return { error: 'Account not found. Please click Sign Up to create your account or continue with Google.' };
  };

  // Sign Up / Create New Account
  const signUpWithPassword = async (fullName: string, email: string, pass: string): Promise<{ error?: string }> => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanName) {
      return { error: 'Please enter your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (cleanPass.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    // If Supabase is configured, create Supabase user
    const client = getSupabaseClient();
    const config = getSupabaseConfig();

    if (config.isConfigured && client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            fullName: cleanName,
            role: getRoleFromEmail(cleanEmail),
          };
          handleAuthSuccess(newUser);
          return {};
        }
      } catch (err: any) {
        return { error: err.message || 'Registration failed with Supabase.' };
      }
    }

    // Store in local registered users pool
    if (typeof window !== 'undefined') {
      try {
        const existingUsers = JSON.parse(localStorage.getItem('kllyeein_registered_users') || '[]');
        existingUsers.push({
          email: cleanEmail,
          password: cleanPass,
          fullName: cleanName,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('kllyeein_registered_users', JSON.stringify(existingUsers));
      } catch {
        // ignore
      }
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      fullName: cleanName,
      role: getRoleFromEmail(cleanEmail),
    };

    handleAuthSuccess(newUser);
    return {};
  };

  // Update Admin Credentials
  const updateAdminCredentials = async (data: {
    email: string;
    password?: string;
    fullName?: string;
  }): Promise<{ success?: boolean; error?: string }> => {
    try {
      const newEmail = data.email.trim().toLowerCase();
      if (!newEmail || !newEmail.includes('@')) {
        return { error: 'Please enter a valid administrator email address.' };
      }

      const newFullName = data.fullName?.trim() || adminCredentials.fullName || 'Admin';
      const newPassword = data.password ? data.password.trim() : (adminCredentials.password || DEFAULT_ADMIN_PASSWORD);

      const updatedCreds: AdminCredentials = {
        email: newEmail,
        password: newPassword,
        fullName: newFullName,
      };

      setAdminCredentials(updatedCreds);
      localStorage.setItem('kllyeein_admin_credentials', JSON.stringify(updatedCreds));

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

  // Save Supabase Settings dynamically
  const saveSupabaseSettings = (url: string, key: string): boolean => {
    const success = saveSupabaseConfig(url, key);
    const updatedConfig = getSupabaseConfig();
    setSupabaseReady(updatedConfig.isConfigured);
    return success;
  };

  // Sign Out
  const signOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    localStorage.removeItem('kllyeein_user');
  };

  // Checkout Authentication Gate
  const requireAuthForCheckout = (proceedToCheckout: () => void) => {
    if (user) {
      proceedToCheckout();
    } else {
      setPendingCheckoutCallback(() => proceedToCheckout);
      setIsAuthModalOpen(true, 'checkout');
    }
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
        isAuthModalOpen,
        authModalContext,
        setIsAuthModalOpen,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        updateAdminCredentials,
        signOut,
        requireAuthForCheckout,
        isSupabaseConfigured: supabaseReady,
        saveSupabaseSettings,
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
