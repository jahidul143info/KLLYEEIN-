'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Tag } from 'lucide-react';
import CheckoutModal from '../../components/CheckoutModal';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    totalPrice,
    promoCode,
    applyPromoCode,
    promoError
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode) applyPromoCode(inputCode);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
            SHOPPING CART
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
            YOUR SELECTED GADGETS ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h1>
        </div>

        <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400">
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-surface/50 border border-white/10 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your Cart is Currently Empty</h3>
          <p className="text-xs text-gray-400">Explore our flagship smartphones, headphones, and smartwatches.</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Table */}
          <div className="lg:col-span-8 rounded-3xl bg-surface/60 border border-white/10 overflow-hidden p-6 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-black/50 border border-white/10 shrink-0"
                  />
                  <div className="space-y-1">
                    <Link to={`/product/${item.product.slug}`}>
                      <h3 className="text-sm font-bold text-white font-mono hover:text-cyan-300">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-cyan-400 font-bold font-mono">
                      ৳{item.product.price.toLocaleString()} BDT
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-white/15">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white font-mono px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-black text-white font-mono min-w-[80px] text-right">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Column */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-surface/90 border border-white/10 space-y-6">
            <h3 className="text-base font-bold text-white font-mono border-b border-white/10 pb-3">
              ORDER SUMMARY
            </h3>

            <form onSubmit={handleApply} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (KLLYEEIN10)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs font-mono uppercase focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase"
              >
                Apply
              </button>
            </form>

            {promoError && <p className="text-xs text-red-400">{promoError}</p>}
            {promoCode && <p className="text-xs text-emerald-400 font-bold">✓ Coupon {promoCode} Applied!</p>}

            <div className="space-y-2 text-xs text-gray-300 border-t border-b border-white/10 py-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-white">৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount:</span>
                  <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Shipping:</span>
                <span className="font-mono text-white">{shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                <span>Total Amount:</span>
                <span className="text-cyan-400 font-mono">৳{totalPrice.toLocaleString()} BDT</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
            >
              <span>Proceed To Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
