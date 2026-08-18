'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Truck, Headphones, CreditCard, Send, Database } from 'lucide-react';
import SupabaseSqlScriptModal from './SupabaseSqlScriptModal';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#05060a] border-t border-white/10 text-gray-400 text-xs">
      {/* Guarantees Bar */}
      <div className="border-b border-white/10 bg-surface/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/50 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">Express BD Shipping</p>
              <p className="text-[11px] text-gray-400">Fast 24-48 hr delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/50 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">100% Genuine Warranty</p>
              <p className="text-[11px] text-gray-400">Official brand replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/50 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">bKash / Nagad / Cards</p>
              <p className="text-[11px] text-gray-400">Secure instant checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/50 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">24/7 VIP Support</p>
              <p className="text-[11px] text-gray-400">Hotline & AI Assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand info */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-md bg-black flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039659/WhatsApp_Image_2026-08-18_at_1.53.57_PM_g4na9f.jpg"
                alt="KLLYEEIN Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-white font-mono">KLLYEEIN</span>
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-sm text-xs">
            The premier destination for luxury cybernetic gadgets, titanium flagship smartphones, spatial acoustics, and high-performance wearable tech.
          </p>

          {/* Database Schema Button */}
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 text-xs font-semibold transition-all"
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>Supabase SQL Setup Script</span>
          </button>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Categories</h3>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Smartphones</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Neural Audio</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Quantum Wearables</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">MagSafe Power</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Cinematic Drones</a></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Support</h3>
          <ul className="space-y-2.5 text-xs">
            <li><span className="text-gray-400 hover:text-white cursor-pointer">Order Tracking</span></li>
            <li><span className="text-gray-400 hover:text-white cursor-pointer">Warranty Claim</span></li>
            <li><span className="text-gray-400 hover:text-white cursor-pointer">Shipping Policy</span></li>
            <li><span className="text-gray-400 hover:text-white cursor-pointer">Return & Refund</span></li>
            <li><span className="text-gray-400 hover:text-white cursor-pointer">BD Store Locations</span></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">VIP Cyber Newsletter</h3>
          <p className="text-xs text-gray-400">Subscribe for early access to flagship drops & discount drops.</p>
          {subscribed ? (
            <p className="text-xs text-cyan-400 font-bold bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
              ✓ Subscribed to VIP Cyber Club!
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="border-t border-white/5 py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} KLLYEEIN TECH. Built with Next.js App Router, Supabase, Cloudinary & Tailwind CSS.
          </p>
          <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
            <span>Privacy</span>
            <span>•</span>
            <span>Terms</span>
            <span>•</span>
            <span>Vercel Deploy Ready</span>
          </div>
        </div>
      </div>

      {/* SQL Setup Modal */}
      <SupabaseSqlScriptModal isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
    </footer>
  );
}
