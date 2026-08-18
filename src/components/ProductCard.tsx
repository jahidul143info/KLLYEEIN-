'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Star, ShoppingBag, Eye, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getCloudinaryImageUrl } from '../lib/cloudinary';

export default function ProductCard({ product }: { product: Product; key?: React.Key }) {
  const { addToCart } = useCart();

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imageUrl = getCloudinaryImageUrl(product.images[0] || '', { width: 600, quality: 'auto' });

  return (
    <div className="group relative rounded-3xl bg-surface/80 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] hover:-translate-y-1">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {discountPct > 0 ? (
          <span className="px-2.5 py-1 rounded-lg bg-pink-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            -{discountPct}% OFF
          </span>
        ) : product.isNewRelease ? (
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-md">
            NEW DROP
          </span>
        ) : <div />}

        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-gray-300 text-[10px] font-mono border border-white/10">
          {product.category.toUpperCase()}
        </span>
      </div>

      {/* Image Area */}
      <Link to={`/product/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-black/40 block">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-transparent opacity-60" />
      </Link>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-gray-500 font-normal">({product.reviewCount})</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-bold text-white font-mono line-clamp-1 group-hover:text-cyan-300 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Tagline */}
          <p className="text-xs text-gray-400 line-clamp-2">{product.tagline}</p>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-cyan-400 font-mono">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-500 line-through font-mono">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">In Stock ({product.stock} units)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/product/${product.slug}`}
              className="p-2.5 rounded-xl bg-surface border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="View Product Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={() => addToCart(product)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
