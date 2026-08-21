import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import {
  getOrdersStore,
  addOrderToStore,
  updateOrderStatusInStore,
  deleteOrderFromStore,
  AdminOrder,
  OrderItem,
} from '../../../lib/ordersStore';

export type { AdminOrder, OrderItem };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const search = searchParams.get('search');

  let allOrders = [...getOrdersStore()];

  // Try fetching latest from Supabase if connected
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

        // Merge DB orders with memory store
        const existingIds = new Set(formatted.map((f) => f.id));
        allOrders.forEach((mem) => {
          if (!existingIds.has(mem.id)) {
            formatted.push(mem);
          }
        });
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
    const newOrder = await addOrderToStore({
      orderNumber,
      userEmail: userEmail || (shippingAddress as any)?.email || 'customer@kllyeein.com',
      status: 'pending',
      items,
      totalAmount: Number(totalPrice),
      shippingFee: Number(shippingFee || 0),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      trxId: trxId || '',
      shippingAddress: shippingAddress || {
        fullName: 'Customer',
        phone: '',
        address: '',
        city: 'Dhaka',
      },
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      transactionId: newOrder.orderNumber,
      orderNumber: newOrder.orderNumber,
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

    await updateOrderStatusInStore(orderId, status);

    return NextResponse.json({ success: true, orderId, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await deleteOrderFromStore(orderId);

    return NextResponse.json({ success: true, orderId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete order' }, { status: 500 });
  }
}
