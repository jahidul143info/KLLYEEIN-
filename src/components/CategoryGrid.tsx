'use client';

import React from 'react';
import { CATEGORIES } from '../data/products';
import { Smartphone, Headphones, Watch, Zap, Home, ArrowUpRight } from 'lucide-react';

const iconMap: Record<string, any> = {
  Smartphone,
  Headphones,
  Watch,
  Zap,
  Home
};

export default function CategoryGrid() {
  return (
    <section id="categories" className="py-12 border-t border-b border-white/10 bg-[#07080d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              CURATED CATEGORIES
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight font-mono">
              SHOP BY CYBER DOMAIN
            </h2>
          </div>
          <p className="text-xs text-gray-400 max-w-md">
            Explore cutting-edge smartphones, spatial headphones, titanium smartwatches, and MagSafe accessories.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Zap;

            return (
              <a
                key={cat.id}
                href={`/?category=${cat.slug}#products`}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', `/?category=${cat.slug}#products`);
                  window.dispatchEvent(new Event('popstate'));
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative rounded-3xl overflow-hidden p-5 bg-surface/70 border border-white/10 hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between h-60 hover:-translate-y-1 shadow-lg cursor-pointer"
              >
                {/* Background Image with Dark Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-35 group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/80 to-transparent" />
                </div>

                {/* Top Icon & Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 space-y-1">
                  <p className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase">
                    {cat.itemCount} PRODUCTS
                  </p>
                  <h3 className="text-sm font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{cat.description}</p>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
