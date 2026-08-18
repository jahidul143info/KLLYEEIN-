'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS } from '../data/products';
import ProductCard from './ProductCard';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  useEffect(() => {
    const handleUrlParams = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const search = params.get('search');
      if (cat) {
        setActiveCategory(cat);
      }
      if (search) {
        setSearchQuery(search);
      }
    };

    handleUrlParams();
    window.addEventListener('popstate', handleUrlParams);
    return () => window.removeEventListener('popstate', handleUrlParams);
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <section id="products" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-widest block mb-1">
              FULL PRODUCT CATALOG
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight font-mono">
              FLAGSHIP CYBER GADGETS
            </h2>
          </div>

          <p className="text-xs text-gray-400 max-w-sm">
            All devices come with 100% genuine brand warranty, free express delivery in Bangladesh, and 7-day money-back guarantee.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-3xl bg-surface/90 border border-white/10 shadow-xl space-y-4">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Gadgets' },
                { id: 'phones', label: 'Phones' },
                { id: 'audio', label: 'Audio' },
                { id: 'wearables', label: 'Wearables' },
                { id: 'accessories', label: 'Accessories' },
                { id: 'smarthome', label: 'Drones & Smart Home' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === tab.id
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-600 text-black shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-surface/60 border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter gadgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-surface border border-white/15 text-white text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/5">
            <span>Showing <strong className="text-cyan-300 font-bold">{filteredProducts.length}</strong> gadgets</span>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="text-purple-400 hover:text-purple-300 font-bold underline"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface/50 border border-white/10 space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-white">No gadgets match your search query</h3>
            <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
