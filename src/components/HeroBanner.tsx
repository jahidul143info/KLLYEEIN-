'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, ShieldCheck, Cpu, Star, Flame } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';

export default function HeroBanner() {
  const { addToCart } = useCart();
  const featuredProduct = PRODUCTS.find((p) => p.isFeatured) || PRODUCTS[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20">
      {/* Background Neon Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-purple-600/20 to-pink-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-surface/80 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,242,254,0.15)] text-cyan-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md max-w-full">
              <Flame className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20 animate-bounce shrink-0" />
              <span className="truncate">NEXT-GEN FLAGSHIP RELEASE 2026</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-snug sm:leading-[1.1] font-mono">
              THE NEXT ERA OF <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg block sm:inline mt-1 sm:mt-0">
                CYBERNETIC TECH
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-gray-300 max-w-2xl font-sans leading-relaxed">
              Engineered with Grade 5 Aerospace Titanium, 120Hz LTPO AMOLED displays, and Neural AI Bionic chips. Discover Bangladesh’s premier luxury gadget lineup.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to={`/product/${featuredProduct.slug}`}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:shadow-[0_0_45px_rgba(0,242,254,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Shop Flagship Device</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('products');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/#products';
                  }
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-surface/80 border border-white/15 hover:border-purple-400/60 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/5 transition-all shadow-lg cursor-pointer"
              >
                <span>Explore Catalog</span>
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">100%</p>
                <p className="text-[11px] text-gray-400">Authentic Warranty</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">24/48H</p>
                <p className="text-[11px] text-gray-400">Express Delivery</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-purple-400 font-mono">4.9★</p>
                <p className="text-[11px] text-gray-400">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Product Card Spotlight */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-6 bg-surface/60 border border-white/15 backdrop-blur-2xl shadow-[0_0_50px_rgba(157,78,221,0.2)] group hover:border-cyan-400/50 transition-all">
              
              {/* Floating Badge */}
              <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-cyan-400 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                FEATURED FLAGSHIP
              </div>

              {/* Product Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/50 mb-6 border border-white/5">
                <img
                  src={featuredProduct.images[0]}
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{featuredProduct.rating}</span>
                  <span className="text-gray-400 font-normal">({featuredProduct.reviewCount} reviews)</span>
                </div>

                <h3 className="text-lg font-bold text-white font-mono leading-tight">
                  {featuredProduct.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">{featuredProduct.tagline}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <span className="text-xs text-gray-400 block">Price</span>
                    <span className="text-xl font-extrabold text-cyan-400 font-mono">
                      ৳{featuredProduct.price.toLocaleString()} BDT
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(featuredProduct)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
