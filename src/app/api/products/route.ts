import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '../../../data/products';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { Product } from '../../../types';

// In-memory store for custom added products when Supabase is not connected
let customProductsStore: Product[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('search');

  let allProducts: Product[] = [...PRODUCTS, ...customProductsStore];

  // If Supabase is connected, fetch live products from Supabase database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbProducts && dbProducts.length > 0) {
        // Map DB snake_case columns to camelCase product interface
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

        // Merge DB products with default static list ensuring uniqueness by ID or slug
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

  return NextResponse.json({
    count: filtered.length,
    products: filtered,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Product name, category, and price are required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
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

    // Save to Supabase if configured
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
        images: newProduct.images, // Cloudinary URLs stored here
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

    // Always keep in local memory store for instant preview
    customProductsStore.unshift(newProduct);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully with Cloudinary image URLs',
      product: newProduct,
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Remove from memory
    customProductsStore = customProductsStore.filter((p) => p.id !== id);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
