'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Zap, ArrowLeft, Share2, Check } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import { PRODUCTS } from '../../../data/products';
import { getCloudinaryImageUrl } from '../../../lib/cloudinary';

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.tagline,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="py-8 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <Link to="/" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
        <span className="font-mono text-gray-500">SKU: {product.id.toUpperCase()}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl">
            <img
              src={getCloudinaryImageUrl(product.images[selectedImage] || product.images[0], { width: 1000 })}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {discountPct > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-pink-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg">
                SAVE {discountPct}%
              </span>
            )}

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white hover:text-cyan-400 transition-colors shadow-lg"
              title="Share Product Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx ? 'border-cyan-400 shadow-lg scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header & Rating */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase font-mono">
                {product.category.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                In Stock ({product.stock} available)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{product.reviewCount} verified customer reviews</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-surface/80 border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 block font-mono">OFFICIAL BRAND PRICE</span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-cyan-400 font-mono">
                ৳{product.price.toLocaleString()} BDT
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-500 line-through font-mono">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold pt-1">
              ✓ Includes VAT & Express BD Shipping
            </p>
          </div>

          {/* Tagline & Description */}
          <div className="space-y-2 text-xs leading-relaxed text-gray-300">
            <p className="font-bold text-white text-sm">{product.tagline}</p>
            <p>{product.description}</p>
          </div>

          {/* Quantity & Buy Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-300">Quantity:</span>
              <div className="flex items-center gap-3 p-1.5 rounded-xl bg-surface border border-white/15">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-gray-300 hover:text-white font-bold"
                >
                  -
                </button>
                <span className="text-xs font-bold font-mono px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-gray-300 hover:text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                className="w-full py-4 rounded-2xl bg-surface border border-cyan-400/50 hover:bg-cyan-400/10 text-cyan-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (Express)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Specifications Table */}
      <div className="pt-8 border-t border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
          TECHNICAL SPECIFICATIONS
        </h3>

        <div className="rounded-2xl border border-white/10 bg-surface/60 overflow-hidden divide-y divide-white/5">
          {product.specs.map((spec, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 p-4 text-xs">
              <span className="font-bold text-gray-400 font-mono">{spec.name}</span>
              <span className="md:col-span-2 text-white font-medium">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
            RECOMMENDED CYBER GADGETS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
