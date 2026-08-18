import { Product, Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-phones',
    name: 'Smartphones & Foldables',
    slug: 'phones',
    description: 'Flagship neural devices, quantum displays, aerospace titanium bodies.',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
    itemCount: 12
  },
  {
    id: 'cat-audio',
    name: 'Neural Audio & Acoustics',
    slug: 'audio',
    description: 'Zero-latency spatial sound, planar magnetic drivers, active noise isolation.',
    icon: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
    itemCount: 16
  },
  {
    id: 'cat-wearables',
    name: 'Quantum Wearables',
    slug: 'wearables',
    description: 'Cybernetic health trackers, sapphire glass smartwatches, biometric sensors.',
    icon: 'Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
    itemCount: 9
  },
  {
    id: 'cat-accessories',
    name: 'Cyber Accessories',
    slug: 'accessories',
    description: 'MagSafe wireless power banks, braided Kevlar cables, carbon cases.',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1609592424083-d2d1421ecae5?q=80&w=800',
    itemCount: 24
  },
  {
    id: 'cat-smarthome',
    name: 'Smart Home & Drones',
    slug: 'smarthome',
    description: '4K cinematic drones, ambient neural lights, smart security systems.',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800',
    itemCount: 11
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'KLLYEEIN CyberPhone 16 Pro Max',
    slug: 'cyberphone-16-pro-max',
    category: 'phones',
    tagline: 'Aerospace Grade 5 Titanium with Neural Bionic Engine',
    description: 'Experience the pinnacle of mobile tech. The KLLYEEIN CyberPhone 16 Pro Max features a custom 6.9-inch 120Hz ProMotion LTPO OLED display, Grade 5 aerospace titanium chassis, 200MP Quad-Camera array with 10x optical zoom, and liquid cooling chamber.',
    price: 185000,
    originalPrice: 210000,
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1000',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=1000'
    ],
    specs: [
      { name: 'Processor', value: 'Neural Bionic X16 (3nm)' },
      { name: 'Display', value: '6.9" LTPO Super Retina OLED (2500 nits)' },
      { name: 'Camera', value: '200MP Main + 50MP Ultra-Wide + 48MP Telephoto' },
      { name: 'RAM / Storage', value: '16GB LPDDR5X / 512GB UFS 4.0' },
      { name: 'Battery', value: '5200mAh with 85W CyberCharge' },
      { name: 'Chassis', value: 'Grade 5 Titanium Frame & Ceramic Glass' }
    ],
    isFeatured: true,
    isTrending: true,
    isNewRelease: true,
    stock: 25,
    rating: 4.9,
    reviewCount: 148,
    tags: ['5G', 'Titanium', '200MP', 'Flagship', 'Fast Charge']
  },
  {
    id: 'prod-002',
    name: 'KLLYEEIN Acoustic Pro Spatial Headphones',
    slug: 'acoustic-pro-spatial-headphones',
    category: 'audio',
    tagline: '50mm Planar Magnetic Drivers with Active Neural ANC',
    description: 'Immerse yourself in concert-grade audio precision. Designed with real carbon fiber headband, memory foam ear cups wrapped in microfiber, custom 50mm planar magnetic drivers, and 60 hours of active playback with spatial audio tracking.',
    price: 34500,
    originalPrice: 42000,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000'
    ],
    specs: [
      { name: 'Driver Size', value: '50mm Custom Planar Magnetic' },
      { name: 'Noise Cancellation', value: 'Hybrid Active Neural ANC (-48dB)' },
      { name: 'Battery Life', value: '60 Hours (ANC On) / 80 Hours (ANC Off)' },
      { name: 'Connectivity', value: 'Bluetooth 5.4 / Lossless USB-C 32-bit/384kHz' },
      { name: 'Weight', value: '285g' }
    ],
    isFeatured: true,
    isTrending: true,
    isNewRelease: false,
    stock: 40,
    rating: 4.8,
    reviewCount: 96,
    tags: ['Lossless', 'Planar Magnetic', 'ANC', 'Spatial Audio', '60hr Battery']
  },
  {
    id: 'prod-003',
    name: 'KLLYEEIN Quantum Watch Ultra',
    slug: 'quantum-watch-ultra',
    category: 'wearables',
    tagline: '49mm Titanium Case, Sapphire Crystal Display & ECG',
    description: 'The ultimate smartwatch for extreme sports and daily executive performance. Features dual-frequency L1+L5 GPS, sapphire glass touchscreen, depth gauge for diving up to 100m, ECG pulse sensor, and 7-day battery life.',
    price: 68000,
    originalPrice: 78000,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000'
    ],
    specs: [
      { name: 'Case Size', value: '49mm Grade 5 Titanium' },
      { name: 'Display', value: '2.1" Always-On AMOLED Sapphire (3000 nits)' },
      { name: 'Sensors', value: 'ECG, SpO2, Skin Temp, Dual-Frequency GPS, Depth Gauge' },
      { name: 'Water Resistance', value: '100m / EN13319 Dive Certified' },
      { name: 'Battery Life', value: '7 Days Standard / 60 Hours Outdoor GPS' }
    ],
    isFeatured: true,
    isTrending: false,
    isNewRelease: true,
    stock: 18,
    rating: 4.9,
    reviewCount: 64,
    tags: ['Titanium', 'Sapphire Glass', 'ECG', '100m Water Resistant', 'GPS']
  },
  {
    id: 'prod-004',
    name: 'KLLYEEIN CyberFold Z Horizon',
    slug: 'cyberfold-z-horizon',
    category: 'phones',
    tagline: 'Zero-Gap Armor Hinge & Dual 120Hz OLED Foldable Display',
    description: 'Unfold endless possibilities with the world’s thinnest foldable flagship. Features a zero-gap titanium armor hinge, 8.0-inch inner OLED flex screen, integrated stylus support, and desktop multi-tasking mode.',
    price: 215000,
    originalPrice: 240000,
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1000',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000'
    ],
    specs: [
      { name: 'Main Display', value: '8.0" LTPO OLED Flex (120Hz)' },
      { name: 'Cover Display', value: '6.5" OLED 120Hz Gorilla Armor Glass' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 3 Cyber Edition' },
      { name: 'RAM / Storage', value: '16GB RAM / 1TB Storage' },
      { name: 'Hinge Tech', value: 'Zero-Gap Titanium Multi-Axis Hinge' }
    ],
    isFeatured: false,
    isTrending: true,
    isNewRelease: true,
    stock: 10,
    rating: 4.7,
    reviewCount: 32,
    tags: ['Foldable', '1TB', 'Dual Screen', 'Luxury Tech']
  },
  {
    id: 'prod-005',
    name: 'KLLYEEIN MagCharge CyberStation 100W',
    slug: 'magcharge-cyberstation-100w',
    category: 'accessories',
    tagline: '3-in-1 Magnetic Fast Charging Dock with Cooling Fan',
    description: 'Keep all your Apple & Android devices fully charged at lightning speeds. Features 100W total output, active semiconductor cooling fan to keep your phone cold while fast charging, and ambient RGB neon halo light.',
    price: 9500,
    originalPrice: 12500,
    images: [
      'https://images.unsplash.com/photo-1609592424083-d2d1421ecae5?q=80&w=1000',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000'
    ],
    specs: [
      { name: 'Total Output', value: '100W Multi-Device Fast Charge' },
      { name: 'Compatibility', value: 'MagSafe, Qi2, Apple Watch, AirPods, USB-C' },
      { name: 'Cooling Tech', value: 'Peltier Semiconductor Active Fan' },
      { name: 'Material', value: 'Anodized Aluminum Alloy & Tempered Glass' }
    ],
    isFeatured: false,
    isTrending: true,
    isNewRelease: false,
    stock: 50,
    rating: 4.9,
    reviewCount: 180,
    tags: ['MagSafe', '100W', 'Fast Charge', 'RGB', '3-in-1']
  },
  {
    id: 'prod-006',
    name: 'KLLYEEIN CyberDrone X 4K Cinematic',
    slug: 'cyberdrone-x-4k-cinematic',
    category: 'smarthome',
    tagline: '1-inch CMOS Sensor, 360° Obstacle Avoidance & 45-Min Flight',
    description: 'Capture breathtaking cinematic 4K HDR footage at 60fps. Equipped with omnidirectional laser obstacle sensors, 15km OcuSync video transmission, and foldable ultralight carbon frame under 249g.',
    price: 112000,
    originalPrice: 130000,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1000'
    ],
    specs: [
      { name: 'Camera', value: '1-inch CMOS 48MP 4K/60fps HDR' },
      { name: 'Flight Time', value: '45 Minutes per Battery' },
      { name: 'Range', value: '15km HD Video Transmission' },
      { name: 'Safety', value: '360° LiDAR & Vision Obstacle Avoidance' },
      { name: 'Weight', value: '249g Foldable' }
    ],
    isFeatured: true,
    isTrending: false,
    isNewRelease: true,
    stock: 12,
    rating: 5.0,
    reviewCount: 42,
    tags: ['4K Video', 'Drone', '45 Min Flight', 'LiDAR', '249g']
  },
  {
    id: 'prod-007',
    name: 'KLLYEEIN PulseBuds Cyber ANC',
    slug: 'pulsebuds-cyber-anc',
    category: 'audio',
    tagline: 'Transparent Crystal Charging Case & High-Res LDAC Audio',
    description: 'Ultra-compact true wireless earbuds with transparent cyberpunk design. High-resolution LDAC bluetooth codec, dual microphone noise isolation, low-latency gaming mode (35ms), and wireless Qi charging case.',
    price: 14500,
    originalPrice: 18000,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000'
    ],
    specs: [
      { name: 'Audio Codec', value: 'LDAC, AAC, SBC (Hi-Res Audio Certified)' },
      { name: 'ANC', value: '42dB Hybrid Active Noise Cancellation' },
      { name: 'Latency', value: '35ms Ultra-Low Gaming Mode' },
      { name: 'Battery', value: '8 Hours Earbuds + 32 Hours Case' }
    ],
    isFeatured: false,
    isTrending: true,
    isNewRelease: false,
    stock: 65,
    rating: 4.6,
    reviewCount: 112,
    tags: ['True Wireless', 'Transparent', 'Hi-Res', 'LDAC', '35ms Latency']
  },
  {
    id: 'prod-008',
    name: 'KLLYEEIN CyberPower Bank 25000mAh OLED',
    slug: 'cyberpower-bank-25000mah-oled',
    category: 'accessories',
    tagline: '140W PD 3.1 Two-Way Fast Charge with Real-Time Smart OLED',
    description: 'Power up laptops, phones, and drones on the go. High-density 25000mAh battery pack capable of charging a MacBook Pro to 50% in just 30 minutes. Real-time OLED display shows exact power flow, temp, and health.',
    price: 13800,
    originalPrice: 16500,
    images: [
      'https://images.unsplash.com/photo-1609592424083-d2d1421ecae5?q=80&w=1000'
    ],
    specs: [
      { name: 'Capacity', value: '25,000mAh / 90Wh (Airline Approved)' },
      { name: 'Max Output', value: '140W USB-C PD 3.1' },
      { name: 'Display', value: '1.3" Color OLED Power Meter' },
      { name: 'Ports', value: '2x USB-C PD + 1x USB-A QuickCharge 4+' }
    ],
    isFeatured: false,
    isTrending: true,
    isNewRelease: true,
    stock: 30,
    rating: 4.9,
    reviewCount: 78,
    tags: ['140W PD', '25000mAh', 'OLED Display', 'Laptop Power']
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return PRODUCTS.find(p => p.slug.toLowerCase() === clean);
}
