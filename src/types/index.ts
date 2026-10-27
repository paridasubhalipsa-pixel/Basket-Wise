export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  productCount?: number;
}

export interface Seller {
  _id: string;
  name: string;
  slug: string;
  website: string;
  logo: string;
  rating?: number;
  deliveryDays?: string;
  isActive: boolean;
  activeOffersCount?: number;
}

export interface Offer {
  _id: string;
  productId: string;
  sellerId: string;
  sellerName?: string;
  seller?: Seller;
  price: number;
  currency: string;
  originalPrice?: number;
  productUrl: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  lastUpdated: string;
}

export interface PriceHistory {
  _id: string;
  productId: string;
  offerId?: string;
  sellerName: string;
  price: number;
  observedAt: string;
  dataSource: string;
  isVerified: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  lowestPrice: number;
  highestOriginalPrice?: number;
  maxDiscountPercent: number;
  lowestOfferSellerName?: string;
  offersCount: number;
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
}

export interface BasketItem {
  product: Product;
  quantity: number;
  selectedOffer: Offer;
}

export interface ShoppingListItem {
  productId: string;
  quantity: number;
  purchased: boolean;
  selectedSellerId?: string;
  product?: Product;
  bestOffer?: {
    sellerName: string;
    price: number;
  };
  itemSubtotal?: number;
}

export interface ShoppingList {
  _id: string;
  userId: string;
  name: string;
  items: ShoppingListItem[];
  estimatedTotal?: number;
  itemsCount?: number;
  purchasedCount?: number;
  completionPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlert {
  _id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  currency: string;
  isActive: boolean;
  lastEvaluatedAt: string;
  product?: Product;
  currentLowestPrice?: number;
  isTargetReached?: boolean;
  differenceToTarget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  errors?: string[];
}
