import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './app/page';
import ProductPage from './app/product/[slug]/page';
import CartPage from './app/cart/page';
import CheckoutPage from './app/checkout/page';
import TrackOrderPage from './app/track/page';
import AdminPage from './app/admin/page';

/**
 * Customer Storefront Layout
 * Includes Consumer Navigation, Store Cart Drawer, Customer Auth Modal, and Store Footer
 */
function StorefrontLayout() {
  return (
    <div className="bg-[#090a0f] text-slate-100 min-h-screen flex flex-col selection:bg-cyan-400 selection:text-black font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Storefront Customer Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/track" element={<TrackOrderPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
            </Route>

            {/* Pure, Dedicated Admin Panel Console (Zero Customer UI Clutter) */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

