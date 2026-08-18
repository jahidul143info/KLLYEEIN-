'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Mail,
  ShieldCheck,
  Zap,
  User,
  LogOut,
  PackageCheck,
  Award,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth, DEFAULT_ADMIN_EMAIL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AuthModal() {
  const {
    user,
    isAdmin,
    isAuthModalOpen,
    authModalContext,
    setIsAuthModalOpen,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    isSupabaseConfigured,
  } = useAuth();

  const { setIsCartOpen } = useCart();

  // Tab State: 'signin' vs 'signup' vs 'google_direct'
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form States
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPasswordConfirm, setSignUpPasswordConfirm] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Google Direct Input Mode (Allows customer to enter their own custom Gmail if desired)
  const [isCustomGoogleModalOpen, setIsCustomGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

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

  // Handle Standard Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithPassword(signInEmail, signInPassword);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Welcome back! Signed in successfully.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpFullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (signUpPassword !== signUpPasswordConfirm) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signUpWithPassword(signUpFullName, signUpEmail, signUpPassword);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Account created successfully! Welcome to KLLYEEIN.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Google Sign In
  const handleGoogleAuthClick = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // If user wants to specify their real Gmail, or 1-click proceed
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Custom Gmail Input Submit
  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / Google Account email.');
      return;
    }
    setLoading(true);
    try {
      await signInWithGoogle(customGoogleEmail, customGoogleName);
      setIsCustomGoogleModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0c0e17] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close Authentication Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED IN USER PROFILE VIEW */}
        {user ? (
          <div className="space-y-6">
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-indigo-600 p-[2px] mx-auto shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-[#090a0f] rounded-[14px] flex items-center justify-center text-xl font-bold text-white font-mono uppercase overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0) || 'U'
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white font-mono">{user.fullName}</h3>
                <p className="text-xs text-gray-400 truncate font-mono">{user.email}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAdmin ? 'AUTHORIZED ADMINISTRATOR' : 'VERIFIED VIP CUSTOMER'}</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/50 flex items-center justify-between text-xs font-semibold text-white transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <span>My Cart & Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="w-full p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-xs font-bold text-cyan-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>Access Admin Control Panel</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Delivery Info */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
              <p className="text-gray-400 text-[11px] font-semibold">Fast Shipping Coverage:</p>
              <p className="text-cyan-300 font-bold">Express 24-48h Delivery Active Across Bangladesh</p>
            </div>

            {/* Sign Out */}
            <button
              onClick={async () => {
                await signOut();
                setIsAuthModalOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </button>
          </div>
        ) : (
          /* GUEST USER AUTHENTICATION SCREEN */
          <div className="space-y-5">
            {/* Header & Logo */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/20 mx-auto bg-black flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                  alt="KLLYEEIN Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-black text-white font-mono tracking-tight">
                {authModalContext === 'checkout' ? 'CHECKOUT SIGN IN' : 'KLLYEEIN MEMBER ACCESS'}
              </h3>
              <p className="text-xs text-gray-400">
                {authModalContext === 'checkout'
                  ? 'Sign in or create a quick account to confirm your order details and delivery address.'
                  : 'Access exclusive cyber prices, track shipments, and manage warranty.'}
              </p>
            </div>

            {/* Checkout Intent Notice */}
            {authModalContext === 'checkout' && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2.5 font-medium">
                <ShoppingBag className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Sign in with 1-click Google or Email to proceed directly to checkout.</span>
              </div>
            )}

            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {successMessage}
              </div>
            )}

            {/* 1-CLICK GOOGLE SIGN IN BUTTON */}
            <div className="space-y-2">
              <button
                onClick={handleGoogleAuthClick}
                disabled={loading}
                type="button"
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer active:scale-[0.99]"
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
                <span>{tab === 'signin' ? 'Continue with Google' : 'Sign Up with Google'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsCustomGoogleModalOpen(!isCustomGoogleModalOpen)}
                  className="text-[11px] text-gray-400 hover:text-cyan-300 transition-colors font-mono underline"
                >
                  {isCustomGoogleModalOpen ? 'Hide custom Gmail input' : 'Or type specific Gmail address'}
                </button>
              </div>

              {/* Custom Gmail Form Dropdown */}
              {isCustomGoogleModalOpen && (
                <form onSubmit={handleCustomGoogleSubmit} className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-2 text-xs">
                  <div className="font-bold text-cyan-300 font-mono text-[11px]">Direct Google / Gmail Login:</div>
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-white/15 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold rounded-xl text-xs uppercase"
                  >
                    Authenticate Gmail
                  </button>
                </form>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider my-2">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span>or use email and password</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Sign In vs Sign Up Tabs Switcher */}
            <div className="flex p-1 rounded-2xl bg-black/50 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 py-2 rounded-xl font-bold font-mono transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 py-2 rounded-xl font-bold font-mono transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* TAB 1: SIGN IN FORM */}
            {tab === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      {showSignInPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-indigo-600 hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-400/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    <>
                      <span>Sign In & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 text-xs text-gray-400">
                  New to KLLYEEIN?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="text-cyan-400 font-bold hover:underline font-mono"
                  >
                    Create an account
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SIGN UP / CREATE ACCOUNT FORM */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Hasan"
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tanvir@gmail.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" /> Create Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      {showSignUpPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Confirm Password *</label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-type password"
                    value={signUpPasswordConfirm}
                    onChange={(e) => setSignUpPasswordConfirm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-600 hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-400/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <>
                      <span>Register & Proceed</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 text-xs text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className="text-cyan-400 font-bold hover:underline font-mono"
                  >
                    Sign In here
                  </button>
                </div>
              </form>
            )}

            {/* Footer encryption badge */}
            <div className="text-center text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>256-Bit Encrypted Customer Authentication</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
