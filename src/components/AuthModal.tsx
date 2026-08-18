'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, ShieldCheck, Zap, User, LogOut, PackageCheck, Award, ChevronRight, Lock, KeyRound } from 'lucide-react';
import { useAuth, DEFAULT_ADMIN_EMAIL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AuthModal() {
  const { user, isAdmin, isAuthModalOpen, setIsAuthModalOpen, signInWithGoogle, signInWithEmail, signInWithPassword, signOut, isSupabaseConfigured } = useAuth();
  const { setIsCartOpen } = useCart();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithPassword(email, password);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setIsAuthModalOpen(false);
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithEmail(email);
      setSentMessage(`Check your inbox (${email}) for login link or signed in session!`);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to send OTP link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0d0f18] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setErrorMessage(null);
            setSentMessage('');
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close Profile Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* Logged In User Profile View */
          <div className="space-y-6">
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-indigo-600 p-[2px] mx-auto shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-[#090a0f] rounded-[14px] flex items-center justify-center text-xl font-bold text-white font-mono uppercase">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white font-mono">{user.fullName}</h3>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAdmin ? 'AUTHORIZED ADMINISTRATOR' : 'KLLYEEIN VIP MEMBER'}</span>
              </div>
            </div>

            {/* Account Quick Options */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-surface/80 border border-white/10 hover:border-cyan-400/50 flex items-center justify-between text-xs font-semibold text-white transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <span>My Cart & Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Admin Panel Button ONLY for Authenticated Admin */}
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
            <div className="p-3.5 rounded-2xl bg-surface/50 border border-white/5 space-y-1 text-xs">
              <p className="text-gray-400 text-[11px] font-semibold">Bangladesh Delivery Status:</p>
              <p className="text-cyan-300 font-bold">Express 24-48 Hours Active Nationwide</p>
            </div>

            {/* Sign Out Button */}
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
        ) : sentMessage ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-4">
            <p className="font-bold">{sentMessage}</p>
            <button
              onClick={() => {
                setIsAuthModalOpen(false);
                setSentMessage('');
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-400 text-black font-bold text-xs uppercase cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          /* Login View when logged out */
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shadow-lg shadow-cyan-500/20 mx-auto bg-black flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039659/WhatsApp_Image_2026-08-18_at_1.53.57_PM_g4na9f.jpg"
                  alt="KLLYEEIN Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">ACCOUNT SIGN IN</h3>
              <p className="text-xs text-gray-400">Sign in to track orders, save items, & manage your profile.</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                onClick={signInWithGoogle}
                type="button"
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer"
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

              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider my-2">
                <div className="flex-1 h-[1px] bg-white/10" />
                <span>or sign in with email</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>

              {/* Login Tabs */}
              <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${authMode === 'password' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${authMode === 'otp' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  Magic OTP Link
                </button>
              </div>

              {/* Password Form */}
              {authMode === 'password' ? (
                <form onSubmit={handlePasswordAuth} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-600 hover:opacity-90 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                /* OTP Form */
                <form onSubmit={handleEmailOtpAuth} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    {loading ? 'Sending Link...' : 'Send Magic OTP Link'}
                  </button>
                </form>
              )}

              <p className="text-[10px] text-gray-500 text-center">
                {isSupabaseConfigured ? 'Secured by Supabase Authentication' : 'Live System Ready'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


