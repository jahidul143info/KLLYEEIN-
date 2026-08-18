import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, totalPrice, shippingFee, paymentMethod, shippingAddress, trxId, userEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const orderNumber = `KLY-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `ord_${Date.now()}`;

    // If Supabase is configured, insert to orders table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert({
          id: orderId,
          order_number: orderNumber,
          user_email: userEmail || shippingAddress?.email || 'customer@kllyeein.com',
          status: 'pending',
          items: items,
          total_amount: Number(totalPrice),
          shipping_fee: Number(shippingFee || 0),
          payment_method: paymentMethod,
          shipping_address: {
            ...shippingAddress,
            trxId: trxId || '',
          },
        });
      } catch (err) {
        console.error('Failed to save order to Supabase:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully via KLLYEEIN BD Payment Engine',
      transactionId: orderNumber,
      orderNumber,
      status: 'pending',
      details: {
        totalPrice,
        paymentMethod,
        recipient: shippingAddress?.fullName,
        city: shippingAddress?.city,
        trxId: trxId || 'N/A',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process checkout' }, { status: 500 });
  }
}

