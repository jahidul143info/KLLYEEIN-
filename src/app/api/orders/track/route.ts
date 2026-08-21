import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase';
import { getOrdersStore, AdminOrder } from '../../../../lib/ordersStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('orderNumber') || searchParams.get('id') || searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Please provide a valid Order Number (e.g. KLY-982143)' }, { status: 400 });
  }

  const cleanQuery = query.trim().toUpperCase();
  let foundOrder: AdminOrder | null = null;

  // 1. Search in local / in-memory orders store
  const store = getOrdersStore();
  foundOrder = store.find((o) => 
    o.orderNumber.toUpperCase() === cleanQuery || 
    o.id.toUpperCase() === cleanQuery ||
    o.orderNumber.toUpperCase().includes(cleanQuery) ||
    cleanQuery.includes(o.orderNumber.toUpperCase())
  ) || null;

  // 2. Search in Supabase database if connected and not found or to get freshest DB record
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`order_number.ilike.%${cleanQuery}%,id.ilike.%${cleanQuery}%`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        foundOrder = {
          id: data.id,
          orderNumber: data.order_number,
          userEmail: data.user_email,
          status: data.status || 'pending',
          items: data.items || [],
          totalAmount: Number(data.total_amount || 0),
          shippingFee: Number(data.shipping_fee || 0),
          paymentMethod: data.payment_method || 'Cash on Delivery',
          trxId: data.trx_id || (data.shipping_address?.trxId) || '',
          shippingAddress: data.shipping_address || {},
          createdAt: data.created_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('Error querying order in Supabase:', err);
    }
  }

  if (!foundOrder) {
    return NextResponse.json(
      { 
        found: false, 
        error: `No order found matching "${query}". Please check your order ID and try again.` 
      }, 
      { status: 404 }
    );
  }

  // Calculate timeline milestone timestamps based on order creation
  const createdDate = new Date(foundOrder.createdAt || Date.now());
  const status = foundOrder.status || 'pending';

  // Format safe public view (masking full sensitive phone for privacy)
  const phone = foundOrder.shippingAddress?.phone || '';
  const maskedPhone = phone.length > 6 
    ? `${phone.slice(0, 3)}****${phone.slice(-3)}`
    : phone || 'Provided';

  return NextResponse.json({
    found: true,
    order: {
      id: foundOrder.id,
      orderNumber: foundOrder.orderNumber,
      status: foundOrder.status,
      createdAt: foundOrder.createdAt,
      totalAmount: foundOrder.totalAmount,
      shippingFee: foundOrder.shippingFee,
      paymentMethod: foundOrder.paymentMethod,
      trxId: foundOrder.trxId ? `${foundOrder.trxId.slice(0, 3)}***${foundOrder.trxId.slice(-2)}` : undefined,
      shippingAddress: {
        fullName: foundOrder.shippingAddress?.fullName || 'Customer',
        phone: maskedPhone,
        city: foundOrder.shippingAddress?.city || 'Dhaka',
        address: foundOrder.shippingAddress?.address || 'Bangladesh',
      },
      items: (foundOrder.items || []).map((item) => ({
        product: {
          id: item.product?.id || 'item',
          name: item.product?.name || 'Gadget Device',
          price: item.product?.price || 0,
          images: item.product?.images || [],
        },
        quantity: item.quantity || 1,
        selectedColor: item.selectedColor,
        selectedStorage: item.selectedStorage,
      })),
      estimatedDelivery: '24–48 Hours (Express BD Courier)',
      courierPartner: 'Steadfast / Pathao Express Logistics',
    }
  });
}
