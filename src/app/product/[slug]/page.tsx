import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../../../data/products';
import ProductDetailClient from './ProductDetailClient';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white font-mono">Product Not Found</h2>
        <p className="text-xs text-gray-400">The requested luxury gadget could not be found.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider">
          Back to Store
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
