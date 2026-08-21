'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Headphones, CreditCard, Send, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
              <p className="text-[11px] text-gray-400">Fast 24-48 hr nationwide delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/50 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">100% Genuine Warranty</p>
              <p className="text-[11px] text-gray-400">Official brand replacement support</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/50 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">bKash / Nagad / COD</p>
              <p className="text-[11px] text-gray-400">Secure instant checkout & pay on delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface/50 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">24/7 VIP Support</p>
              <p className="text-[11px] text-gray-400">Hotline & WhatsApp Support</p>
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
                src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                alt="KLLYEEIN Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-black tracking-tight text-white font-mono">KLLYEEIN</span>
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-sm text-xs">
            The premier destination for luxury cybernetic gadgets, titanium flagship smartphones, spatial acoustics, and high-performance wearable tech across Bangladesh.
          </p>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center gap-2.5 text-gray-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Jamuna Future Park, Level 4 (Zone D, Shop 402), Dhaka</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hotline / WhatsApp: <strong className="text-white font-mono">+880 1700-112233</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Showroom: 10:00 AM – 09:00 PM (Weekly Off: Wednesday)</span>
            </div>
          </div>
        </div>

        {/* Quick Categories */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-mono">Categories</h3>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Smartphones & Flagships</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Spatial Acoustics & ANC</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Quantum Wearables & Rings</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">MagSafe & GaN Chargers</a></li>
            <li><a href="#categories" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Cinematic Drones & 4K Gimbals</a></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-mono">Customer Care</h3>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/track" className="text-cyan-400 font-bold hover:underline transition-colors flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Track Order Status</Link></li>
            <li><Link to="/checkout" className="hover:text-cyan-400 transition-colors">Express Checkout</Link></li>
            <li><a href="#products" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-cyan-400 transition-colors cursor-pointer">Explore Catalog</a></li>
            <li><span className="text-gray-400 hover:text-white cursor-pointer">Official Warranty Policy</span></li>
            <li><span className="text-gray-400 hover:text-white cursor-pointer">7-Day Replacement Guarantee</span></li>
            <li><span className="text-gray-400 hover:text-white cursor-pointer">Nationwide Courier Coverage</span></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">VIP Cyber Newsletter</h3>
          <p className="text-xs text-gray-400">Subscribe for early access to flagship drops, flash sales & promo coupons.</p>
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
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
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
            © {new Date().getFullYear()} KLLYEEIN GADGETS BANGLADESH. All Rights Reserved.
          </p>
          <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
            <span>Genuine Product Guarantee</span>
            <span>•</span>
            <span>Secure bKash / Nagad / POS</span>
            <span>•</span>
            <span>Fast Express BD Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
