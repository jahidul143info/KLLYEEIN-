'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Printer,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';

interface TrackedOrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  totalAmount: number;
  shippingFee: number;
  paymentMethod: string;
  trxId?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  items: TrackedOrderItem[];
  estimatedDelivery?: string;
  courierPartner?: string;
}

const SAMPLE_ORDERS = [
  { id: 'KLY-982143', label: 'iPhone 15 Pro Max', status: 'Pending' },
  { id: 'KLY-774912', label: 'AirPods Max', status: 'Processing' },
  { id: 'KLY-551209', label: 'Apple Watch Ultra 2', status: 'Delivered' },
];

export default function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('orderNumber') || searchParams.get('id') || searchParams.get('q') || '';

  const [inputOrderNumber, setInputOrderNumber] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kllyeein_recent_track_ids');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (id: string) => {
    try {
      const clean = id.trim().toUpperCase();
      const updated = Array.from(new Set([clean, ...recentSearches])).slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('kllyeein_recent_track_ids', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const fetchOrderStatus = async (orderNum: string) => {
    const cleanNum = orderNum.trim();
    if (!cleanNum) {
      setErrorMsg('Please enter a valid order number to track.');
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(cleanNum)}`);
      const data = await res.json();

      if (res.ok && data.found && data.order) {
        setOrder(data.order);
        saveRecentSearch(data.order.orderNumber);
        // Update URL query without full reload
        setSearchParams({ orderNumber: data.order.orderNumber });
      } else {
        setOrder(null);
        setErrorMsg(data.error || `Order "${cleanNum}" could not be found. Please check the order tracking ID and try again.`);
      }
    } catch (err: any) {
      setOrder(null);
      setErrorMsg('Failed to connect to tracking server. Please check your internet connection or try again shortly.');
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-track if URL query param exists on mount or changes
  useEffect(() => {
    if (initialQuery) {
      fetchOrderStatus(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderStatus(inputOrderNumber);
  };

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Timeline Steps Calculation
  const getTimelineSteps = (status: TrackedOrder['status']) => {
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
      return [
        { label: 'Order Placed', desc: 'Order received in system', state: 'done' },
        { label: 'Order Cancelled', desc: 'Order suspended or cancelled', state: 'cancelled' },
      ];
    }

    const steps = [
      {
        id: 'pending',
        title: 'Order Placed',
        subtitle: 'Details received & awaiting dispatch review',
        icon: ShoppingBag,
      },
      {
        id: 'confirmed',
        title: 'Order Confirmed',
        subtitle: 'Inventory verified by warehouse team',
        icon: CheckCircle2,
      },
      {
        id: 'processing',
        title: 'Packaging & QC',
        subtitle: 'Quality checked & cyber antistatic sealed',
        icon: Package,
      },
      {
        id: 'shipped',
        title: 'Out for Delivery',
        subtitle: 'Handed over to Express Courier partner',
        icon: Truck,
      },
      {
        id: 'delivered',
        title: 'Delivered',
        subtitle: 'Package safely delivered to your doorstep',
        icon: ShieldCheck,
      },
    ];

    const statusHierarchy: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
    };

    const currentLevel = statusHierarchy[status] ?? 0;

    return steps.map((step, idx) => ({
      ...step,
      isCompleted: idx <= currentLevel,
      isCurrent: idx === currentLevel,
    }));
  };

  const getStatusBadge = (status: TrackedOrder['status']) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          label: 'DELIVERED SUCCESSFULLY',
        };
      case 'shipped':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400 animate-pulse',
          label: 'OUT FOR DELIVERY',
        };
      case 'processing':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400 animate-pulse',
          label: 'PROCESSING & PACKAGING',
        };
      case 'confirmed':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400',
          label: 'ORDER CONFIRMED',
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400',
          label: 'ORDER CANCELLED',
        };
      default:
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-pulse',
          label: 'PENDING DISPATCH',
        };
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
          <Truck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time Express Courier Tracking</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
          TRACK YOUR ORDER
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          Enter your order tracking number (e.g. <strong className="text-cyan-400 font-mono">KLY-982143</strong>) to check real-time packaging, dispatch, and delivery updates without logging in.
        </p>
      </div>

      {/* SEARCH CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f1a] border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter Order ID (e.g. KLY-982143)..."
                value={inputOrderNumber}
                onChange={(e) => setInputOrderNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/60 border border-white/20 text-white placeholder-gray-500 text-sm font-mono tracking-wider uppercase focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
              />
              {inputOrderNumber && (
                <button
                  type="button"
                  onClick={() => setInputOrderNumber('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-mono"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99] shrink-0"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Orders & Recent Searches */}
        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-gray-500">Quick Demo IDs:</span>
            {SAMPLE_ORDERS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setInputOrderNumber(sample.id);
                  fetchOrderStatus(sample.id);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-[11px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{sample.id}</span>
                <span className="text-[9px] text-gray-500">({sample.status})</span>
              </button>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-gray-500">Recent:</span>
              {recentSearches.slice(0, 3).map((rId) => (
                <button
                  key={rId}
                  type="button"
                  onClick={() => {
                    setInputOrderNumber(rId);
                    fetchOrderStatus(rId);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[10px] font-mono transition-colors"
                >
                  {rId}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE NOTIFICATION */}
      {errorMsg && (
        <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3.5 shadow-xl animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-white">Order Not Found</div>
            <p className="text-gray-300 text-xs leading-relaxed">{errorMsg}</p>
            <p className="text-[11px] text-rose-400/80 pt-1">
              Tip: Order numbers follow the format <strong className="font-mono">KLY-XXXXXX</strong>. If you placed the order just now, check your confirmation receipt.
            </p>
          </div>
        </div>
      )}

      {/* ORDER RESULTS CONTAINER */}
      {order && (
        <div className="space-y-8 animate-fade-in">
          {/* TOP ORDER SUMMARY BAR */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0d0f1a] border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
                    <span>{order.orderNumber}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderNumber(order.orderNumber)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors text-xs flex items-center gap-1 font-mono"
                    title="Copy Order ID"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>Placed on: {new Date(order.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {(() => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <div className={`px-4 py-2 rounded-2xl border ${badge.bg} text-xs font-mono font-bold flex items-center gap-2 shadow-lg`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                  title="Print Tracking Sheet"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TIMELINE PROGRESS VISUALIZER */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Live Dispatch Milestone
                </span>
                <span className="text-xs text-cyan-300 font-mono">
                  Estimated Delivery: {order.estimatedDelivery || '24–48 Hours'}
                </span>
              </div>

              {/* Desktop/Tablet Horizontal Stepper */}
              <div className="hidden md:grid grid-cols-5 gap-2 relative">
                {getTimelineSteps(order.status).map((step, idx, arr) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="relative flex flex-col items-center text-center space-y-3">
                      {/* Connecting Line */}
                      {idx < arr.length - 1 && (
                        <div
                          className={`absolute top-5 left-1/2 w-full h-[3px] -z-0 transition-colors ${
                            step.isCompleted && arr[idx + 1].isCompleted
                              ? 'bg-gradient-to-r from-cyan-400 to-purple-500'
                              : 'bg-white/10'
                          }`}
                        />
                      )}

                      {/* Icon Circle */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-all shadow-lg ${
                          step.isCurrent
                            ? 'bg-gradient-to-tr from-cyan-400 to-purple-600 text-black shadow-[0_0_20px_rgba(0,242,254,0.5)] scale-110'
                            : step.isCompleted
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'bg-surface border border-white/10 text-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div
                          className={`text-xs font-bold font-mono ${
                            step.isCurrent
                              ? 'text-cyan-300 font-black'
                              : step.isCompleted
                              ? 'text-white'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-[10px] text-gray-400 line-clamp-2 px-1">
                          {step.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Stepper */}
              <div className="md:hidden space-y-4 pt-2">
                {getTimelineSteps(order.status).map((step, idx, arr) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-start gap-3.5 relative">
                      {/* Vertical line connecting steps */}
                      {idx < arr.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 w-[2px] h-10 ${
                            step.isCompleted && arr[idx + 1].isCompleted
                              ? 'bg-gradient-to-b from-cyan-400 to-purple-500'
                              : 'bg-white/10'
                          }`}
                        />
                      )}

                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 ${
                          step.isCurrent
                            ? 'bg-gradient-to-tr from-cyan-400 to-purple-600 text-black shadow-[0_0_20px_rgba(0,242,254,0.5)]'
                            : step.isCompleted
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'bg-surface border border-white/10 text-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-0.5 pt-1">
                        <div
                          className={`text-xs font-bold font-mono ${
                            step.isCurrent
                              ? 'text-cyan-300 font-black'
                              : step.isCompleted
                              ? 'text-white'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-[11px] text-gray-400">{step.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Dispatch Info Banner */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Logistics Partner:</span>
                  <span className="text-white font-bold font-mono">{order.courierPartner || 'Steadfast Courier / Pathao Express'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Anti-Tamper Packaging</span>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS: ORDER ITEMS + DESTINATION & PAYMENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Package Items (2 Cols) */}
            <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Ordered Gadgets ({order.items.length})
                </span>
                <span className="text-xs text-gray-400 font-mono font-normal">
                  Items Verified
                </span>
              </h3>

              <div className="divide-y divide-white/10">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/60 border border-white/15 overflow-hidden shrink-0 flex items-center justify-center p-1.5">
                      <img
                        src={getCloudinaryImageUrl(item.product?.images?.[0] || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=400', {
                          width: 200,
                          height: 200,
                          crop: 'fill',
                        })}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.product?.name}
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-400 font-mono">
                        {item.selectedColor && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            Color: {item.selectedColor}
                          </span>
                        )}
                        {item.selectedStorage && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            Storage: {item.selectedStorage}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold text-cyan-400 pt-0.5">
                        ৳{(item.product?.price * item.quantity).toLocaleString()} BDT
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Table */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Items Subtotal:</span>
                  <span className="text-white">
                    ৳{Math.max(0, order.totalAmount - (order.shippingFee || 0)).toLocaleString()} BDT
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Courier Shipping Fee:</span>
                  <span className="text-white">
                    {order.shippingFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `৳${order.shippingFee} BDT`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                  <span className="font-bold text-white uppercase font-sans">Total Order Value:</span>
                  <span className="text-base sm:text-lg font-black text-cyan-400">
                    ৳{order.totalAmount.toLocaleString()} BDT
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Recipient & Payment Details (1 Col) */}
            <div className="space-y-6">
              {/* Delivery Destination */}
              <div className="p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Delivery Destination
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 text-[11px] block">Recipient Name:</span>
                    <span className="text-white font-bold">{order.shippingAddress?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">Contact Phone (Protected):</span>
                    <span className="text-cyan-300 font-mono font-bold">{order.shippingAddress?.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">City / Division:</span>
                    <span className="text-gray-200">{order.shippingAddress?.city}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px] block">Street Address:</span>
                    <span className="text-gray-300 leading-relaxed">{order.shippingAddress?.address}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Payment Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 text-[11px] block">Payment Gateway:</span>
                    <span className="text-white font-bold">{order.paymentMethod}</span>
                  </div>
                  {order.trxId && (
                    <div>
                      <span className="text-gray-500 text-[11px] block">Transaction Reference:</span>
                      <span className="text-purple-300 font-mono font-bold">{order.trxId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 text-[11px] block">Payment Status:</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {order.paymentMethod.toLowerCase().includes('cash')
                        ? 'Payable on Delivery'
                        : 'Verified & Received'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Need Help / Support Helpline */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold font-mono">
                  <PhoneCall className="w-4 h-4 text-indigo-400" />
                  <span>Have questions regarding dispatch?</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Call our 24/7 VIP helpline for order modification or direct courier rider contact.
                </p>
                <a
                  href="tel:01700112233"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Helpline (+880 1700-112233)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CALLOUT / GUARANTEES */}
      <div className="p-6 rounded-3xl bg-black/40 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Express Dispatch</div>
            <div className="text-[11px] text-gray-400">24H Dhaka / 48H Nationwide</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Genuine Warranty</div>
            <div className="text-[11px] text-gray-400">100% Brand Sealed Tech</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Doorstep Checking</div>
            <div className="text-[11px] text-gray-400">Inspect before paying COD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
