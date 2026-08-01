// ============================================================
// SabziMitra Core Models
// ============================================================

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';
export type VendorStatus = 'OPEN' | 'LOW_STOCK' | 'CLOSED';
export type QualityGrade = 'A' | 'B' | 'C';
export type SubscriptionTier = 'FREE' | 'PRO' | 'PREMIUM';
export type MessageType = 'TEXT' | 'IMAGE';
export type NotificationType = 'STOCK_UPDATE' | 'REQUEST' | 'CHAT' | 'SYSTEM';

export interface User {
  id: number;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Vendor {
  id: number;
  userId: number;
  shopName: string;
  shopImage?: string;
  coverImage?: string;
  address: string;
  lat: number;
  lng: number;
  isVerified: boolean;
  isOpen: boolean;
  status: VendorStatus;
  openingHours: string;
  closingHours: string;
  paymentMethods: string[];
  subscriptionTier: SubscriptionTier;
  phone: string;
  rating: number;
  reviewCount: number;
  distance?: number; // in km, computed client-side or from API
}

export interface Product {
  id: number;
  nameEnglish: string;
  nameHindi: string;
  defaultImage?: string;
  category: string;
}

export interface InventoryItem {
  id: number;
  vendorId: number;
  product: Product;
  customPhoto?: string;
  quantityKg: number;
  pricePerKg: number;
  qualityGrade: QualityGrade;
  isAvailable: boolean;
  discountPercent: number;
  createdAt: string;
  updatedAt: string;
  // Computed
  effectivePrice?: number;
}

export interface VendorDetail extends Vendor {
  inventory: InventoryItem[];
  reviews: Review[];
}

export interface Review {
  id: number;
  customerId: number;
  customerName: string;
  vendorId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  type: MessageType;
  createdAt?: string;
  // WebSocket fields
  senderName?: string;
  roomId?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NearbyVendorsRequest {
  lat: number;
  lng: number;
  radius: number; // in km
  product?: string;
  sort?: 'distance' | 'price' | 'rating' | 'freshness';
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  organicOnly?: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  phone?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
}

export interface OtpVerifyRequest {
  phone: string;
  otp: string;
}

export interface VendorOnboardRequest {
  shopName: string;
  address: string;
  lat: number;
  lng: number;
  openingHours: string;
  closingHours: string;
  paymentMethods: string[];
}

export interface InventoryRequest {
  productId?: number;
  productNameEnglish?: string;
  productNameHindi?: string;
  quantityKg: number;
  pricePerKg: number;
  qualityGrade: QualityGrade;
  discountPercent?: number;
}

export interface ProductIdentifyResponse {
  predictions: Array<{
    name: string;
    nameHindi: string;
    confidence: number;
    image: string;
    productId?: number;
  }>;
}

export interface DashboardStats {
  totalSalesToday: number;
  activeItems: number;
  totalViews: number;
  pendingRequests: number;
  weeklyRevenue: number[];
  topProducts: Array<{ name: string; count: number }>;
  peakHours: number[];
}

export interface ShoppingListItem {
  productName: string;
  quantityKg: number;
  vendors?: Vendor[];
}

export interface PriceAlert {
  id: number;
  customerId: number;
  productName: string;
  targetPrice: number;
  isActive: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}
