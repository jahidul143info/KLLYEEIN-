export interface StorePaymentConfig {
  bkashNumber: string;
  bkashType: 'Personal (Send Money)' | 'Merchant (Payment)' | 'Agent';
  bkashInstructions: string;
  bkashQrUrl?: string;

  nagadNumber: string;
  nagadType: 'Personal (Send Money)' | 'Merchant (Payment)' | 'Agent';
  nagadInstructions: string;
  nagadQrUrl?: string;

  rocketNumber: string;
  rocketType: 'Personal (Send Money)' | 'Merchant (Payment)';
  rocketInstructions?: string;

  codEnabled: boolean;
  codInstructions: string;

  cardEnabled: boolean;
}

export interface StoreSettings extends StorePaymentConfig {
  storeName: string;
  tagline: string;
  hotline: string;
  whatsapp: string;
  supportEmail: string;
  showroomAddress: string;
  businessHours: string;
  insideDhakaFee: number;
  outsideDhakaFee: number;
  freeShippingThreshold: number;
  announcementText: string;
  isAnnouncementActive: boolean;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'KLLYEEIN GADGETS BANGLADESH',
  tagline: 'Cybernetic Tech, Flagship Phones & Acoustic Luxury',
  hotline: '+880 1700-112233',
  whatsapp: '+880 1700-112233',
  supportEmail: 'support@kllyeein.com',
  showroomAddress: 'Jamuna Future Park, Level 4 (Zone D, Shop 402), Dhaka',
  businessHours: '10:00 AM – 09:00 PM (Weekly Off: Wednesday)',
  insideDhakaFee: 60,
  outsideDhakaFee: 120,
  freeShippingThreshold: 5000,
  announcementText: '🚀 FREE EXPRESS SHIPPING across Bangladesh on orders over ৳5,000 | 100% Genuine Warranty',
  isAnnouncementActive: true,

  // Payment Methods Configuration
  bkashNumber: '01700-112233',
  bkashType: 'Personal (Send Money)',
  bkashInstructions: '1. Go to your bKash App or dial *247#\n2. Select "Send Money"\n3. Enter the bKash Number given above\n4. Enter total payable amount\n5. Enter Reference: KLLY\n6. Confirm with your PIN and paste the Transaction ID (TrxID) below.',
  bkashQrUrl: '',

  nagadNumber: '01700-112233',
  nagadType: 'Personal (Send Money)',
  nagadInstructions: '1. Open Nagad App or dial *167#\n2. Choose "Send Money"\n3. Enter the Nagad Number above\n4. Enter total amount and your PIN\n5. Copy the Transaction ID (TrxID) and enter below.',
  nagadQrUrl: '',

  rocketNumber: '01700-112233-0',
  rocketType: 'Personal (Send Money)',
  rocketInstructions: '1. Open Rocket App\n2. Select Send Money to the Rocket Number\n3. Enter Transaction ID below.',

  codEnabled: true,
  codInstructions: 'Pay with cash in hand after inspecting the product upon arrival at your doorstep.',

  cardEnabled: true,
};

/**
 * Get current store settings from localStorage or defaults
 */
export function getStoreSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
  try {
    const saved = localStorage.getItem('kllyeein_store_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STORE_SETTINGS, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_STORE_SETTINGS;
}

/**
 * Save store settings to localStorage and trigger sync event
 */
export function saveStoreSettings(settings: StoreSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('kllyeein_store_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('kllyeein_settings_updated'));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}
