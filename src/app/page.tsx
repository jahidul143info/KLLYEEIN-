import React from 'react';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import ProductGrid from '../components/ProductGrid';
import AIAdvisorWidget from '../components/AIAdvisorWidget';
import { Truck, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <HeroBanner />

      {/* Categories Grid */}
      <CategoryGrid />

      {/* Main Products Grid with search, filter tabs, sorting */}
      <ProductGrid />

      {/* Gemini AI Tech Advisor Widget */}
      <AIAdvisorWidget />

      {/* Trust & Guarantee Banner */}
      <section className="py-12 bg-surface/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-6 rounded-2xl bg-surface/80 border border-white/5 space-y-2">
              <Truck className="w-8 h-8 text-cyan-400 mx-auto" />
              <h4 className="text-sm font-bold text-white font-mono">Express Delivery</h4>
              <p className="text-xs text-gray-400">24H in Dhaka, 48H nationwide across Bangladesh.</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface/80 border border-white/5 space-y-2">
              <ShieldCheck className="w-8 h-8 text-purple-400 mx-auto" />
              <h4 className="text-sm font-bold text-white font-mono">100% Genuine Warranty</h4>
              <p className="text-xs text-gray-400">Official brand seal with 1-year replacement guarantee.</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface/80 border border-white/5 space-y-2">
              <Zap className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white font-mono">bKash / Nagad / Cards</h4>
              <p className="text-xs text-gray-400">Instant mobile payment or Cash on Delivery options.</p>
            </div>

            <div className="p-6 rounded-2xl bg-surface/80 border border-white/5 space-y-2">
              <RefreshCw className="w-8 h-8 text-pink-400 mx-auto" />
              <h4 className="text-sm font-bold text-white font-mono">7-Day Replacement</h4>
              <p className="text-xs text-gray-400">Hassle-free exchange policy for hardware defects.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
