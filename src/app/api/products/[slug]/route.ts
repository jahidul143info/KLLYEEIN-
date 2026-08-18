import { NextResponse } from 'next/server';
import { getProductBySlug } from '../../../../data/products';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}
