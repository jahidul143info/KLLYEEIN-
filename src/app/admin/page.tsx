'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Layers,
  Image as ImageIcon,
  Images,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Phone,
  MapPin,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Mail,
  FileText,
  Check,
  X,
  ChevronRight,
  Upload,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Building,
  DollarSign,
  Tag,
  Menu,
  Camera,
  Store,
  Sliders,
  Truck,
} from 'lucide-react';
import { Product, ProductSpec } from '../../types';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';
import { compressImageFile, uploadImageToServer } from '../../lib/imageUploadUtils';
import { useAuth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../../context/AuthContext';
import { AdminOrder } from '../api/orders/route';

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'categories'
  | 'banners'
  | 'media'
  | 'store_settings'
  | 'security';

export default function AdminPanelPage() {
  const {
    user,
    isAdmin,
    adminCredentials,
    updateAdminCredentials,
    isLoading: isAuthLoading,
    signInWithPassword,
    signOut,
  } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin Login Screen Form State
  const [adminEmailInput, setAdminEmailInput] = useState(adminCredentials?.email || DEFAULT_ADMIN_EMAIL);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Admin Security Settings Form State
  const [editAdminName, setEditAdminName] = useState(adminCredentials?.fullName || 'Osman (Admin)');
  const [editAdminEmail, setEditAdminEmail] = useState(adminCredentials?.email || DEFAULT_ADMIN_EMAIL);
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editAdminPasswordConfirm, setEditAdminPasswordConfirm] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securitySuccessMessage, setSecuritySuccessMessage] = useState<string | null>(null);
  const [securityErrorMessage, setSecurityErrorMessage] = useState<string | null>(null);

  // Cloudinary Folder & Upload State
  const [selectedFolder, setSelectedFolder] = useState<string>('kllyeein-gadgets/products');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [directImageUrlInput, setDirectImageUrlInput] = useState('');
  const [recentUploadInfo, setRecentUploadInfo] = useState<{
    url: string;
    public_id: string;
    folder: string;
  } | null>(null);
  const [mediaGallery, setMediaGallery] = useState<string[]>([
    'https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg',
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
    'https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800',
  ]);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<AdminOrder | null>(null);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState<string | null>(null);

  // Category & Banner Management States
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('CYBER OFFER 2026');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerCtaLink, setBannerCtaLink] = useState('/#products');

  // Copy Feedback
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Store Global Configurations & Controls State
  const [storeSettings, setStoreSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kllyeein_store_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      storeName: 'KLLYEEIN GADGETS BANGLADESH',
      tagline: 'Cybernetic Tech, Flagship Phones & Acoustic Luxury',
      hotline: '+880 1700-112233',
      whatsapp: '+880 1700-112233',
      supportEmail: 'support@kllyeein.com',
      showroomAddress: 'Jamuna Future Park, Level 4 (Zone D, Shop 402), Dhaka',
      businessHours: '10:00 AM – 09:00 PM (Weekly Off: Wednesday)',
      insideDhakaFee: 60,
      outsideDhakaFee: 120,
      freeShippingThreshold: 5000,
      announcementText: '🚀 FREE EXPRESS SHIPPING across Bangladesh on orders over ৳5,000 | 100% Genuine Warranty',
      isAnnouncementActive: true,
    };
  });
  const [isSavingStoreSettings, setIsSavingStoreSettings] = useState(false);
  const [storeSettingsSuccessMsg, setStoreSettingsSuccessMsg] = useState<string | null>(null);

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStoreSettings(true);
    try {
      localStorage.setItem('kllyeein_store_settings', JSON.stringify(storeSettings));
      setStoreSettingsSuccessMsg('Store settings, contact information, and shipping rates saved successfully!');
      setTimeout(() => setStoreSettingsSuccessMsg(null), 3500);
    } catch {
      // error
    } finally {
      setIsSavingStoreSettings(false);
    }
  };

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
    { name: 'Warranty', value: '1 Year Official Brand Warranty' },
    { name: 'Delivery', value: 'Express 24-48h Nationwide' },
  ]);
  const [specName, setSpecName] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Sync state when adminCredentials changes
  useEffect(() => {
    if (adminCredentials) {
      setEditAdminName(adminCredentials.fullName || 'Osman (Admin)');
      setEditAdminEmail(adminCredentials.email || DEFAULT_ADMIN_EMAIL);
      setAdminEmailInput(adminCredentials.email || DEFAULT_ADMIN_EMAIL);
    }
  }, [adminCredentials]);

  // Load Products
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

  // Load Orders
  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data?.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadOrders();
    }
  }, [isAdmin]);

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Admin Login Submit Handler
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput || !adminPasswordInput) return;
    setIsAuthenticating(true);
    setAdminLoginError(null);
    try {
      const res = await signInWithPassword(adminEmailInput, adminPasswordInput);
      if (res?.error) {
        setAdminLoginError(res.error);
      }
    } catch (err: any) {
      setAdminLoginError(err.message || 'Admin login failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Mobile & Desktop Cloudinary File Processor
  const processAndUploadFiles = async (files: FileList | File[], targetFolder?: string) => {
    if (!files || files.length === 0) return;
    const folderToUse = targetFolder || selectedFolder;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileArray = Array.from(files);
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Step 1: Compress high-res mobile photos client-side to prevent network failures
        setUploadStatusText(`⚡ Optimizing photo ${i + 1}/${fileArray.length} for mobile...`);
        let fileToUpload = file;
        try {
          const compressed = await compressImageFile(file, 1600, 0.85);
          fileToUpload = compressed.file;
        } catch (compressionErr) {
          console.warn('Using raw file fallback:', compressionErr);
        }

        // Step 2: Upload to server / Cloudinary
        setUploadStatusText(`☁️ Uploading photo ${i + 1}/${fileArray.length} to Cloudinary...`);
        const result = await uploadImageToServer(fileToUpload, folderToUse);

        if (result.url) {
          setUploadedUrls((prev) => [...prev, result.url]);
          setMediaGallery((prev) => [result.url, ...prev]);
          setRecentUploadInfo({
            url: result.url,
            public_id: result.public_id || 'kllyeein-gadgets/asset',
            folder: folderToUse,
          });

          if (activeTab === 'categories') {
            setCategoryImageUrl(result.url);
          } else if (activeTab === 'banners') {
            setBannerImageUrl(result.url);
          }
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload photo. Please check your image format.');
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  // Cloudinary File Upload Input Event Trigger
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, targetFolder?: string) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await processAndUploadFiles(files, targetFolder);
    }
    // Clear input so selecting the same file again triggers change
    event.target.value = '';
  };

  // Add Direct Image URL
  const handleAddDirectUrl = () => {
    if (!directImageUrlInput.trim()) return;
    const url = directImageUrlInput.trim();
    setUploadedUrls((prev) => [...prev, url]);
    setMediaGallery((prev) => [url, ...prev]);
    if (activeTab === 'categories') {
      setCategoryImageUrl(url);
    } else if (activeTab === 'banners') {
      setBannerImageUrl(url);
    }
    setDirectImageUrlInput('');
  };

  // Add Spec item
  const handleAddSpec = () => {
    if (!specName.trim() || !specValue.trim()) return;
    setSpecs([...specs, { name: specName.trim(), value: specValue.trim() }]);
    setSpecName('');
    setSpecValue('');
  };

  // Remove Spec item
  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Create Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please enter product title and price.');
      return;
    }

    if (uploadedUrls.length === 0) {
      alert('Please upload at least one product image before saving.');
      return;
    }

    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        tagline: productForm.tagline || `${productForm.category.toUpperCase()} Gadget`,
        description:
          productForm.description ||
          'Premium original cyber gadget with 100% genuine brand warranty.',
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock || 15),
        images: uploadedUrls,
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

      alert('✅ Product created successfully and saved with Cloudinary images!');

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
      setIsCreateProductModalOpen(false);
      loadProducts();
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from the database?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: AdminOrder['status']) => {
    setIsUpdatingOrderStatus(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrderDetails?.id === orderId || selectedOrderDetails?.orderNumber === orderId) {
          setSelectedOrderDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setIsUpdatingOrderStatus(null);
    }
  };

  // Save Admin Security Credentials
  const handleSaveAdminSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccessMessage(null);
    setSecurityErrorMessage(null);

    if (editAdminPassword && editAdminPassword.length < 6) {
      setSecurityErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (editAdminPassword && editAdminPassword !== editAdminPasswordConfirm) {
      setSecurityErrorMessage('Passwords do not match. Please recheck.');
      return;
    }

    setIsSavingSecurity(true);
    try {
      const res = await updateAdminCredentials({
        fullName: editAdminName.trim(),
        email: editAdminEmail.trim(),
        password: editAdminPassword ? editAdminPassword.trim() : undefined,
      });

      if (res?.error) {
        setSecurityErrorMessage(res.error);
      } else {
        setSecuritySuccessMessage('✅ Admin credentials updated successfully!');
        setEditAdminPassword('');
        setEditAdminPasswordConfirm('');
        setTimeout(() => setSecuritySuccessMessage(null), 5000);
      }
    } catch (err: any) {
      setSecurityErrorMessage(err.message || 'Failed to update credentials.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // Stats calculation
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockProducts = products.filter((p) => (p.stock ?? 10) < 5);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesSearch =
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.tagline.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(productSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch =
      !orderSearchQuery ||
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.shippingAddress?.phone?.includes(orderSearchQuery) ||
      o.trxId?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // IF NOT AUTHENTICATED AS ADMIN: SHOW DEDICATED ADMIN LOGIN PORTAL
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
        {/* Top bar with back to storefront */}
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/20 bg-black flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                alt="KLLYEEIN Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-mono font-black text-white text-lg tracking-wider">KLLYEEIN</span>
              <span className="text-[10px] text-cyan-400 font-mono block -mt-1 font-semibold uppercase tracking-widest">
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Store
          </Link>
        </div>

        {/* Center Login Box */}
        <div className="w-full max-w-md mx-auto my-12 bg-[#0c0e17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,254,0.1)] space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-xl shadow-cyan-500/20 mx-auto bg-black flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                alt="KLLYEEIN Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Restricted Admin Portal
            </div>
            <h1 className="text-2xl font-black text-white font-mono">ADMINISTRATOR SIGN IN</h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Authenticate with your secure administrator credentials to manage products, orders, inventory, and system settings.
            </p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="admin.osman@gmail.com"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Admin Password
              </label>
              <input
                type="password"
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Authenticating Admin...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Access Admin Console
                </>
              )}
            </button>
          </form>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] text-gray-400 space-y-1">
            <div className="font-semibold text-gray-300 flex items-center justify-between">
              <span>Default Credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setAdminEmailInput(adminCredentials?.email || DEFAULT_ADMIN_EMAIL);
                  setAdminPasswordInput(adminCredentials?.password || DEFAULT_ADMIN_PASSWORD);
                }}
                className="text-cyan-400 hover:underline font-mono"
              >
                Auto-fill
              </button>
            </div>
            <div className="font-mono text-gray-300">
              Email: <span className="text-cyan-300">{adminCredentials?.email || DEFAULT_ADMIN_EMAIL}</span>
            </div>
            <div className="font-mono text-gray-300">
              Password: <span className="text-cyan-300">{adminCredentials?.password || DEFAULT_ADMIN_PASSWORD}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-gray-500 font-mono">
          KLLYEEIN Cyber Commerce Core © 2026 • Encrypted Administrative Access
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN CONSOLE: CLEAN DEDICATED FULL-SCREEN DASHBOARD
  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-black">
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden bg-[#0c0e17] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/40 bg-black">
            <img
              src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-mono font-black text-white text-sm">KLLYEEIN</span>
            <span className="text-[9px] text-cyan-400 font-mono block -mt-1 font-bold">ADMIN CONSOLE</span>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* DEDICATED ADMIN SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 w-72 bg-[#0a0c14] border-r border-white/10 p-5 z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg shadow-cyan-500/20 bg-black flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/pgggwtrz/image/upload/v1787039981/photo_2026-08-18_13-58-01_j0havk.jpg"
                  alt="KLLYEEIN Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-mono font-black text-white text-base tracking-wider">KLLYEEIN</span>
                <span className="text-[10px] text-cyan-400 font-mono block -mt-1 font-bold tracking-wider">
                  CONTROL PANEL
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-cyan-400" />
                <span>Products & Stock</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-gray-300 font-mono">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Orders & Sales</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold text-[10px] font-mono">
                  {pendingOrdersCount} new
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('categories');
                setSelectedFolder('kllyeein-gadgets/categories');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'categories'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('banners');
                setSelectedFolder('kllyeein-gadgets/banners');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'banners'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Hero Banners</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('media');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'media'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Images className="w-4 h-4 text-sky-400" />
              <span>Media & Assets</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('store_settings');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'store_settings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Store className="w-4 h-4 text-pink-400" />
              <span>Store & Delivery Rates</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('security');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Admin Credentials</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Card */}
        <div className="pt-5 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1 text-xs">
            <div className="flex items-center justify-between text-gray-400 text-[11px]">
              <span>Logged Administrator</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="font-bold text-white truncate">{adminCredentials?.fullName || 'Osman (Admin)'}</div>
            <div className="text-[10px] text-cyan-300 font-mono truncate">
              {adminCredentials?.email || DEFAULT_ADMIN_EMAIL}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Visit Store
            </Link>

            <button
              onClick={signOut}
              title="Sign Out of Admin Console"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
        {/* TOP ADMIN HEADER BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <span>ADMIN</span>
              <span>/</span>
              <span className="text-cyan-400 uppercase font-bold">{activeTab}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight capitalize">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Product & Inventory Management'}
              {activeTab === 'orders' && 'Customer Orders & Fulfillment'}
              {activeTab === 'categories' && 'Store Categories & Hierarchy'}
              {activeTab === 'banners' && 'Hero Promotions & Banners'}
              {activeTab === 'media' && 'Store Media & Asset Library'}
              {activeTab === 'store_settings' && 'Store Configuration & Delivery Rates'}
              {activeTab === 'security' && 'Admin Credentials & Access Control'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* System Live Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-gray-300 text-[11px]">
                Store Active & Synchronized
              </span>
            </div>

            {/* Quick action button based on active tab */}
            {activeTab === 'products' && (
              <button
                onClick={() => setIsCreateProductModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-400/20"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}

            <button
              onClick={() => {
                loadProducts();
                loadOrders();
              }}
              title="Refresh Data"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0d0f1a] border border-cyan-500/20 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Total Sales Revenue</span>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  ৳ {totalRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-cyan-300 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> From {orders.length} confirmed checkouts
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d0f1a] border border-emerald-500/20 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Total Customer Orders</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">{orders.length}</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> {pendingOrdersCount} Pending fulfillment
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d0f1a] border border-purple-500/20 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Catalog Products</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">{products.length}</div>
                <div className="text-[11px] text-purple-300 flex items-center gap-1 font-semibold">
                  <Layers className="w-3.5 h-3.5" /> Across 6 tech categories
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0d0f1a] border border-amber-500/20 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                  <span>Inventory Health</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {lowStockProducts.length} <span className="text-xs text-amber-400 font-normal">Low Stock</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {lowStockProducts.length === 0 ? 'All items well-stocked' : 'Requires replenishment'}
                </div>
              </div>
            </div>

            {/* QUICK SHORTCUTS & RECENT ORDERS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* RECENT ORDERS TABLE */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-cyan-400" />
                    Recent Customer Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    View All Orders <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                        <th className="pb-3 font-semibold">Order ID</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Items</th>
                        <th className="pb-3 font-semibold">Total</th>
                        <th className="pb-3 font-semibold">Payment</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 font-mono font-bold text-cyan-400">{order.orderNumber}</td>
                          <td className="py-3">
                            <div className="font-semibold text-white">{order.shippingAddress?.fullName || 'N/A'}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{order.shippingAddress?.phone}</div>
                          </td>
                          <td className="py-3 text-gray-300">
                            {order.items?.length || 1} item(s)
                          </td>
                          <td className="py-3 font-mono font-bold text-white">
                            ৳ {(order.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono uppercase text-gray-300">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : order.status === 'processing'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : order.status === 'shipped'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-gray-500">
                            No orders found yet. Place a test order from the storefront.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QUICK LAUNCH & ACTIONS */}
              <div className="p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-5">
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Admin Quick Actions
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setIsCreateProductModalOpen(true);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-400 text-black">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-300">Add New Product</div>
                        <div className="text-[10px] text-gray-400">Upload to Cloudinary & Catalog</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-300" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('banners');
                      setSelectedFolder('kllyeein-gadgets/banners');
                    }}
                    className="w-full p-3.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-400 text-black">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-purple-300">Upload Hero Banner</div>
                        <div className="text-[10px] text-gray-400">Campaigns & Store Visuals</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-300" />
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className="w-full p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-400 text-black">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-amber-300">Change Admin Password</div>
                        <div className="text-[10px] text-gray-400">Email & Access Credentials</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-300" />
                  </button>

                  <button
                    onClick={() => setActiveTab('media')}
                    className="w-full p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-left flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-sky-400 text-black">
                        <Images className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-sky-300">Media & Assets Vault</div>
                        <div className="text-[10px] text-gray-400">Upload & Manage Store Photos</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-sky-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & INVENTORY */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0f1a] border border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by product name, specs, tags..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="appearance-none bg-black/50 border border-white/10 rounded-xl px-4 py-2 pr-8 text-xs text-gray-300 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">All Categories</option>
                    <option value="phones">Smartphones</option>
                    <option value="audio">Spatial Audio</option>
                    <option value="wearables">Smartwatches</option>
                    <option value="drones">Aerial Drones</option>
                    <option value="gaming">Gaming & VR</option>
                    <option value="accessories">GaN Accessories</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={() => setIsCreateProductModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-400/20"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            {/* Products Table */}
            <div className="p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Price (BDT)</th>
                      <th className="pb-3 font-semibold">Stock</th>
                      <th className="pb-3 font-semibold">Badges</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                              <img
                                src={p.images?.[0] ? getCloudinaryImageUrl(p.images[0], { width: 120, height: 120 }) : ''}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="max-w-xs">
                              <div className="font-bold text-white truncate">{p.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono truncate">{p.tagline}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-mono uppercase text-cyan-300">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <div className="font-mono font-bold text-white">৳ {p.price.toLocaleString()}</div>
                          {p.originalPrice && (
                            <div className="text-[10px] text-gray-500 line-through font-mono">
                              ৳ {p.originalPrice.toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              (p.stock ?? 10) < 5
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {p.stock ?? 10} In Stock
                          </span>
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">
                                Featured
                              </span>
                            )}
                            {p.isTrending && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono">
                                Trending
                              </span>
                            )}
                            {p.isNewRelease && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
                                New
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/product/${p.slug}`}
                              target="_blank"
                              title="View on Store"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              title="Delete Product"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No products found matching your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CREATE PRODUCT MODAL / SHEET */}
            {isCreateProductModalOpen && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
                <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c0e17] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                        <Plus className="w-5 h-5 text-cyan-400" />
                        Create & Publish New Product
                      </h2>
                      <p className="text-xs text-gray-400">
                        Upload high-resolution product photos and catalog specifications.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCreateProductModalOpen(false)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateProduct} className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-300">Product Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. iPhone 16 Pro Max - Titanium Cyber Edition"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-300">Category *</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                        >
                          <option value="phones">Smartphones & Flagships</option>
                          <option value="audio">Spatial Audio & ANC</option>
                          <option value="wearables">Smartwatches & Rings</option>
                          <option value="drones">Aerial Drones & Gimbals</option>
                          <option value="gaming">Cyber Consoles & VR</option>
                          <option value="accessories">GaN Fast Chargers & Hubs</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-300">Tagline / Key Highlight</label>
                        <input
                          type="text"
                          placeholder="e.g. A18 Pro Chip • Grade 5 Titanium"
                          value={productForm.tagline}
                          onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-300">Price (BDT ৳) *</label>
                        <input
                          type="number"
                          required
                          placeholder="152000"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-300">Original / Strikethrough Price (BDT ৳)</label>
                        <input
                          type="number"
                          placeholder="165000"
                          value={productForm.originalPrice}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-300">Initial Stock Quantity</label>
                        <input
                          type="number"
                          placeholder="15"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-300">Search Tags (Comma separated)</label>
                        <input
                          type="text"
                          placeholder="apple, iphone, flagship, 5g"
                          value={productForm.tags}
                          onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-300">Full Description</label>
                        <textarea
                          rows={3}
                          placeholder="Detailed product overview, build materials, warranty guidelines..."
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                        ></textarea>
                      </div>
                    </div>

                    {/* Cloudinary Image Uploader (Mobile Optimized) */}
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase font-mono">
                          <Images className="w-4 h-4" /> Product Photos ({uploadedUrls.length} Added) *
                        </label>
                        <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                          Storage: Products
                        </span>
                      </div>

                      {/* MOBILE ACTION BUTTONS (Camera + Gallery) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* 1. Take Photo with Mobile Camera */}
                        <label className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-[0.99] border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm">
                          <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Take Live Photo (Camera)</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, selectedFolder)}
                            className="sr-only"
                          />
                        </label>

                        {/* 2. Choose from Phone Gallery / File Explorer */}
                        <label className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.99] border border-white/15 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm">
                          <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Choose from Gallery (Multi)</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif,image/*"
                            multiple
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, selectedFolder)}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {/* 3. Direct Image URL Paste Bar */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            placeholder="Or paste direct image URL (https://...)"
                            value={directImageUrlInput}
                            onChange={(e) => setDirectImageUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddDirectUrl();
                              }
                            }}
                            className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddDirectUrl}
                          disabled={!directImageUrlInput.trim()}
                          className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-40 text-cyan-300 font-bold text-xs uppercase transition-all border border-cyan-500/30 shrink-0"
                        >
                          + Add URL
                        </button>
                      </div>

                      {/* Upload Loading & Status Box */}
                      {isUploading && (
                        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-center gap-2.5 animate-pulse font-mono">
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>{uploadStatusText || 'Optimizing & Uploading to Cloudinary CDN...'}</span>
                        </div>
                      )}

                      {/* Upload Error Alert */}
                      {uploadError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {/* Uploaded URLs preview */}
                      {uploadedUrls.length > 0 ? (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                            <span>Photos Ready ({uploadedUrls.length}):</span>
                            <span className="text-cyan-400">First image will be Main / Cover</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                            {uploadedUrls.map((url, i) => (
                              <div key={i} className="relative h-24 rounded-2xl overflow-hidden border border-white/20 bg-black group">
                                <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                                {i === 0 && (
                                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-cyan-500 text-black text-[9px] font-bold uppercase tracking-wider font-mono shadow">
                                    Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  title="Remove Image"
                                  onClick={() => setUploadedUrls(uploadedUrls.filter((_, idx) => idx !== i))}
                                  className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-xl opacity-90 hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-gray-400 text-xs">
                          No images added yet. Take a live camera photo, choose from gallery, or paste a photo link above.
                        </div>
                      )}
                    </div>

                    {/* Specs Builder */}
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase font-mono">
                        <SlidersHorizontal className="w-4 h-4" /> Technical Specifications
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Spec Name (e.g. Battery)"
                          value={specName}
                          onChange={(e) => setSpecName(e.target.value)}
                          className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Spec Value (e.g. 5000mAh 65W Fast Charge)"
                          value={specValue}
                          onChange={(e) => setSpecValue(e.target.value)}
                          className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddSpec}
                          className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold"
                        >
                          Add Spec
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {specs.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs"
                          >
                            <strong className="text-gray-300">{s.name}:</strong>
                            <span className="text-cyan-300">{s.value}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(idx)}
                              className="text-gray-400 hover:text-red-400 ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-6 pt-3 border-t border-white/10 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                          className="rounded border-white/20 text-cyan-400 focus:ring-0"
                        />
                        <span>Feature on Homepage</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <input
                          type="checkbox"
                          checked={productForm.isTrending}
                          onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                          className="rounded border-white/20 text-purple-400 focus:ring-0"
                        />
                        <span>Trending Hot</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                        <input
                          type="checkbox"
                          checked={productForm.isNewRelease}
                          onChange={(e) => setProductForm({ ...productForm, isNewRelease: e.target.checked })}
                          className="rounded border-white/20 text-emerald-400 focus:ring-0"
                        />
                        <span>New Release Flag</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsCreateProductModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-400/20"
                      >
                        Publish Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS & SALES FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0f1a] border border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize font-mono transition-all shrink-0 ${
                      orderStatusFilter === status
                        ? 'bg-cyan-400 text-black font-extrabold'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, customer, phone, TrxID..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                      <th className="pb-3 font-semibold">Order Number</th>
                      <th className="pb-3 font-semibold">Recipient & Contact</th>
                      <th className="pb-3 font-semibold">Destination</th>
                      <th className="pb-3 font-semibold">Payment & TrxID</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Fulfillment Status</th>
                      <th className="pb-3 font-semibold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02]">
                        <td className="py-4">
                          <div className="font-mono font-bold text-cyan-400">{order.orderNumber}</div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="font-bold text-white">{order.shippingAddress?.fullName || 'N/A'}</div>
                          <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-cyan-400" />
                            {order.shippingAddress?.phone || 'N/A'}
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="text-gray-300 max-w-xs truncate">{order.shippingAddress?.address || 'N/A'}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{order.shippingAddress?.city || 'Dhaka'}</div>
                        </td>

                        <td className="py-4">
                          <div className="font-mono font-semibold text-white uppercase">{order.paymentMethod}</div>
                          {order.trxId && (
                            <div className="text-[10px] text-cyan-300 font-mono">Trx: {order.trxId}</div>
                          )}
                        </td>

                        <td className="py-4 font-mono font-bold text-white">
                          ৳ {(order.totalAmount || 0).toLocaleString()}
                        </td>

                        <td className="py-4">
                          <select
                            value={order.status}
                            disabled={isUpdatingOrderStatus === order.id}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="bg-black/70 border border-white/20 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
                          >
                            <option value="pending">🟡 Pending</option>
                            <option value="confirmed">🔵 Confirmed</option>
                            <option value="processing">🟣 Processing</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="delivered">🟢 Delivered</option>
                            <option value="cancelled">🔴 Cancelled</option>
                          </select>
                        </td>

                        <td className="py-4 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/20 transition-all"
                          >
                            View Order
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          No orders found matching the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrderDetails && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
                <div className="relative w-full max-w-xl rounded-3xl bg-[#0c0e17] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Customer Invoice</div>
                      <h2 className="text-xl font-bold text-white font-mono">{selectedOrderDetails.orderNumber}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Customer Information Box */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs">
                    <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Shipping Details:</div>
                    <div className="grid grid-cols-2 gap-2 text-gray-200">
                      <div>
                        Name: <strong className="text-white">{selectedOrderDetails.shippingAddress?.fullName}</strong>
                      </div>
                      <div>
                        Phone: <strong className="text-cyan-300 font-mono">{selectedOrderDetails.shippingAddress?.phone}</strong>
                      </div>
                      <div className="col-span-2">
                        Address: {selectedOrderDetails.shippingAddress?.address}, {selectedOrderDetails.shippingAddress?.city}
                      </div>
                      <div>
                        Payment: <strong className="uppercase text-amber-300">{selectedOrderDetails.paymentMethod}</strong>
                      </div>
                      {selectedOrderDetails.trxId && (
                        <div>
                          TrxID: <strong className="text-cyan-400 font-mono">{selectedOrderDetails.trxId}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-300 uppercase font-mono">Ordered Products:</div>
                    <div className="space-y-2">
                      {selectedOrderDetails.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.product?.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-10 h-10 rounded-lg object-cover bg-black border border-white/10"
                              />
                            )}
                            <div>
                              <div className="font-bold text-white">{item.product?.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}{' '}
                                {item.selectedStorage ? `• ${item.selectedStorage}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="font-mono font-bold text-cyan-300">
                            ৳ {(item.product?.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total summary */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono">
                    <span className="text-sm text-gray-400 font-bold">TOTAL ORDER VALUE:</span>
                    <span className="text-xl font-black text-cyan-400">
                      ৳ {selectedOrderDetails.totalAmount?.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                  >
                    Close Invoice View
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    Store Categories & Collections
                  </h2>
                  <p className="text-xs text-gray-400">
                    Manage category thumbnails, icon descriptors, and live catalog counts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Smartphones & Flagships', slug: 'phones', count: 12, img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800' },
                  { name: 'Spatial Audio & ANC', slug: 'audio', count: 18, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800' },
                  { name: 'Smartwatches & Rings', slug: 'wearables', count: 9, img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800' },
                  { name: 'Aerial Drones & Gimbals', slug: 'drones', count: 6, img: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=800' },
                  { name: 'Cyber Consoles & VR', slug: 'gaming', count: 14, img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800' },
                  { name: 'GaN Fast Chargers & Hubs', slug: 'accessories', count: 22, img: 'https://images.unsplash.com/photo-1608248597359-25f053e16447?q=80&w=800' },
                ].map((cat) => (
                  <div key={cat.slug} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="h-32 rounded-xl overflow-hidden bg-black relative">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                        <div>
                          <div className="font-bold text-white text-sm">{cat.name}</div>
                          <div className="text-[10px] text-cyan-300 font-mono">{cat.count} Listed Products</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HERO BANNERS & CAMPAIGNS */}
        {activeTab === 'banners' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-6">
              <div className="space-y-1 pb-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  Hero Promotional Campaign Banners
                </h2>
                <p className="text-xs text-gray-400">
                  Upload promotional banner graphics and set promotional headline text.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Banner Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Eid Cyber Offer - 20% Off All Flagships"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>

                {/* MOBILE ACTION BUTTONS (Camera + Gallery) FOR BANNERS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.99] border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm">
                    <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Take Photo (Camera)</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(e, 'kllyeein-gadgets/banners')}
                      className="sr-only"
                    />
                  </label>

                  <label className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.99] border border-white/15 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm">
                    <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Choose Banner from Gallery</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif,image/*"
                      disabled={isUploading}
                      onChange={(e) => handleFileUpload(e, 'kllyeein-gadgets/banners')}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Direct Image URL Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Or paste direct banner image URL (https://...)"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {isUploading && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-center gap-2.5 animate-pulse font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{uploadStatusText || 'Optimizing & Uploading banner to CDN...'}</span>
                  </div>
                )}

                {bannerImageUrl && (
                  <div className="space-y-2">
                    <p className="text-xs text-amber-300 font-mono">Optimized Banner Preview:</p>
                    <div className="relative h-44 rounded-xl overflow-hidden border border-white/10">
                      <img src={bannerImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bannerImageUrl)}
                      className="w-full py-2 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold"
                    >
                      {copiedUrl === bannerImageUrl ? 'Copied URL!' : 'Copy Banner CDN URL'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: STORE MEDIA & ASSET VAULT */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0d0f1a] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                    <Images className="w-5 h-5 text-sky-400" />
                    Store Media & Asset Library
                  </h2>
                  <p className="text-xs text-gray-400">
                    Upload, organize, and manage high-resolution product photos, campaign banners, and catalog assets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 font-mono">Asset Category:</label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono"
                  >
                    <option value="kllyeein-gadgets/products">Product Photos</option>
                    <option value="kllyeein-gadgets/banners">Hero Banners</option>
                    <option value="kllyeein-gadgets/categories">Category Covers</option>
                  </select>
                </div>
              </div>

              {/* ACTION BUTTONS (Camera + Multi-Gallery) FOR MEDIA TAB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 active:scale-[0.99] border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm">
                  <Camera className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Take Live Photo (Camera)</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={isUploading}
                    onChange={(e) => handleFileUpload(e, selectedFolder)}
                    className="sr-only"
                  />
                </label>

                <label className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.99] border border-white/15 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm">
                  <Upload className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Upload from Gallery / Files (Multi)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif,image/*"
                    multiple
                    disabled={isUploading}
                    onChange={(e) => handleFileUpload(e, selectedFolder)}
                    className="sr-only"
                  />
                </label>
              </div>

              {isUploading && (
                <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-sky-300 text-xs flex items-center justify-center gap-2.5 animate-pulse font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>{uploadStatusText || 'Optimizing & Uploading assets to Media Vault...'}</span>
                </div>
              )}

              {/* Media Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-300 font-mono uppercase">Asset Library:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {mediaGallery.map((url, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black h-36">
                      <img src={url} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                        <button
                          onClick={() => copyToClipboard(url)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-400 text-black text-[10px] font-bold uppercase"
                        >
                          {copiedUrl === url ? 'Copied!' : 'Copy URL'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: STORE SETTINGS & DELIVERY CONFIGURATION */}
        {activeTab === 'store_settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f1a] border border-cyan-500/30 shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5" /> Store Controls
                  </div>
                  <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                    Store Configuration & Delivery Rates
                  </h2>
                  <p className="text-xs text-gray-400">
                    Manage store branding details, contact hotline, physical showroom address, delivery charges, and promotional announcement banners.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Store className="w-6 h-6" />
                </div>
              </div>

              {/* Notification Feedback */}
              {storeSettingsSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>{storeSettingsSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                {/* 1. General Branding */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Building className="w-4 h-4" /> 1. Brand & Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">Store Brand Name</label>
                      <input
                        type="text"
                        required
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">Store Tagline / Slogan</label>
                      <input
                        type="text"
                        value={storeSettings.tagline}
                        onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" /> Customer Support Hotline
                      </label>
                      <input
                        type="text"
                        value={storeSettings.hotline}
                        onChange={(e) => setStoreSettings({ ...storeSettings, hotline: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Support Number
                      </label>
                      <input
                        type="text"
                        value={storeSettings.whatsapp}
                        onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" /> Support Email
                      </label>
                      <input
                        type="email"
                        value={storeSettings.supportEmail}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" /> Business Working Hours
                      </label>
                      <input
                        type="text"
                        value={storeSettings.businessHours}
                        onChange={(e) => setStoreSettings({ ...storeSettings, businessHours: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Physical Showroom / Outlet Address
                    </label>
                    <input
                      type="text"
                      value={storeSettings.showroomAddress}
                      onChange={(e) => setStoreSettings({ ...storeSettings, showroomAddress: e.target.value })}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Delivery Rates & Shipping Fees */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> 2. Delivery Rates & Shipping Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">Inside Dhaka (৳)</label>
                      <input
                        type="number"
                        min="0"
                        value={storeSettings.insideDhakaFee}
                        onChange={(e) => setStoreSettings({ ...storeSettings, insideDhakaFee: Number(e.target.value) || 0 })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                      />
                      <p className="text-[10px] text-gray-500">Standard inside capital fee</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">Outside Dhaka (৳)</label>
                      <input
                        type="number"
                        min="0"
                        value={storeSettings.outsideDhakaFee}
                        onChange={(e) => setStoreSettings({ ...storeSettings, outsideDhakaFee: Number(e.target.value) || 0 })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                      />
                      <p className="text-[10px] text-gray-500">Nationwide courier fee</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">Free Shipping Over (৳)</label>
                      <input
                        type="number"
                        min="0"
                        value={storeSettings.freeShippingThreshold}
                        onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) || 0 })}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                      />
                      <p className="text-[10px] text-gray-500">Cart subtotal for ৳0 fee</p>
                    </div>
                  </div>
                </div>

                {/* 3. Promotional Announcement Bar */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> 3. Storewide Announcement Banner
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                      <input
                        type="checkbox"
                        checked={storeSettings.isAnnouncementActive}
                        onChange={(e) => setStoreSettings({ ...storeSettings, isAnnouncementActive: e.target.checked })}
                        className="rounded border-white/20 bg-black/60 text-purple-500 focus:ring-purple-400 h-4 w-4"
                      />
                      <span>Active on Store</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={storeSettings.announcementText}
                      onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                      placeholder="e.g. 🚀 FREE EXPRESS SHIPPING on orders over ৳5,000"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Submit Save Button */}
                <button
                  type="submit"
                  disabled={isSavingStoreSettings}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isSavingStoreSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Store Settings...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save & Update Store Settings
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 8: ADMIN SECURITY & CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f1a] border border-amber-500/30 shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> Access Control
                  </div>
                  <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                    Admin Credentials & Password
                  </h2>
                  <p className="text-xs text-gray-400">
                    Update your administrator email, name, and login password. These credentials will be used for logging into the Admin Control Panel.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
              </div>

              {/* Notification Messages */}
              {securitySuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>{securitySuccessMessage}</span>
                </div>
              )}

              {securityErrorMessage && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 text-xs flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                  <span>{securityErrorMessage}</span>
                </div>
              )}

              {/* Active Admin Info */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
                <div className="text-gray-400 text-[11px] font-sans font-semibold">Active Admin Account:</div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-gray-300">
                  <span>
                    Email: <strong className="text-amber-300">{adminCredentials?.email || DEFAULT_ADMIN_EMAIL}</strong>
                  </span>
                  <span>
                    Name: <strong className="text-white">{adminCredentials?.fullName || 'Osman (Admin)'}</strong>
                  </span>
                </div>
              </div>

              {/* Credentials Update Form */}
              <form onSubmit={handleSaveAdminSecurity} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Admin Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Osman (Admin)"
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin.osman@gmail.com"
                    value={editAdminEmail}
                    onChange={(e) => setEditAdminEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Change Password (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="text-[11px] text-amber-400 hover:underline font-mono"
                    >
                      {showEditPassword ? 'Hide Password' : 'Show Password'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="Enter new password (leave blank to keep current)"
                      value={editAdminPassword}
                      onChange={(e) => setEditAdminPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                    />
                    <p className="text-[10px] text-gray-500">Minimum 6 characters recommended.</p>
                  </div>

                  {editAdminPassword && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">Confirm New Password</label>
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        value={editAdminPasswordConfirm}
                        onChange={(e) => setEditAdminPasswordConfirm(e.target.value)}
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSavingSecurity}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:opacity-90 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isSavingSecurity ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating Credentials...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Save & Update Credentials
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
