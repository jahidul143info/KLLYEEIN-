import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_STORE_SETTINGS, StoreSettings } from '../../../data/storeSettings';

let inMemorySettings: StoreSettings = { ...DEFAULT_STORE_SETTINGS };

export async function GET() {
  return NextResponse.json({
    settings: inMemorySettings,
    success: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    inMemorySettings = {
      ...inMemorySettings,
      ...body,
    };
    return NextResponse.json({
      settings: inMemorySettings,
      success: true,
      message: 'Store settings updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update store settings' },
      { status: 500 }
    );
  }
}
