import type { Request, Response } from 'express';
import { db } from '../db/storageEngine.js';
import type { SellerDoc, OfferDoc } from '../types.js';

export const getSellers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sellers = db.sellers.map((s) => {
      const activeOffersCount = db.offers.filter(
        (o) => o.sellerId === s._id && o.availability !== 'out_of_stock'
      ).length;
      return {
        ...s,
        activeOffersCount,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Sellers retrieved successfully.',
      data: { sellers },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sellers.',
      errors: [(err as Error).message],
    });
  }
};

export const createSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, website, logo, rating, deliveryDays } = req.body;
    if (!name || !website) {
      res.status(400).json({ success: false, message: 'Seller name and website are required.' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();

    const newSeller: SellerDoc = {
      _id: 'sel_' + Date.now().toString(36),
      name: name.trim(),
      slug,
      website: website.trim(),
      logo: logo || '',
      rating: typeof rating === 'number' ? rating : 4.5,
      deliveryDays: deliveryDays || '2-3 Business Days',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    db.sellers.push(newSeller);
    db.save();

    res.status(201).json({
      success: true,
      message: 'Seller added successfully.',
      data: { seller: newSeller },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to add seller.',
      errors: [(err as Error).message],
    });
  }
};

export const updateSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const seller = db.sellers.find((s) => s._id === id);

    if (!seller) {
      res.status(404).json({ success: false, message: 'Seller not found.' });
      return;
    }

    const { name, website, logo, rating, deliveryDays, isActive } = req.body;
    if (name) seller.name = name.trim();
    if (website) seller.website = website.trim();
    if (logo !== undefined) seller.logo = logo;
    if (rating !== undefined) seller.rating = rating;
    if (deliveryDays !== undefined) seller.deliveryDays = deliveryDays;
    if (isActive !== undefined) seller.isActive = Boolean(isActive);

    seller.updatedAt = new Date().toISOString();
    db.save();

    res.status(200).json({
      success: true,
      message: 'Seller updated successfully.',
      data: { seller },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update seller.',
      errors: [(err as Error).message],
    });
  }
};

export const deleteSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = db.sellers.findIndex((s) => s._id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Seller not found.' });
      return;
    }

    db.sellers.splice(index, 1);
    db.save();

    res.status(200).json({
      success: true,
      message: 'Seller removed successfully.',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete seller.',
      errors: [(err as Error).message],
    });
  }
};

export const getProductOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const offers = db.offers
      .filter((o) => o.productId === id)
      .map((offer) => {
        const seller = db.sellers.find((s) => s._id === offer.sellerId);
        return {
          ...offer,
          seller,
        };
      })
      .sort((a, b) => a.price - b.price);

    res.status(200).json({
      success: true,
      message: 'Offers retrieved successfully.',
      data: { offers },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve offers.',
      errors: [(err as Error).message],
    });
  }
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, sellerId, price, originalPrice, productUrl, availability } = req.body;

    if (!productId || !sellerId || typeof price !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Product, seller, and numeric price are required.',
      });
      return;
    }

    const seller = db.sellers.find((s) => s._id === sellerId);
    const now = new Date().toISOString();

    const newOffer: OfferDoc = {
      _id: 'off_' + Date.now().toString(36),
      productId,
      sellerId,
      sellerName: seller?.name || 'Verified Seller',
      price: Math.max(0, price),
      originalPrice: originalPrice ? Math.max(price, originalPrice) : undefined,
      currency: '₹',
      productUrl: productUrl || '#',
      availability: availability || 'in_stock',
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
    };

    db.offers.push(newOffer);

    // Record observation in verified Price History
    db.priceHistories.push({
      _id: 'ph_' + Date.now().toString(36),
      productId,
      offerId: newOffer._id,
      sellerName: newOffer.sellerName || 'Verified Seller',
      price: newOffer.price,
      observedAt: now,
      dataSource: 'BasketWise Price Index (Verified Offer Update)',
      isVerified: true,
    });

    db.save();

    res.status(201).json({
      success: true,
      message: 'Seller offer added successfully.',
      data: { offer: newOffer },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create offer.',
      errors: [(err as Error).message],
    });
  }
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const offer = db.offers.find((o) => o._id === id);

    if (!offer) {
      res.status(404).json({ success: false, message: 'Offer not found.' });
      return;
    }

    const { price, originalPrice, productUrl, availability } = req.body;
    const now = new Date().toISOString();

    if (typeof price === 'number') {
      const oldPrice = offer.price;
      offer.price = Math.max(0, price);
      // If price changed, append to price history
      if (oldPrice !== offer.price) {
        db.priceHistories.push({
          _id: 'ph_' + Date.now().toString(36),
          productId: offer.productId,
          offerId: offer._id,
          sellerName: offer.sellerName || 'Verified Seller',
          price: offer.price,
          observedAt: now,
          dataSource: 'BasketWise Price Index (Price Revision)',
          isVerified: true,
        });
      }
    }

    if (originalPrice !== undefined) offer.originalPrice = originalPrice;
    if (productUrl !== undefined) offer.productUrl = productUrl;
    if (availability !== undefined) offer.availability = availability;

    offer.lastUpdated = now;
    offer.updatedAt = now;
    db.save();

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully.',
      data: { offer },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update offer.',
      errors: [(err as Error).message],
    });
  }
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = db.offers.findIndex((o) => o._id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Offer not found.' });
      return;
    }

    db.offers.splice(index, 1);
    db.save();

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully.',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete offer.',
      errors: [(err as Error).message],
    });
  }
};
