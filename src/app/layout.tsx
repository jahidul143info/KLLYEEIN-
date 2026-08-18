import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';

export const metadata: Metadata = {
  title: 'KLLYEEIN TECH | Luxury Cyber Gadgets & Flagship Electronics',
  description: 'Premier e-commerce store for titanium smartphones, neural audio, quantum smartwatches, and MagSafe accessories with express Bangladesh delivery.',
  openGraph: {
    title: 'KLLYEEIN TECH | Luxury Cyber Gadgets',
    description: 'Premier e-commerce store for titanium smartphones, neural audio, and cyber accessories.',
    url: 'https://kllyeein-gadgets.vercel.app',
    siteName: 'KLLYEEIN TECH',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'KLLYEEIN Cyber Tech Store'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KLLYEEIN TECH | Luxury Cyber Gadgets',
    description: 'Premier e-commerce store for titanium smartphones, neural audio, and cyber accessories.',
    images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#090a0f] text-slate-100 min-h-screen flex flex-col selection:bg-cyan-400 selection:text-black">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
