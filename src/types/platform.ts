export type UserRole = 'super_admin' | 'seller' | 'customer';

export type SellerStatus = 'active' | 'suspended' | 'banned';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  isVerified: boolean;
}

export interface Seller extends User {
  role: 'seller';
  storeName: string;
  storeDescription?: string;
  status: SellerStatus;
  commissionOwed: number;
  lastPaymentDate?: Date;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  stock: number;
  allowBargain: boolean;
  minBargainPrice?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface BargainOffer {
  id: string;
  productId: string;
  customerId: string;
  sellerId: string;
  offerPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterPrice?: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  sellerId: string;
  products: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online';
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  bargainOfferId?: string;
}

export interface PlatformSettings {
  siteName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontDisplay: string;
  fontBody: string;
  commissionRate: number;
  subscriptionFee: number;
  allowBargain: boolean;
  allowCOD: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  metaDescription: string;
  ogImage: string;
  twitterHandle: string;
}
