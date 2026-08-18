import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';

import HomePage from './app/page';
import ProductPage from './app/product/[slug]/page';
import CartPage from './app/cart/page';
import AdminPage from './app/admin/page';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="bg-[#090a0f] text-slate-100 min-h-screen flex flex-col selection:bg-cyan-400 selection:text-black font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
            <AuthModal />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
