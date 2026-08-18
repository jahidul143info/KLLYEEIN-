import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, totalPrice, paymentMethod, shippingAddress, trxId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    const transactionId = `BD_${paymentMethod.toUpperCase()}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully via KLLYEEIN BD Payment Engine',
      transactionId,
      status: 'confirmed',
      details: {
        totalPrice,
        paymentMethod,
        recipient: shippingAddress?.fullName,
        city: shippingAddress?.city,
        trxId: trxId || 'N/A'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
