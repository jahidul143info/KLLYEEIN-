export interface ProductSpec {
  name: string;
  value: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'phones' | 'audio' | 'wearables' | 'accessories' | 'smarthome';
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  specs: ProductSpec[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  reviews?: Review[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
}
