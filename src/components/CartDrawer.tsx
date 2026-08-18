'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    discountAmount,
    shippingFee,
    totalPrice,
    promoCode,
    applyPromoCode,
    promoError
  } = useCart();

  const { user, requireAuthForCheckout } = useAuth();
  const [inputPromo, setInputPromo] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPromo) {
      applyPromoCode(inputPromo);
    }
  };

  const handleProceedToCheckout = () => {
    requireAuthForCheckout(() => {
      setIsCheckoutOpen(true);
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0d14] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Cart Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Cyber Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-surface/80 border border-white/10 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-sm font-bold text-white">Your cart is empty</p>
                <p className="text-xs text-gray-400">Explore our flagship devices and add items to get started.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-4 rounded-2xl bg-surface/60 border border-white/10 flex items-center gap-3"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-black/50 border border-white/5 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate font-mono">{item.product.name}</h4>
                    <p className="text-[11px] text-cyan-400 font-bold font-mono">
                      ৳{item.product.price.toLocaleString()} BDT
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-lg bg-surface border border-white/15 text-gray-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white font-mono px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 rounded-lg bg-surface border border-white/15 text-gray-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#07080d] space-y-4">
              
              {/* Promo Code Form */}
              <form onSubmit={handleApplyCode} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Promo Code (KLLYEEIN10)"
                    value={inputPromo}
                    onChange={(e) => setInputPromo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase"
                >
                  Apply
                </button>
              </form>

              {promoError && <p className="text-[10px] text-red-400">{promoError}</p>}
              {promoCode && <p className="text-[10px] text-emerald-400 font-bold">✓ Coupon {promoCode} Applied!</p>}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-300 border-t border-b border-white/5 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="font-mono">৳{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount:</span>
                    <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Express Delivery:</span>
                  <span className="font-mono">{shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Total Amount:</span>
                  <span className="text-cyan-400 font-mono">৳{totalPrice.toLocaleString()} BDT</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
