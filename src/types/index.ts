// Shared TypeScript types used across frontend & backend.
// Keeping these in sync makes future mobile app integration easier.

export type Category = 'Child' | 'Women' | 'Islamic';
export type ProductType = 'abaya' | 'hijab' | 'cap' | 'frock' | 'set' | 'other';
export type Occasion = 'daily' | 'wedding' | 'eid' | 'prayer' | 'school' | 'gift' | 'travel';
export type SuitableFor = 'women' | 'kids';

export interface IReview {
  _id?: string;
  name: string;
  comment: string;
  rating: number;
  ipAddress?: string;
  createdAt: string | Date;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  videoUrl?: string;
  category: Category;
  productType?: ProductType;
  occasions?: Occasion[];
  tags?: string[];
  suitableFor?: SuitableFor[];
  ageGroup?: string[];
  matchingItems?: string[];
  stock: number;
  reviews: IReview[];
  averageRating: number;
  numReviews: number;
  isFeatured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  products: IOrderProduct[];
  totalAmount: number;
  paymentMethod: 'easypaisa' | 'cod';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
