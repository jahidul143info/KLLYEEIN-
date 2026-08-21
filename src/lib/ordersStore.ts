import { supabase, isSupabaseConfigured } from './supabase';

export interface OrderItem {
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

export interface AdminOrder {
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
    notes?: string;
  };
  createdAt: string;
}

declare global {
  var __GLOBAL_ORDERS_STORE__: AdminOrder[] | undefined;
}

const seedOrders: AdminOrder[] = [
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

if (!global.__GLOBAL_ORDERS_STORE__) {
  global.__GLOBAL_ORDERS_STORE__ = seedOrders;
}

export function getOrdersStore(): AdminOrder[] {
  if (!global.__GLOBAL_ORDERS_STORE__) {
    global.__GLOBAL_ORDERS_STORE__ = seedOrders;
  }
  return global.__GLOBAL_ORDERS_STORE__;
}

export async function addOrderToStore(orderData: Partial<AdminOrder>): Promise<AdminOrder> {
  const orderNumber = orderData.orderNumber || `KLY-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: AdminOrder = {
    id: orderData.id || `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    orderNumber,
    userEmail: orderData.userEmail || 'customer@kllyeein.com',
    status: orderData.status || 'pending',
    items: orderData.items || [],
    totalAmount: Number(orderData.totalAmount || 0),
    shippingFee: Number(orderData.shippingFee || 0),
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
    trxId: orderData.trxId || '',
    shippingAddress: orderData.shippingAddress || {
      fullName: '',
      phone: '',
      address: '',
      city: 'Dhaka',
    },
    createdAt: orderData.createdAt || new Date().toISOString(),
  };

  if (!global.__GLOBAL_ORDERS_STORE__) {
    global.__GLOBAL_ORDERS_STORE__ = seedOrders;
  }
  global.__GLOBAL_ORDERS_STORE__.unshift(newOrder);

  // If Supabase configured, insert
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
      console.error('Supabase order insert error:', err);
    }
  }

  return newOrder;
}

export async function updateOrderStatusInStore(orderId: string, status: AdminOrder['status']): Promise<boolean> {
  const store = getOrdersStore();
  const idx = store.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (idx !== -1) {
    store[idx].status = status;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('orders')
        .update({ status })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch (err) {
      console.error('Supabase update order error:', err);
    }
  }
  return true;
}

export async function deleteOrderFromStore(orderId: string): Promise<boolean> {
  if (global.__GLOBAL_ORDERS_STORE__) {
    global.__GLOBAL_ORDERS_STORE__ = global.__GLOBAL_ORDERS_STORE__.filter(
      (o) => o.id !== orderId && o.orderNumber !== orderId
    );
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('orders')
        .delete()
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch (err) {
      console.error('Supabase delete order error:', err);
    }
  }
  return true;
}
