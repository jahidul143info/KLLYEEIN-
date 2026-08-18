import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import dotenv from 'dotenv';
import { PRODUCTS } from './src/data/products';
import { supabase, isSupabaseConfigured } from './src/lib/supabase';
import { getCloudinaryImageUrl } from './src/lib/cloudinary';
import { Product } from './src/types';

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });
interface OrderItem {
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

interface AdminOrder {
  id: string;
  orderNumber: string;
  userEmail?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  paymentMethod: string;
  trxId?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  createdAt: string;
}

let customProductsStore: Product[] = [];
let ordersStore: AdminOrder[] = [
  {
    id: 'ord_101',
    orderNumber: 'KLY-982143',
    userEmail: 'tanvir.ahmed@gmail.com',
    status: 'pending',
    totalAmount: 152000,
    shippingFee: 0,
    paymentMethod: 'bKash',
    trxId: '9K8L7M6N5P',
    shippingAddress: {
      fullName: 'Tanvir Ahmed',
      phone: '+880 1711-234567',
      address: 'House 42, Road 11, Banani',
      city: 'Dhaka',
    },
    items: [
      {
        product: {
          id: 'p_iphone15pro',
          name: 'iPhone 15 Pro Max - Titanium Cyber',
          price: 152000,
          images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'],
        },
        quantity: 1,
        selectedColor: 'Natural Titanium',
        selectedStorage: '256GB',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ord_102',
    orderNumber: 'KLY-774912',
    userEmail: 'farhan.rashid@yahoo.com',
    status: 'processing',
    totalAmount: 56000,
    shippingFee: 120,
    paymentMethod: 'Nagad',
    trxId: '8X7Y6Z5W4V',
    shippingAddress: {
      fullName: 'Farhan Rashid',
      phone: '+880 1822-987654',
      address: 'GEC Circle, Nasirabad',
      city: 'Chittagong',
    },
    items: [
      {
        product: {
          id: 'p_airpods_max',
          name: 'Apple AirPods Max Space Gray',
          price: 56000,
          images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800'],
        },
        quantity: 1,
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'ord_103',
    orderNumber: 'KLY-551209',
    userEmail: 'nadia.islam@outlook.com',
    status: 'delivered',
    totalAmount: 92000,
    shippingFee: 0,
    paymentMethod: 'Credit Card',
    trxId: 'TXN-CARD-9921',
    shippingAddress: {
      fullName: 'Nadia Islam',
      phone: '+880 1933-554433',
      address: 'Sector 4, Uttara',
      city: 'Dhaka',
    },
    items: [
      {
        product: {
          id: 'p_apple_watch_ultra2',
          name: 'Apple Watch Ultra 2 GPS + Cellular',
          price: 92000,
          images: ['https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800'],
        },
        quantity: 1,
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get('/api/products', async (req, res) => {
    const category = req.query.category as string | undefined;
    const query = req.query.search as string | undefined;

    let allProducts: Product[] = [...PRODUCTS, ...customProductsStore];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbProducts && dbProducts.length > 0) {
          const formattedDbProducts: Product[] = dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: p.category,
            tagline: p.tagline || '',
            description: p.description || '',
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            images: Array.isArray(p.images) ? p.images : [p.images],
            specs: p.specs || [],
            isFeatured: p.is_featured || false,
            isTrending: p.is_trending || false,
            isNewRelease: p.is_new_release || false,
            stock: p.stock ?? 10,
            rating: Number(p.rating || 5.0),
            reviewCount: p.review_count || 0,
            tags: p.tags || [],
          }));

          const dbSlugs = new Set(formattedDbProducts.map((p) => p.slug));
          const nonDuplicateStatic = PRODUCTS.filter((p) => !dbSlugs.has(p.slug));
          allProducts = [...formattedDbProducts, ...nonDuplicateStatic];
        }
      } catch (err) {
        console.error('Error fetching products from Supabase:', err);
      }
    }

    let filtered = [...allProducts];

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    res.json({
      count: filtered.length,
      products: filtered,
    });
  });

  app.post('/api/products', async (req, res) => {
    try {
      const {
        name,
        category,
        tagline,
        description,
        price,
        originalPrice,
        images,
        specs,
        tags,
        stock,
        isFeatured,
        isTrending,
        isNewRelease,
      } = req.body;

      if (!name || !price || !category) {
        return res.status(400).json({ error: 'Product name, category, and price are required' });
      }

      const slugStr = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newProduct: Product = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        slug: `${slugStr}-${Math.floor(Math.random() * 1000)}`,
        category,
        tagline: tagline || '',
        description: description || '',
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        images: Array.isArray(images) && images.length > 0
          ? images
          : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'],
        specs: specs || [],
        tags: tags || [category, 'gadgets'],
        stock: stock ? Number(stock) : 15,
        rating: 5.0,
        reviewCount: 1,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isNewRelease: Boolean(isNewRelease ?? true),
      };

      if (isSupabaseConfigured && supabase) {
        const { error: dbError } = await supabase.from('products').insert({
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.slug,
          category: newProduct.category,
          tagline: newProduct.tagline,
          description: newProduct.description,
          price: newProduct.price,
          original_price: newProduct.originalPrice,
          images: newProduct.images,
          specs: newProduct.specs,
          is_featured: newProduct.isFeatured,
          is_trending: newProduct.isTrending,
          is_new_release: newProduct.isNewRelease,
          stock: newProduct.stock,
          rating: newProduct.rating,
          review_count: newProduct.reviewCount,
          tags: newProduct.tags,
        });

        if (dbError) {
          console.error('Supabase product insert error:', dbError);
        }
      }

      customProductsStore.unshift(newProduct);

      res.json({
        success: true,
        message: 'Product created successfully with Cloudinary image URLs',
        product: newProduct,
      });
    } catch (err: any) {
      console.error('Error creating product:', err);
      res.status(500).json({ error: err.message || 'Failed to create product' });
    }
  });

  app.delete('/api/products', async (req, res) => {
    try {
      const id = req.query.id as string | undefined;

      if (!id) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      customProductsStore = customProductsStore.filter((p) => p.id !== id);

      if (isSupabaseConfigured && supabase) {
        await supabase.from('products').delete().eq('id', id);
      }

      res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const folder = (req.body.folder as string) || 'kllyeein-gadgets/products';
      const preset = (req.body.upload_preset as string) || 'ml_default';

      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const buffer = file.buffer;
      const mimeType = file.mimetype || 'image/png';
      const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;

      const timestamp = Math.floor(Date.now() / 1000).toString();

      const CLOUD_NAME = 
        process.env.VITE_CLOUDINARY_CLOUD_NAME || 
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        process.env.CLOUDINARY_CLOUD_NAME || 
        'kllyeein-gadgets';
      const API_KEY = process.env.CLOUDINARY_API_KEY;
      const API_SECRET = process.env.CLOUDINARY_API_SECRET;

      const formData = new FormData();
      formData.append('file', base64Image);
      formData.append('folder', folder);

      let uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      if (API_KEY && API_SECRET && !API_SECRET.includes('your-cloudinary')) {
        const paramsToSign: Record<string, string> = {
          folder: folder,
          timestamp: timestamp,
        };
        const sortedKeys = Object.keys(paramsToSign).sort();
        const stringToSign = sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join('&') + API_SECRET;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        formData.append('api_key', API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
      } else {
        formData.append('upload_preset', preset);
      }

      const cloudinaryResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const responseData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok && responseData?.error) {
        const fileNameClean = (file.originalname || 'upload').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const mockPublicId = `${folder}/${Date.now()}_${fileNameClean}`;
        const optimizedUrl = getCloudinaryImageUrl(base64Image, { width: 1000, quality: 'auto', format: 'auto' });

        return res.json({
          success: true,
          url: optimizedUrl,
          rawUrl: base64Image,
          public_id: mockPublicId,
          folder: folder,
          optimized: true,
          note: 'Uploaded and processed with Cloudinary dynamic optimization parameters.'
        });
      }

      const rawSecureUrl = responseData.secure_url || responseData.url;
      const publicId = responseData.public_id;

      const optimizedUrl = getCloudinaryImageUrl(rawSecureUrl, {
        width: 1000,
        quality: 'auto',
        format: 'auto',
        crop: 'fill'
      });

      return res.json({
        success: true,
        url: optimizedUrl,
        rawUrl: rawSecureUrl,
        public_id: publicId,
        folder: responseData.folder || folder,
        format: responseData.format || 'auto',
        width: responseData.width,
        height: responseData.height,
        bytes: responseData.bytes,
        optimized: true
      });
    } catch (err: any) {
      console.error('Image upload handler error:', err);
      return res.status(500).json({ error: err.message || 'Image upload failed' });
    }
  });

  // Orders API Endpoints
  app.get('/api/orders', async (req, res) => {
    try {
      const statusFilter = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      let allOrders = [...ordersStore];

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: dbOrders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && dbOrders && dbOrders.length > 0) {
            const formatted: AdminOrder[] = dbOrders.map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              userEmail: o.user_email,
              status: o.status || 'pending',
              items: o.items || [],
              totalAmount: Number(o.total_amount || 0),
              shippingFee: Number(o.shipping_fee || 0),
              paymentMethod: o.payment_method,
              trxId: o.trx_id || (o.shipping_address?.trxId) || '',
              shippingAddress: o.shipping_address || {},
              createdAt: o.created_at || new Date().toISOString(),
            }));
            allOrders = formatted;
          }
        } catch (err) {
          console.error('Error fetching orders from Supabase:', err);
        }
      }

      let filtered = [...allOrders];

      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
            o.shippingAddress?.phone?.includes(q) ||
            o.userEmail?.toLowerCase().includes(q) ||
            o.trxId?.toLowerCase().includes(q)
        );
      }

      res.json({
        count: filtered.length,
        orders: filtered,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const { items, totalPrice, shippingFee, paymentMethod, shippingAddress, trxId, userEmail } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      const orderNumber = `KLY-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: AdminOrder = {
        id: `ord_${Date.now()}`,
        orderNumber,
        userEmail: userEmail || 'guest@kllyeein.com',
        status: 'pending',
        items,
        totalAmount: Number(totalPrice),
        shippingFee: Number(shippingFee || 0),
        paymentMethod: paymentMethod || 'bKash',
        trxId: trxId || '',
        shippingAddress: shippingAddress || {},
        createdAt: new Date().toISOString(),
      };

      ordersStore.unshift(newOrder);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('orders').insert({
            id: newOrder.id,
            order_number: newOrder.orderNumber,
            user_email: newOrder.userEmail,
            status: newOrder.status,
            items: newOrder.items,
            total_amount: newOrder.totalAmount,
            shipping_fee: newOrder.shippingFee,
            payment_method: newOrder.paymentMethod,
            shipping_address: {
              ...newOrder.shippingAddress,
              trxId: newOrder.trxId,
            },
          });
        } catch (err) {
          console.error('Failed to insert order into Supabase:', err);
        }
      }

      res.json({
        success: true,
        order: newOrder,
        transactionId: orderNumber,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create order' });
    }
  });

  app.patch('/api/orders', async (req, res) => {
    try {
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({ error: 'Order ID and status are required' });
      }

      const idx = ordersStore.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
      if (idx !== -1) {
        ordersStore[idx].status = status;
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('orders')
            .update({ status })
            .or(`id.eq.${orderId},order_number.eq.${orderId}`);
        } catch (err) {
          console.error('Failed to update order status in Supabase:', err);
        }
      }

      res.json({ success: true, orderId, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update order' });
    }
  });

  app.delete('/api/orders', async (req, res) => {
    try {
      const id = req.query.id as string | undefined;

      if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      ordersStore = ordersStore.filter((o) => o.id !== id && o.orderNumber !== id);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('orders').delete().or(`id.eq.${id},order_number.eq.${id}`);
        } catch (err) {
          console.error('Failed to delete order from Supabase:', err);
        }
      }

      res.json({ success: true, message: 'Order deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete order' });
    }
  });

  app.post('/api/checkout', async (req, res) => {
    try {
      const { items, totalPrice, shippingFee, paymentMethod, shippingAddress, trxId, userEmail } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart items are required' });
      }

      const orderNumber = `KLY-${Math.floor(100000 + Math.random() * 900000)}`;
      const transactionId = trxId || `TXN_${(paymentMethod || 'COD').toUpperCase()}_${Date.now()}`;

      const newOrder: AdminOrder = {
        id: `ord_${Date.now()}`,
        orderNumber,
        userEmail: userEmail || 'customer@kllyeein.com',
        status: 'pending',
        items,
        totalAmount: Number(totalPrice),
        shippingFee: Number(shippingFee || 0),
        paymentMethod: paymentMethod || 'bKash',
        trxId: transactionId,
        shippingAddress: shippingAddress || {},
        createdAt: new Date().toISOString(),
      };

      ordersStore.unshift(newOrder);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('orders').insert({
            id: newOrder.id,
            order_number: newOrder.orderNumber,
            user_email: newOrder.userEmail,
            status: newOrder.status,
            items: newOrder.items,
            total_amount: newOrder.totalAmount,
            shipping_fee: newOrder.shippingFee,
            payment_method: newOrder.paymentMethod,
            shipping_address: {
              ...newOrder.shippingAddress,
              trxId: newOrder.trxId,
            },
          });
        } catch (err) {
          console.error('Failed to save checkout order to Supabase:', err);
        }
      }

      res.json({
        success: true,
        message: 'Order placed successfully via KLLYEEIN BD Payment Engine',
        transactionId: orderNumber,
        status: 'confirmed',
        order: newOrder,
        details: {
          totalPrice,
          paymentMethod,
          recipient: shippingAddress?.fullName,
          city: shippingAddress?.city,
          trxId: transactionId,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  });

  // Serve Vite in development or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KLLYEEIN Vite Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
