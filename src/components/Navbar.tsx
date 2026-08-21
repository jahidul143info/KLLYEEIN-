'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Zap, Cpu, Database, ChevronRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin, setIsAuthModalOpen, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/?search=${encodeURIComponent(searchQuery)}#products`);
      window.dispatchEvent(new Event('popstate'));
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left Side: Mobile Sidebar Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-surface border border-white/10 text-white hover:border-cyan-400/50 transition-colors"
              aria-label="Open Left Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo with Official Website Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(0,242,254,0.25)] group-hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] group-hover:border-cyan-400/80 transition-all bg-black flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                  alt="KLLYEEIN Logo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                KLLYEEIN
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phones, audio, drones, smartwatches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface/80 border border-white/10 text-white placeholder-gray-400 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
            />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-gray-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <a href="#categories" onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-cyan-400 transition-colors cursor-pointer">Categories</a>
            <a href="#products" onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-cyan-400 transition-colors cursor-pointer">All Gadgets</a>
            {isAdmin && (
              <Link to="/admin" className="hover:text-cyan-300 transition-all flex items-center gap-1 text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-surface border border-white/10 hover:border-cyan-400/50 text-white transition-all group cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gray-200 group-hover:text-cyan-400 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 text-black text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-black animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-surface border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              aria-label="User Account Profile"
            >
              {user ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-black uppercase">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate text-white">{user.fullName}</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Left-Side Mobile Sidebar Drawer Overlay - Rendered OUTSIDE header to prevent backdrop-filter clipping */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          {/* Left Drawer Container */}
          <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] h-full bg-[#090a0f] border-r border-white/20 shadow-2xl z-[100000] p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 shadow-md bg-black flex items-center justify-center">
                    <img
                      src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                      alt="KLLYEEIN Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-base font-black tracking-tight text-white font-mono">
                    KLLYEEIN
                  </span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/10 border border-white/15 text-gray-300 hover:text-white"
                  aria-label="Close Left Navigation Sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search gadgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-400 text-xs font-medium focus:outline-none focus:border-cyan-400"
                />
              </form>

              {/* Quick Actions inside Left Sidebar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <span>Cart ({totalItems})</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-500/20 transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>{user ? 'My Profile' : 'Login'}</span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1 text-xs font-semibold uppercase tracking-wider text-gray-300 border-t border-white/10 pt-3">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-3 rounded-xl hover:bg-white/5 hover:text-cyan-400 flex items-center justify-between transition-all"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Link>
                <a
                  href="#categories"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    const el = document.getElementById('categories');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-3 rounded-xl hover:bg-white/5 hover:text-cyan-400 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Categories</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </a>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    const el = document.getElementById('products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-3 rounded-xl hover:bg-white/5 hover:text-cyan-400 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Shop All Gadgets</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </a>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-between transition-all border border-cyan-500/20 mt-2"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Admin Control Panel
                    </span>
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </Link>
                )}

                {/* Mobile Auth Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full mt-2 px-3.5 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold flex items-center justify-between transition-all border border-purple-500/30 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    {user ? `Account (${user.fullName || user.email})` : 'Sign In / Register'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                </button>
              </nav>
            </div>

            {/* Bottom Info inside Left Sidebar */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="p-3 rounded-xl bg-surface/80 border border-white/10 text-[11px] text-gray-400 space-y-1">
                <p className="text-white font-bold">100% Authentic Warranty</p>
                <p className="text-cyan-400">Express Delivery in Bangladesh</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
