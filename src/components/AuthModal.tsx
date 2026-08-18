'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Mail,
  Lock,
  User,
  LogOut,
  PackageCheck,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  KeyRound,
  Cloud,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getSupabaseConfig } from '../lib/supabase';

export default function AuthModal() {
  const {
    user,
    isAdmin,
    isAuthModalOpen,
    setIsAuthModalOpen,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    isSupabaseConfigured,
    saveSupabaseSettings,
  } = useAuth();

  const { setIsCartOpen } = useCart();

  // Tab State: 'signin' vs 'signup'
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Quick Supabase Setup Box state
  const [showSupabaseSetup, setShowSupabaseSetup] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [supabaseSetupSuccess, setSupabaseSetupSuccess] = useState(false);

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset errors when modal opens/closes or tab changes
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [tab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Handle Sign In Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithPassword(email, password);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signUpWithPassword(fullName, email, password);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d1017] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED IN VIEW */}
        {user ? (
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 p-[2px] mx-auto">
                <div className="w-full h-full bg-[#0d1017] rounded-full flex items-center justify-center text-xl font-bold text-white uppercase overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0) || 'U'
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user.fullName}</h3>
                <p className="text-xs text-gray-400 font-mono">{user.email}</p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                {isAdmin ? 'Administrator' : 'Customer Account'}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 flex items-center justify-between text-xs font-medium text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <PackageCheck className="w-4 h-4 text-cyan-400" />
                  <span>My Cart & Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="w-full p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-xs font-semibold text-cyan-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Admin Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            <button
              onClick={async () => {
                await signOut();
                setIsAuthModalOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* GUEST SIGN IN / SIGN UP */
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-cyan-500/30 shadow-lg mx-auto bg-black flex items-center justify-center mb-3">
                <img
                  src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                  alt="KLLYEEIN"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {tab === 'signin' ? 'Welcome Back' : 'Create an Account'}
              </h3>
              <p className="text-xs text-gray-400">
                {tab === 'signin' ? 'Sign in to access your orders and checkout' : 'Join KLLYEEIN for fast checkout and order tracking'}
              </p>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {successMessage}
              </div>
            )}

            {/* Direct Google Sign In Button */}
            <div className="space-y-2">
              <button
                onClick={async () => {
                  if (!isSupabaseConfigured) {
                    setShowSupabaseSetup(true);
                    setErrorMessage('Please connect your Supabase Project URL & Anon Key below to enable Google 1-Click Sign-in.');
                    return;
                  }
                  await handleGoogleSignIn();
                }}
                disabled={loading}
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Supabase Quick Connection Drawer */}
              {(!isSupabaseConfigured || showSupabaseSetup) && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-mono">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Supabase Project Setup</span>
                    </div>
                    {isSupabaseConfigured && (
                      <button
                        type="button"
                        onClick={() => setShowSupabaseSetup(false)}
                        className="text-[11px] text-gray-400 hover:text-white"
                      >
                        Hide
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Google Sign-in requires your Supabase Project URL & Anon Key. Enter them below:
                  </p>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-cyan-400" /> Project URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://your-project.supabase.co"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 placeholder-gray-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-cyan-400" /> Anon Public Key
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 placeholder-gray-600"
                      />
                    </div>

                    {supabaseSetupSuccess && (
                      <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Connected! Now click &quot;Continue with Google&quot;</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
                          setErrorMessage('Please enter both Supabase URL and Anon Key.');
                          return;
                        }
                        const ok = saveSupabaseSettings(supabaseUrlInput, supabaseKeyInput);
                        if (ok) {
                          setSupabaseSetupSuccess(true);
                          setErrorMessage(null);
                          setTimeout(() => {
                            setSupabaseSetupSuccess(false);
                          }, 3500);
                        } else {
                          setErrorMessage('Invalid URL or Key. Please check the values.');
                        }
                      }}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                    >
                      Save & Connect Supabase
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Divider */}
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium my-1">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[11px] uppercase tracking-wider text-gray-400">or</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-gray-400 hover:text-cyan-300 transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign In / Create Account */}
            <div className="text-center pt-1 text-xs text-gray-400">
              {tab === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
