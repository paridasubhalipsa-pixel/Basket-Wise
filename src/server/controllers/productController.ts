import type { Request, Response } from 'express';
import { db } from '../db/storageEngine.js';
import type { ProductDoc, OfferDoc } from '../types.js';

interface EnrichedProduct extends ProductDoc {
  lowestPrice: number;
  highestOriginalPrice?: number;
  maxDiscountPercent: number;
  lowestOfferSellerName?: string;
  offersCount: number;
  offers: OfferDoc[];
}

export const enrichProduct = (product: ProductDoc): EnrichedProduct => {
  const offers = db.offers.filter((o) => o.productId === product._id && o.availability !== 'out_of_stock');
  
  let lowestPrice = Infinity;
  let highestOriginalPrice = 0;
  let lowestOfferSellerName = '';
  let maxDiscountPercent = 0;

  for (const offer of offers) {
    if (offer.price < lowestPrice) {
      lowestPrice = offer.price;
      lowestOfferSellerName = offer.sellerName || '';
    }
    if (offer.originalPrice && offer.originalPrice > highestOriginalPrice) {
      highestOriginalPrice = offer.originalPrice;
    }
    if (offer.originalPrice && offer.originalPrice > offer.price) {
      const discount = Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100);
      if (discount > maxDiscountPercent) {
        maxDiscountPercent = discount;
      }
    }
  }

  if (lowestPrice === Infinity) {
    lowestPrice = 0;
  }

  return {
    ...product,
    lowestPrice,
    highestOriginalPrice: highestOriginalPrice || undefined,
    maxDiscountPercent,
    lowestOfferSellerName,
    offersCount: offers.length,
    offers,
  };
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      sort = 'lowest_price',
      page = '1',
      limit = '12',
      featured,
    } = req.query;

    let products = db.products.filter((p) => p.isActive);

    // Keyword Search
    if (search && typeof search === 'string' && search.trim()) {
      const query = search.trim().toLowerCase();
      products = products.filter((p) => {
        return (
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(query)) ||
          p.description.toLowerCase().includes(query)
        );
      });
    }

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(
        (p) => p.categoryId === category || p.categoryName?.toLowerCase() === category.toLowerCase()
      );
    }

    // Brand filter
    if (brand && typeof brand === 'string' && brand !== 'all') {
      const brandsList = (brand as string).split(',').map((b) => b.trim().toLowerCase());
      products = products.filter((p) => brandsList.includes(p.brand.toLowerCase()));
    }

    // Min Rating filter
    if (minRating) {
      const ratingVal = parseFloat(minRating as string);
      if (!isNaN(ratingVal)) {
        products = products.filter((p) => p.averageRating >= ratingVal);
      }
    }

    // Enrich products with offers & lowest prices
    let enriched = products.map(enrichProduct);

    // Price range filters
    if (minPrice) {
      const minVal = parseFloat(minPrice as string);
      if (!isNaN(minVal)) {
        enriched = enriched.filter((p) => p.lowestPrice >= minVal);
      }
    }

    if (maxPrice) {
      const maxVal = parseFloat(maxPrice as string);
      if (!isNaN(maxVal)) {
        enriched = enriched.filter((p) => p.lowestPrice <= maxVal);
      }
    }

    // Discount filter
    if (minDiscount) {
      const discountVal = parseFloat(minDiscount as string);
      if (!isNaN(discountVal)) {
        enriched = enriched.filter((p) => p.maxDiscountPercent >= discountVal);
      }
    }

    // Featured / Deal filter
    if (featured === 'deals') {
      enriched = enriched.filter((p) => p.maxDiscountPercent > 10);
    }

    // Sorting
    enriched.sort((a, b) => {
      switch (sort) {
        case 'lowest_price':
        case 'price_asc':
          return a.lowestPrice - b.lowestPrice;
        case 'highest_price':
        case 'price_desc':
          return b.lowestPrice - a.lowestPrice;
        case 'highest_discount':
        case 'discount_desc':
          return b.maxDiscountPercent - a.maxDiscountPercent;
        case 'rating_desc':
          return b.averageRating - a.averageRating;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
    const totalCount = enriched.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = enriched.slice(startIndex, startIndex + limitNum);

    // Available brands and categories for dynamic filter options
    const allBrands = Array.from(new Set(db.products.map((p) => p.brand))).sort();
    const categories = db.categories.filter((c) => c.isActive);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully.',
      data: {
        products: paginatedProducts,
        filters: {
          categories,
          brands: allBrands,
          totalAvailable: totalCount,
        },
      },
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      errors: [(err as Error).message],
    });
  }
};

export const getProductByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const product = db.products.find(
      (p) => (p._id === idOrSlug || p.slug === idOrSlug) && p.isActive
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
        errors: ['Invalid product identifier'],
      });
      return;
    }

    const enriched = enrichProduct(product);

    // Load detailed offers with seller data
    const offers = db.offers
      .filter((o) => o.productId === product._id)
      .map((offer) => {
        const seller = db.sellers.find((s) => s._id === offer.sellerId);
        return {
          ...offer,
          seller: seller || {
            _id: offer.sellerId,
            name: offer.sellerName || 'Verified Seller',
            slug: 'verified-seller',
            website: '#',
            logo: '',
            rating: 4.5,
            deliveryDays: 'Standard Delivery',
            isActive: true,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
          },
        };
      })
      .sort((a, b) => a.price - b.price); // Lowest first

    // Load price history observations
    const priceHistory = db.priceHistories
      .filter((ph) => ph.productId === product._id)
      .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());

    // Related products in same category
    const related = db.products
      .filter((p) => p._id !== product._id && p.categoryId === product.categoryId && p.isActive)
      .slice(0, 4)
      .map(enrichProduct);

    res.status(200).json({
      success: true,
      message: 'Product details retrieved successfully.',
      data: {
        product: enriched,
        offers,
        priceHistory,
        related,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details.',
      errors: [(err as Error).message],
    });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, brand, categoryId, description, specifications, images } = req.body;

    if (!name || !brand || !categoryId) {
      res.status(400).json({
        success: false,
        message: 'Name, brand, and category are required.',
      });
      return;
    }

    const category = db.categories.find((c) => c._id === categoryId);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();

    const newProduct: ProductDoc = {
      _id: 'prd_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      slug,
      brand: brand.trim(),
      categoryId,
      categoryName: category?.name || 'General',
      description: description || '',
      specifications: specifications || {},
      images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/product_anc_headphones_1792656374452.jpg'],
      averageRating: 4.5,
      reviewCount: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    db.products.push(newProduct);
    db.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product: enrichProduct(newProduct) },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product.',
      errors: [(err as Error).message],
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = db.products.find((p) => p._id === id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const { name, brand, categoryId, description, specifications, images, isActive } = req.body;

    if (name) {
      product.name = name.trim();
      product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (brand) product.brand = brand.trim();
    if (categoryId) {
      product.categoryId = categoryId;
      const cat = db.categories.find((c) => c._id === categoryId);
      if (cat) product.categoryName = cat.name;
    }
    if (description !== undefined) product.description = description;
    if (specifications !== undefined) product.specifications = specifications;
    if (images !== undefined) product.images = images;
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    product.updatedAt = new Date().toISOString();
    db.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product: enrichProduct(product) },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product.',
      errors: [(err as Error).message],
    });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p._id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Soft delete or remove
    db.products.splice(index, 1);
    db.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      errors: [(err as Error).message],
    });
  }
};
