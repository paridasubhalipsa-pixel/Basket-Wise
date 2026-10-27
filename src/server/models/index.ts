import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

export const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Product Schema
export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  categoryId: Schema.Types.ObjectId;
  description: string;
  specifications: Map<string, string>;
  images: string[];
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
}

export const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, default: '' },
    specifications: { type: Map, of: String, default: {} },
    images: { type: [String], default: [] },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });

// Seller Schema
export interface ISeller extends Document {
  name: string;
  slug: string;
  website: string;
  logo: string;
  rating?: number;
  deliveryDays?: string;
  isActive: boolean;
}

export const SellerSchema = new Schema<ISeller>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    website: { type: String, required: true },
    logo: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    deliveryDays: { type: String, default: '2-3 Business Days' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Offer Schema
export interface IOffer extends Document {
  productId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  price: number;
  currency: string;
  originalPrice?: number;
  productUrl: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  lastUpdated: Date;
}

export const OfferSchema = new Schema<IOffer>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: '₹' },
    originalPrice: { type: Number, min: 0 },
    productUrl: { type: String, required: true },
    availability: { type: String, enum: ['in_stock', 'out_of_stock', 'limited'], default: 'in_stock' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
OfferSchema.index({ productId: 1, price: 1 });

// PriceHistory Schema
export interface IPriceHistory extends Document {
  productId: Schema.Types.ObjectId;
  offerId?: Schema.Types.ObjectId;
  sellerName: string;
  price: number;
  observedAt: Date;
  dataSource: string;
  isVerified: boolean;
}

export const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    offerId: { type: Schema.Types.ObjectId, ref: 'Offer' },
    sellerName: { type: String, required: true },
    price: { type: Number, required: true },
    observedAt: { type: Date, default: Date.now },
    dataSource: { type: String, default: 'BasketWise Price Index (Demo Verified)' },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Wishlist Schema
export interface IWishlist extends Document {
  userId: Schema.Types.ObjectId;
  products: Schema.Types.ObjectId[];
}

export const WishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// ShoppingList Schema
export interface IShoppingList extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  items: Array<{
    productId: Schema.Types.ObjectId;
    quantity: number;
    purchased: boolean;
    selectedSellerId?: Schema.Types.ObjectId;
  }>;
}

export const ShoppingListSchema = new Schema<IShoppingList>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, min: 1 },
        purchased: { type: Boolean, default: false },
        selectedSellerId: { type: Schema.Types.ObjectId, ref: 'Seller' },
      },
    ],
  },
  { timestamps: true }
);

// PriceAlert Schema
export interface IPriceAlert extends Document {
  userId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  targetPrice: number;
  currency: string;
  isActive: boolean;
  lastEvaluatedAt: Date;
}

export const PriceAlertSchema = new Schema<IPriceAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    targetPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: '₹' },
    isActive: { type: Boolean, default: true },
    lastEvaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ContactMessage Schema
export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const SellerModel = mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);
export const OfferModel = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);
export const PriceHistoryModel = mongoose.models.PriceHistory || mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);
export const WishlistModel = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
export const ShoppingListModel = mongoose.models.ShoppingList || mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchema);
export const PriceAlertModel = mongoose.models.PriceAlert || mongoose.model<IPriceAlert>('PriceAlert', PriceAlertSchema);
export const ContactMessageModel = mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
