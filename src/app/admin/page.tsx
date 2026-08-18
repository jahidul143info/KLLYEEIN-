'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Cloud,
  CheckCircle2,
  Trash2,
  Plus,
  Image as ImageIcon,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  RefreshCw,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Product, ProductSpec } from '../../types';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'banners'>('products');
  
  // Folder state for Cloudinary (defaulting behind the scenes)
  const [selectedFolder, setSelectedFolder] = useState<string>('kllyeein-gadgets/products');
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [recentUploadInfo, setRecentUploadInfo] = useState<{
    url: string;
    public_id: string;
    folder: string;
  } | null>(null);

  // Products list & state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // New Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'phones' as Product['category'],
    tagline: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '15',
    isFeatured: false,
    isTrending: false,
    isNewRelease: true,
    tags: 'gadget, premium, kllyeein',
  });

  const [specs, setSpecs] = useState<ProductSpec[]>([
    { name: 'Warranty', value: '1 Year Official' },
    { name: 'Delivery', value: 'Express 24-48 Hours' },
  ]);

  const [specName, setSpecName] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Category Thumbnail Upload Form State
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');

  // Banner Upload Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  // Fetch products on load
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data?.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle Cloudinary File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', selectedFolder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to upload image');
        }

        if (data.url) {
          setUploadedUrls((prev) => [...prev, data.url]);
          setRecentUploadInfo({
            url: data.url,
            public_id: data.public_id || 'kllyeein-gadgets/asset',
            folder: data.folder || selectedFolder,
          });

          if (activeTab === 'categories') {
            setCategoryImageUrl(data.url);
          } else if (activeTab === 'banners') {
            setBannerImageUrl(data.url);
          }
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Error uploading image to Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  // Add Specification item
  const handleAddSpec = () => {
    if (!specName.trim() || !specValue.trim()) return;
    setSpecs([...specs, { name: specName.trim(), value: specValue.trim() }]);
    setSpecName('');
    setSpecValue('');
  };

  // Remove Specification
  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Submit Product Form to Save in Database
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please fill in product name and price.');
      return;
    }

    if (uploadedUrls.length === 0) {
      alert('Please upload at least one product image to Cloudinary before saving.');
      return;
    }

    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        tagline: productForm.tagline || `${productForm.category.toUpperCase()} Gadget`,
        description: productForm.description || 'Premium original gadget with 100% genuine brand warranty.',
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock || 15),
        images: uploadedUrls, // Cloudinary Optimized URLs stored here in DB
        specs: specs,
        tags: productForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isFeatured: productForm.isFeatured,
        isTrending: productForm.isTrending,
        isNewRelease: productForm.isNewRelease,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save product');
      }

      alert('✅ Product created successfully and saved with Cloudinary image URLs!');
      
      // Reset form
      setProductForm({
        name: '',
        category: 'phones',
        tagline: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '15',
        isFeatured: false,
        isTrending: false,
        isNewRelease: true,
        tags: 'gadget, premium, kllyeein',
      });
      setUploadedUrls([]);
      setRecentUploadInfo(null);
      loadProducts();
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  // Copy URL Helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <Link to="/" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <span>/</span>
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-3">
            KLLYEEIN Admin Panel
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-normal">
              Cloudinary Powered
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Upload images directly to Cloudinary folders and store optimized asset URLs in database.
          </p>
        </div>

        {/* Cloudinary Environment Badge */}
        <div className="p-3.5 rounded-xl bg-surface/80 border border-white/10 flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-mono">Cloud Name</div>
            <div className="text-sm font-bold text-white font-mono">kllyeein-gadgets</div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => {
            setActiveTab('products');
            setSelectedFolder('kllyeein-gadgets/products');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'products'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package className="w-4 h-4" /> Add / Manage Products
        </button>

        <button
          onClick={() => {
            setActiveTab('categories');
            setSelectedFolder('kllyeein-gadgets/categories');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'categories'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" /> Category Images
        </button>

        <button
          onClick={() => {
            setActiveTab('banners');
            setSelectedFolder('kllyeein-gadgets/banners');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'banners'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Hero Banners
        </button>
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Create Product Form & Image Uploader */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-surface/90 border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Create New Product
                </h2>
              </div>

              {/* Step 1: Image Upload Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-200">
                  1. Upload Product Images
                </label>

                {/* Drag and Drop File Input Area */}
                <div className="relative border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/80 rounded-2xl p-6 text-center bg-cyan-950/10 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      {isUploading ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      ) : (
                        <Upload className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>

                    {isUploading ? (
                      <div>
                        <p className="text-sm font-semibold text-cyan-300 animate-pulse">
                          Uploading image...
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Applying auto-format and auto-quality optimization</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Click or drag & drop images to upload
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Supports high-resolution PNG, JPG, WEBP
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                    {uploadError}
                  </div>
                )}

                {/* Uploaded Cloudinary Images Gallery Preview */}
                {uploadedUrls.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Uploaded Cloudinary Images ({uploadedUrls.length}):
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      {uploadedUrls.map((url, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-square">
                          <img
                            src={url}
                            alt={`Cloudinary upload ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(url)}
                              className="p-1.5 rounded-lg bg-cyan-500 text-black text-xs font-bold"
                              title="Copy URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setUploadedUrls(uploadedUrls.filter((_, i) => i !== idx))}
                              className="p-1.5 rounded-lg bg-red-500 text-white text-xs"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Upload Info details */}
                {recentUploadInfo && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1 text-gray-300">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span>Cloudinary Optimized URL Generated:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(recentUploadInfo.url)}
                        className="hover:underline flex items-center gap-1 text-[11px]"
                      >
                        {copiedUrl === recentUploadInfo.url ? 'Copied!' : 'Copy URL'}
                      </button>
                    </div>
                    <div className="truncate text-gray-400">{recentUploadInfo.url}</div>
                  </div>
                )}
              </div>

              {/* Step 2: Product Form Fields */}
              <form onSubmit={handleCreateProduct} className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white font-mono">2. Product Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple AirPods Max Cyber Blue"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="phones">Smartphones & Tablets</option>
                      <option value="audio">Audio & Headphones</option>
                      <option value="wearables">Smartwatches & Wearables</option>
                      <option value="accessories">Power & Accessories</option>
                      <option value="smarthome">Smart Home & IoT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Price (৳ BDT) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 52000"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Original Price (৳ BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 58000"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Short Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Active Noise Cancellation with Spatial Audio"
                    value={productForm.tagline}
                    onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Write product description..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* Key Technical Specifications Builder */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-300 block">Tech Specifications</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Battery)"
                      value={specName}
                      onChange={(e) => setSpecName(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 5000 mAh)"
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
                    >
                      Add Spec
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {specs.map((s, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                        <strong className="text-white">{s.name}:</strong> {s.value}
                        <button type="button" onClick={() => handleRemoveSpec(idx)} className="text-gray-500 hover:text-red-400">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Badges / Checkboxes */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNewRelease}
                      onChange={(e) => setProductForm({ ...productForm, isNewRelease: e.target.checked })}
                      className="rounded accent-cyan-500"
                    />
                    <span>New Release</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isTrending}
                      onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                      className="rounded accent-purple-500"
                    />
                    <span>Trending</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                    <span>Featured Homepage</span>
                  </label>
                </div>

                {/* Save Product Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Save Product with Cloudinary Image URLs
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Database Products List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                Live Catalog ({products.length})
              </h3>
              <button
                onClick={loadProducts}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {isLoadingProducts ? (
              <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
                Loading products from database...
              </div>
            ) : (
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl bg-surface/80 border border-white/10 flex items-center gap-3 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      <img
                        src={getCloudinaryImageUrl(prod.images[0] || '')}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                      <p className="text-[11px] text-cyan-400 font-mono font-bold">
                        ৳{prod.price.toLocaleString()} BDT
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                          {prod.category}
                        </span>
                        {prod.images[0]?.includes('res.cloudinary.com') && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                            Cloudinary
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY IMAGES UPLOAD */}
      {activeTab === 'categories' && (
        <div className="max-w-2xl mx-auto space-y-6 p-6 rounded-2xl bg-surface/90 border border-white/10">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Upload Category Thumbnail
            </h2>
            <p className="text-xs text-gray-400">
              Upload category header graphics and banner thumbnails.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 block mb-1">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Headphones & Audio"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
            </div>

            <div className="border-2 border-dashed border-purple-500/30 hover:border-purple-400 rounded-2xl p-6 text-center bg-purple-950/10 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Click or drag & drop Category Image</p>
              <p className="text-xs text-gray-400">Supports high-resolution PNG, JPG, WEBP</p>
            </div>

            {categoryImageUrl && (
              <div className="space-y-2">
                <p className="text-xs text-purple-300 font-mono">Optimized Image Preview:</p>
                <div className="relative h-40 rounded-xl overflow-hidden border border-white/10">
                  <img src={categoryImageUrl} alt="Category Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(categoryImageUrl)}
                  className="w-full py-2 bg-purple-500/20 text-purple-300 rounded-xl text-xs font-bold"
                >
                  {copiedUrl === categoryImageUrl ? 'Copied URL!' : 'Copy Image URL'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BANNERS UPLOAD */}
      {activeTab === 'banners' && (
        <div className="max-w-2xl mx-auto space-y-6 p-6 rounded-2xl bg-surface/90 border border-white/10">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
              Upload Hero Banner Graphic
            </h2>
            <p className="text-xs text-gray-400">
              Upload promotional campaign images and hero banners.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 block mb-1">Banner Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. Eid Cyber Offer - 20% Off All Accessories"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
            </div>

            <div className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-6 text-center bg-emerald-950/10 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Click or drag & drop Hero Banner Graphic</p>
              <p className="text-xs text-gray-400">Supports high-resolution PNG, JPG, WEBP</p>
            </div>

            {bannerImageUrl && (
              <div className="space-y-2">
                <p className="text-xs text-emerald-300 font-mono">Optimized Banner Preview:</p>
                <div className="relative h-48 rounded-xl overflow-hidden border border-white/10">
                  <img src={bannerImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bannerImageUrl)}
                  className="w-full py-2 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold"
                >
                  {copiedUrl === bannerImageUrl ? 'Copied URL!' : 'Copy Banner URL'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
