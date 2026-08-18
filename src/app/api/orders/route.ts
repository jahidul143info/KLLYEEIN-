import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

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
  };
  createdAt: string;
}

// In-memory seed orders for demonstration if DB is empty or not connected
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const search = searchParams.get('search');

  let allOrders = [...ordersStore];

  // Try fetching from Supabase if connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbOrders && dbOrders.length > 0) {
        const formatted = dbOrders.map((o: any) => ({
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

  return NextResponse.json({
    count: filtered.length,
    orders: filtered,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, totalPrice, shippingFee, paymentMethod, shippingAddress, trxId, userEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
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

    // Save to Supabase if connected
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

    return NextResponse.json({
      success: true,
      order: newOrder,
      transactionId: orderNumber,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Update in-memory
    const idx = ordersStore.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx !== -1) {
      ordersStore[idx].status = status;
    }

    // Update in Supabase
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

    return NextResponse.json({ success: true, orderId, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
