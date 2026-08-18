'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, ShieldCheck, Zap, User, LogOut, PackageCheck, Award, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AuthModal() {
  const { user, isAuthModalOpen, setIsAuthModalOpen, signInWithGoogle, signInWithEmail, signOut, isSupabaseConfigured } = useAuth();
  const { setIsCartOpen } = useCart();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await signInWithEmail(email);
      setSentMessage(`Check your inbox (${email}) for login link or signed in demo session!`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0d0f18] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
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
                <span>KLLYEEIN VIP MEMBER</span>
              </div>
            </div>

            {/* Account Quick Options */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full p-3.5 rounded-2xl bg-surface/80 border border-white/10 hover:border-cyan-400/50 flex items-center justify-between text-xs font-semibold text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <span>My Cart & Checkout</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              <Link
                to="/admin"
                onClick={() => setIsAuthModalOpen(false)}
                className="w-full p-3.5 rounded-2xl bg-surface/80 border border-white/10 hover:border-purple-400/50 flex items-center justify-between text-xs font-semibold text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Admin Control Panel</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </Link>
            </div>

            {/* Delivery Info */}
            <div className="p-3.5 rounded-2xl bg-surface/50 border border-white/5 space-y-1 text-xs">
              <p className="text-gray-400 text-[11px] font-semibold">Bangladesh Delivery Status:</p>
              <p className="text-cyan-300 font-bold">Express 24-48 Hours Active</p>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={async () => {
                await signOut();
                setIsAuthModalOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </button>
          </div>
        ) : sentMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-3">
            <p className="font-bold">{sentMessage}</p>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="px-6 py-2 rounded-xl bg-emerald-400 text-black font-bold text-xs uppercase"
            >
              Done
            </button>
          </div>
        ) : (
          /* Login View when logged out */
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px] mx-auto shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-[#090a0f] rounded-[15px] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white font-mono">VIP CYBER LOGIN</h3>
              <p className="text-xs text-gray-400">Sign in to track orders, save cart, & access VIP perks.</p>
            </div>

            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                onClick={signInWithGoogle}
                className="w-full py-3.5 px-4 rounded-2xl bg-white text-gray-900 font-bold text-xs flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-lg cursor-pointer"
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
                <span>or email magic link</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  {loading ? 'Sending OTP...' : 'Send Magic OTP Link'}
                </button>
              </form>

              <p className="text-[10px] text-gray-500 text-center">
                {isSupabaseConfigured ? 'Connected to Supabase Auth Service' : 'Demo Mode Active (Supabase ready)'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

