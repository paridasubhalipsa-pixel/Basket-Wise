export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDoc {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDoc {
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
  createdAt: string;
  updatedAt: string;
}

export interface SellerDoc {
  _id: string;
  name: string;
  slug: string;
  website: string;
  logo: string;
  rating?: number;
  deliveryDays?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfferDoc {
  _id: string;
  productId: string;
  sellerId: string;
  sellerName?: string;
  price: number;
  currency: string;
  originalPrice?: number;
  productUrl: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistoryDoc {
  _id: string;
  productId: string;
  offerId?: string;
  sellerName: string;
  price: number;
  observedAt: string;
  dataSource: string;
  isVerified: boolean;
}

export interface WishlistDoc {
  _id: string;
  userId: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  productId: string;
  quantity: number;
  purchased: boolean;
  selectedSellerId?: string;
}

export interface ShoppingListDoc {
  _id: string;
  userId: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlertDoc {
  _id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  currency: string;
  isActive: boolean;
  lastEvaluatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageDoc {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
