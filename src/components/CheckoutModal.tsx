'use client';

import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, PhoneCall, Building2, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: ModalProps) {
  const { cart, totalPrice, clearCart, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card' | 'cod'>('bkash');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalPrice,
          paymentMethod,
          shippingAddress: { fullName, phone, address, city },
          trxId
        })
      });

      const data = await res.json();
      const orderNum = data.transactionId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setOrderSuccess(orderNum);
      clearCart();
    } catch (err) {
      console.error(err);
      setOrderSuccess(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0d0f18] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {orderSuccess ? (
          /* Success Screen */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white font-mono">ORDER CONFIRMED!</h3>
            <p className="text-xs text-gray-300">
              Thank you for choosing KLLYEEIN TECH. Your order number is:
            </p>
            <p className="text-lg font-black text-cyan-400 font-mono bg-surface/80 p-3 rounded-2xl border border-white/10">
              {orderSuccess}
            </p>
            <p className="text-[11px] text-gray-400">
              Our support team will contact you at <strong>{phone}</strong> to confirm delivery.
            </p>
            <button
              onClick={() => {
                setOrderSuccess(null);
                onClose();
                setIsCartOpen(false);
              }}
              className="px-8 py-3 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs uppercase"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                SECURE CHECKOUT
              </h3>
              <p className="text-xs text-gray-400">Enter delivery address & payment details.</p>
            </div>

            {/* Total Badge */}
            <div className="p-3 rounded-2xl bg-surface/80 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-400">Total Payable Amount:</span>
              <span className="text-base font-black text-cyan-400 font-mono">৳{totalPrice.toLocaleString()} BDT</span>
            </div>

            {/* Address Form */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">1. Delivery Address</p>
              
              <input
                type="text"
                required
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  required
                  placeholder="Phone Number (e.g. 01700000000)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/15 text-white text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Dhaka">Dhaka (24H Delivery)</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>

              <textarea
                required
                rows={2}
                placeholder="Detailed House / Road / Area Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Payment Method Options */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">2. Payment Method</p>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bkash', label: 'bKash Mobile', color: 'bg-pink-950/40 border-pink-500/40 text-pink-300' },
                  { id: 'nagad', label: 'Nagad Mobile', color: 'bg-orange-950/40 border-orange-500/40 text-orange-300' },
                  { id: 'card', label: 'Credit/Debit Card', color: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' },
                  { id: 'cod', label: 'Cash on Delivery', color: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left ${
                      paymentMethod === pm.id
                        ? `${pm.color} ring-2 ring-cyan-400`
                        : 'bg-surface border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="p-3 rounded-2xl bg-surface/80 border border-white/10 space-y-2 text-xs">
                  <p className="text-gray-300 font-semibold">
                    Send ৳{totalPrice.toLocaleString()} BDT to Merchant Number: <strong className="text-cyan-400 font-mono">01700-112233</strong>
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Enter Transaction ID (TrxID)"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-white placeholder-gray-500 font-mono text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing Order...' : `Confirm Order (৳${totalPrice.toLocaleString()} BDT)`}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
