import { NextResponse } from 'next/server';
import { addOrderToStore } from '../../../lib/ordersStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, totalPrice, shippingFee, paymentMethod, shippingAddress, trxId, userEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const orderNumber = `KLY-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await addOrderToStore({
      orderNumber,
      userEmail: userEmail || shippingAddress?.email || 'customer@kllyeein.com',
      status: 'pending',
      items: items,
      totalAmount: Number(totalPrice),
      shippingFee: Number(shippingFee || 0),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      trxId: trxId || '',
      shippingAddress: {
        fullName: shippingAddress?.fullName || 'Customer',
        phone: shippingAddress?.phone || '',
        address: shippingAddress?.address || '',
        city: shippingAddress?.city || 'Dhaka',
        notes: shippingAddress?.notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully via KLLYEEIN BD Payment Engine',
      transactionId: newOrder.orderNumber,
      orderNumber: newOrder.orderNumber,
      status: 'pending',
      order: newOrder,
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
