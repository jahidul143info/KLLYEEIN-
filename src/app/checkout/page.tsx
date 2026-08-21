'use client';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
  PhoneCall,
  MapPin,
  Tag,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';
import { getStoreSettings, StoreSettings, DEFAULT_STORE_SETTINGS } from '../../data/storeSettings';

const BANGLADESH_DIVISIONS = [
  { name: 'Dhaka City (24H Express)', fee: 60, isDhaka: true },
  { name: 'Dhaka Suburbs (Gazipur / Narayanganj / Savar)', fee: 100, isDhaka: false },
  { name: 'Chittagong Division', fee: 120, isDhaka: false },
  { name: 'Sylhet Division', fee: 120, isDhaka: false },
  { name: 'Rajshahi Division', fee: 120, isDhaka: false },
  { name: 'Khulna Division', fee: 120, isDhaka: false },
  { name: 'Barisal Division', fee: 120, isDhaka: false },
  { name: 'Rangpur Division', fee: 120, isDhaka: false },
  { name: 'Mymensingh Division', fee: 120, isDhaka: false },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    discountAmount,
    totalPrice,
    promoCode,
    applyPromoCode,
    promoError,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
  } = useCart();

  const { user, setIsAuthModalOpen } = useAuth();

  // Store Settings (Dynamic Payment Numbers, Delivery Rates)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getStoreSettings());

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedDivision, setSelectedDivision] = useState(BANGLADESH_DIVISIONS[0].name);
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket' | 'card'>('cod');
  const [trxId, setTrxId] = useState('');
  const [inputPromo, setInputPromo] = useState('');

  // UI state
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    phone: string;
    address: string;
    paymentMethod: string;
    date: string;
  } | null>(null);

  // Sync with logged in user profile
  useEffect(() => {
    if (user?.fullName && !fullName) setFullName(user.fullName);
    if (user?.email && !email) setEmail(user.email);
  }, [user]);

  // Sync store settings & payment numbers
  useEffect(() => {
    const handleUpdate = () => setStoreSettings(getStoreSettings());
    window.addEventListener('kllyeein_settings_updated', handleUpdate);
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings) {
          setStoreSettings((prev) => ({ ...prev, ...d.settings }));
        }
      })
      .catch(() => {});
    return () => window.removeEventListener('kllyeein_settings_updated', handleUpdate);
  }, []);

  // Dynamic Shipping Fee based on division and order subtotal
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.name === selectedDivision) || BANGLADESH_DIVISIONS[0];
  const dynamicShippingFee = subtotal > 150000 || cart.length === 0 ? 0 : currentDivisionObj.fee;
  const finalTotalAmount = Math.max(0, subtotal - discountAmount + dynamicShippingFee);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPromo.trim()) {
      applyPromoCode(inputPromo.trim());
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Enforce Authentication Requirement
    if (!user) {
      setErrorMsg('Please log in or create an account to confirm and place your order.');
      setIsAuthModalOpen(true, 'checkout');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your shopping cart is empty. Please add items to checkout.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full recipient name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 11-digit Bangladesh phone number.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Please enter your detailed street and delivery address.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      setErrorMsg(`Please enter your ${paymentMethod.toUpperCase()} Transaction ID (TrxID) after sending money.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          totalPrice: finalTotalAmount,
          shippingFee: dynamicShippingFee,
          paymentMethod,
          trxId: trxId.trim() || `TXN_${paymentMethod.toUpperCase()}_${Date.now()}`,
          userEmail: user?.email || email.trim() || 'customer@kllyeein.com',
          shippingAddress: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: selectedDivision,
            notes: deliveryNotes.trim(),
          },
        }),
      });

      const data = await response.json();
      const orderId = data.order?.orderNumber || data.transactionId || `KLY-${Math.floor(100000 + Math.random() * 900000)}`;

      // Save to localStorage for instant real-time sync with Admin panel
      try {
        const existingLocal = JSON.parse(localStorage.getItem('kllyeein_orders') || '[]');
        const placedOrderRecord = {
          id: data.order?.id || `ord_${Date.now()}`,
          orderNumber: orderId,
          userEmail: user?.email || email.trim() || 'customer@kllyeein.com',
          status: 'pending',
          items: cart,
          totalAmount: finalTotalAmount,
          shippingFee: dynamicShippingFee,
          paymentMethod: paymentMethod.toUpperCase(),
          trxId: trxId.trim() || `TXN_${paymentMethod.toUpperCase()}_${Date.now()}`,
          shippingAddress: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: selectedDivision,
            notes: deliveryNotes.trim(),
          },
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('kllyeein_orders', JSON.stringify([placedOrderRecord, ...existingLocal]));
      } catch {
        // storage fallback
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#00F2FE', '#8A2387', '#10B981', '#F59E0B'],
        });
      } catch {
        // ignore confetti errors
      }

      setConfirmedOrder({
        orderNumber: orderId,
        totalAmount: finalTotalAmount,
        phone: phone.trim(),
        address: `${address.trim()}, ${selectedDivision}`,
        paymentMethod: paymentMethod.toUpperCase(),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });

      clearCart();
    } catch (err: any) {
      console.error('Order submission error:', err);
      // Fallback local confirmation
      const fallbackOrderId = `KLY-${Math.floor(100000 + Math.random() * 900000)}`;
      
      try {
        const existingLocal = JSON.parse(localStorage.getItem('kllyeein_orders') || '[]');
        const fallbackRecord = {
          id: `ord_${Date.now()}`,
          orderNumber: fallbackOrderId,
          userEmail: user?.email || email.trim() || 'customer@kllyeein.com',
          status: 'pending',
          items: cart,
          totalAmount: finalTotalAmount,
          shippingFee: dynamicShippingFee,
          paymentMethod: paymentMethod.toUpperCase(),
          trxId: trxId.trim() || `TXN_${paymentMethod.toUpperCase()}_${Date.now()}`,
          shippingAddress: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: selectedDivision,
            notes: deliveryNotes.trim(),
          },
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('kllyeein_orders', JSON.stringify([fallbackRecord, ...existingLocal]));
      } catch {
        // storage fallback
      }

      setConfirmedOrder({
        orderNumber: fallbackOrderId,
        totalAmount: finalTotalAmount,
        phone: phone.trim(),
        address: `${address.trim()}, ${selectedDivision}`,
        paymentMethod: paymentMethod.toUpperCase(),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS VIEW
  if (confirmedOrder) {
    return (
      <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex items-center justify-center">
        <div className="w-full rounded-3xl bg-[#0d0f18] border border-cyan-500/30 p-6 sm:p-10 shadow-2xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-300">
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
              ORDER PLACED SUCCESSFULLY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
              THANK YOU FOR YOUR ORDER!
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
              We have received your order and our logistics team is preparing your package for express dispatch.
            </p>
          </div>

          {/* Order Receipt Box */}
          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-left space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
              <div>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Order Tracking ID</span>
                <span className="text-lg font-black text-cyan-400">{confirmedOrder.orderNumber}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Total Amount</span>
                <span className="text-base font-black text-emerald-400">
                  ৳{confirmedOrder.totalAmount.toLocaleString()} BDT
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Recipient Phone:</span>
                <span className="text-white font-bold">{confirmedOrder.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Payment Method:</span>
                <span className="text-white font-bold">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 block text-[11px]">Delivery Destination:</span>
                <span className="text-gray-200">{confirmedOrder.address}</span>
              </div>
            </div>
          </div>

          {/* Guarantee & Hotline */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-cyan-300 text-left">
              <PackageCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Estimated Delivery: <strong>24–48 Hours</strong> (Real-time SMS update will be sent)</span>
            </div>
            <a
              href="tel:01700112233"
              className="text-xs font-mono font-bold text-white hover:text-cyan-300 flex items-center gap-1.5 shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span>01700-112233</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg cursor-pointer"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-4 rounded-2xl bg-surface border border-white/15 text-white font-bold text-xs uppercase hover:bg-white/10 transition-colors"
            >
              Print Receipt
            </button>
          </div>

        </div>
      </div>
    );
  }

  // EMPTY CART VIEW
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] py-16 px-4 max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-mono">YOUR CART IS EMPTY</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Looks like you haven&apos;t added any gadgets yet. Explore our flagship tech products to place an order.
          </p>
        </div>
        <Link
          to="/"
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors font-mono mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
              <span>EXPRESS CHECKOUT</span>
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> SSL 256-bit Secure
            </span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            <span className="w-4 h-4 rounded-full bg-cyan-400 text-black text-[10px] flex items-center justify-center font-bold">1</span>
            <span>Delivery</span>
          </span>
          <span className="text-gray-600">→</span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
            <span className="w-4 h-4 rounded-full bg-purple-400 text-black text-[10px] flex items-center justify-center font-bold">2</span>
            <span>Payment</span>
          </span>
          <span className="text-gray-600">→</span>
          <span className="text-gray-500 hidden sm:inline">3. Confirmation</span>
        </div>
      </div>

      {/* Account Verification & Login Banner */}
      {!user ? (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-pink-500/15 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                Account Required
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                Please Sign In or Create an Account to Confirm Order
              </h3>
              <p className="text-xs text-gray-300 max-w-xl">
                To guarantee genuine brand warranty, parcel tracking, and order history, please log in or create a quick account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true, 'checkout')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Sign In / Register Now
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center font-mono text-sm shadow">
              {user.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-mono block">Ordering as</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{user.fullName || user.email}</span>
                <span className="text-cyan-300 font-mono text-[11px]">({user.email})</span>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Customer
          </span>
        </div>
      )}

      {/* Mobile Collapsible Order Summary Drawer */}
      <div className="lg:hidden rounded-2xl bg-[#0e101a] border border-white/10 overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full p-4 flex items-center justify-between text-xs text-gray-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span className="font-bold font-mono">
              Order Summary ({totalItems} items)
            </span>
            {isMobileSummaryOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <span className="text-sm font-black text-cyan-400 font-mono">
            ৳{finalTotalAmount.toLocaleString()} BDT
          </span>
        </button>

        {isMobileSummaryOpen && (
          <div className="p-4 border-t border-white/10 space-y-4 bg-black/40 animate-in fade-in duration-200">
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-white/5">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-2 first:pt-0 flex items-center gap-3">
                  <img
                    src={getCloudinaryImageUrl(item.product.images[0] || '', { width: 120, quality: 'auto' })}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-black border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate font-mono">{item.product.name}</p>
                    <p className="text-[11px] text-gray-400">Qty: {item.quantity} × ৳{item.product.price.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-gray-300 border-t border-white/10 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span className="font-mono text-white">৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Coupon Discount ({promoCode}):</span>
                  <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Charge ({currentDivisionObj.name.split(' ')[0]}):</span>
                <span className="font-mono text-white">{dynamicShippingFee === 0 ? 'FREE' : `৳${dynamicShippingFee}`}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Checkout Form Grid */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Details & Payment (8 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Customer Delivery Details */}
          <div className="p-6 sm:p-7 rounded-3xl bg-surface/80 border border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">
                    1. Delivery Information
                  </h2>
                  <p className="text-[11px] text-gray-400">Where should we deliver your luxury gadgets?</p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                  <span>Recipient Full Name</span> <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jahidul Islam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Phone Number (11-digit)</span> <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01700000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Region / Division Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">Delivery City / Zone <span className="text-pink-500">*</span></span>
                  <span className="text-[11px] text-cyan-400 font-normal font-mono">
                    {dynamicShippingFee === 0 ? 'Free Shipping Active' : `Charge: ৳${dynamicShippingFee}`}
                  </span>
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-black/80 border border-white/15 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.name} value={div.name}>
                      {div.name} {div.fee === 60 ? '(৳60 / 24h Express)' : `(৳${div.fee})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detailed Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                  <span>Detailed Street / Area / House Address</span> <span className="text-pink-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Road #, Sector / Area, Landmark (e.g. Flat 4B, Road 12, Banani, Dhaka)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              {/* Optional Order Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, deliver after 3 PM"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="p-6 sm:p-7 rounded-3xl bg-surface/80 border border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">
                    2. Payment Method
                  </h2>
                  <p className="text-[11px] text-gray-400">Select how you would like to complete payment</p>
                </div>
              </div>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Cash On Delivery */}
              {storeSettings.codEnabled !== false && (
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">Cash on Delivery (COD)</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                        POPULAR
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Pay with cash after checking your package upon doorstep arrival.
                    </p>
                  </div>
                </div>
              )}

              {/* bKash */}
              <div
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-950/40 border-pink-500 ring-2 ring-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  {paymentMethod === 'bkash' && <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">bKash Mobile</span>
                    <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 text-[10px] font-mono font-bold">
                      INSTANT
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {storeSettings.bkashType || 'Personal (Send Money)'} — {storeSettings.bkashNumber || '01700-112233'}
                  </p>
                </div>
              </div>

              {/* Nagad */}
              <div
                onClick={() => setPaymentMethod('nagad')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  paymentMethod === 'nagad'
                    ? 'bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                  {paymentMethod === 'nagad' && <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">Nagad Mobile</span>
                    <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {storeSettings.nagadType || 'Personal (Send Money)'} — {storeSettings.nagadNumber || '01700-112233'}
                  </p>
                </div>
              </div>

              {/* Rocket (if configured) */}
              {Boolean(storeSettings.rocketNumber) && (
                <div
                  onClick={() => setPaymentMethod('rocket')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    paymentMethod === 'rocket'
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    {paymentMethod === 'rocket' && <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">Rocket / DBBL</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {storeSettings.rocketNumber} ({storeSettings.rocketType || 'Personal'})
                    </p>
                  </div>
                </div>
              )}

              {/* Card / POS */}
              {storeSettings.cardEnabled !== false && (
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    paymentMethod === 'card'
                      ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">Credit / Debit Card / POS</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Visa, MasterCard, Amex POS machine will be brought upon delivery.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* bKash / Nagad / Rocket Interactive Instructions Drawer */}
            {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (() => {
              const activeNumber =
                paymentMethod === 'bkash'
                  ? storeSettings.bkashNumber || '01700-112233'
                  : paymentMethod === 'nagad'
                  ? storeSettings.nagadNumber || '01700-112233'
                  : storeSettings.rocketNumber || '01700-112233-0';

              const activeType =
                paymentMethod === 'bkash'
                  ? storeSettings.bkashType || 'Personal (Send Money)'
                  : paymentMethod === 'nagad'
                  ? storeSettings.nagadType || 'Personal (Send Money)'
                  : storeSettings.rocketType || 'Personal (Send Money)';

              const activeInstructions =
                paymentMethod === 'bkash'
                  ? storeSettings.bkashInstructions
                  : paymentMethod === 'nagad'
                  ? storeSettings.nagadInstructions
                  : '';

              const cleanDigits = activeNumber.replace(/[^0-9]/g, '');

              return (
                <div className="p-5 rounded-2xl bg-black/70 border border-white/15 space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase font-mono">
                        Official {paymentMethod.toUpperCase()} Wallet:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                        {activeType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-cyan-300 font-mono font-black">{activeNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(cleanDigits)}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-white/20 text-white hover:text-cyan-400 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {activeInstructions ? (
                    <div className="text-[11px] text-gray-300 whitespace-pre-line leading-relaxed bg-surface/60 p-3.5 rounded-xl border border-white/5 font-mono">
                      {activeInstructions}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-300 space-y-1 leading-relaxed bg-surface/60 p-3.5 rounded-xl border border-white/5 font-mono">
                      <p>1. Open your <strong>{paymentMethod.toUpperCase()} App</strong> and choose <strong>&quot;{activeType.includes('Merchant') ? 'Make Payment' : 'Send Money'}&quot;</strong>.</p>
                      <p>2. Send <strong>৳{finalTotalAmount.toLocaleString()} BDT</strong> to the number above ({activeNumber}).</p>
                      <p>3. Copy and paste the <strong>Transaction ID (TrxID)</strong> into the verification box below.</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                      <span>{paymentMethod.toUpperCase()} Transaction ID (TrxID)</span> <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9J83KL492X"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white placeholder-gray-500 font-mono text-xs sm:text-sm uppercase focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Sticky Order Summary & Direct Place Order CTA (5 Columns) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Summary Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-white/10 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>ORDER SUMMARY ({totalItems})</span>
              </h3>
              <Link to="/cart" className="text-xs text-cyan-400 hover:underline font-mono">
                Edit Cart
              </Link>
            </div>

            {/* Item List with Quantity adjustments */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto scrollbar-thin divide-y divide-white/5 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={getCloudinaryImageUrl(item.product.images[0] || '', { width: 140, quality: 'auto' })}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-black/60 border border-white/10 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-white font-mono truncate">{item.product.name}</p>
                    <p className="text-xs text-cyan-400 font-mono font-bold">
                      ৳{item.product.price.toLocaleString()} BDT
                    </p>

                    {/* Qty pill */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-md bg-surface border border-white/10 text-gray-300 hover:text-white"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1.5">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 rounded-md bg-surface border border-white/10 text-gray-300 hover:text-white"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon: KLLYEEIN10"
                    value={inputPromo}
                    onChange={(e) => setInputPromo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {promoError && <p className="text-[11px] text-red-400">{promoError}</p>}
              {promoCode && (
                <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Coupon &quot;{promoCode}&quot; Applied!
                </p>
              )}
            </div>

            {/* Pricing Table */}
            <div className="space-y-2.5 text-xs text-gray-300 border-t border-b border-white/10 py-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span className="font-mono text-white">৳{subtotal.toLocaleString()} BDT</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-৳{discountAmount.toLocaleString()} BDT</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Express Shipping:</span>
                </span>
                <span className="font-mono text-white">
                  {dynamicShippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    `৳${dynamicShippingFee} BDT`
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
                <div>
                  <span className="text-sm sm:text-base font-black text-white">Total Payable:</span>
                  <span className="block text-[10px] text-gray-400 font-mono">Includes VAT & Taxes</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                  ৳{finalTotalAmount.toLocaleString()} BDT
                </span>
              </div>
            </div>

            {/* Submit / Confirm Order CTA */}
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('Please log in or create an account to confirm your order.');
                  setIsAuthModalOpen(true, 'checkout');
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-600 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:opacity-95 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In / Register to Confirm (৳{finalTotalAmount.toLocaleString()})</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Placing Your Order...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Order (৳{finalTotalAmount.toLocaleString()})</span>
                  </>
                )}
              </button>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Authentic Brand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>7-Day Easy Return</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>1-Year Warranty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>24-Hour Dispatch</span>
              </div>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
}
