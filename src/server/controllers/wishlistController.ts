import type { Response } from 'express';
import { db } from '../db/storageEngine.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { enrichProduct } from './productController.js';
import type { WishlistDoc } from '../types.js';

export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    let wishlist = db.wishlists.find((w) => w.userId === userId);

    if (!wishlist) {
      const now = new Date().toISOString();
      wishlist = {
        _id: 'wsh_' + Date.now().toString(36),
        userId,
        productIds: [],
        createdAt: now,
        updatedAt: now,
      };
      db.wishlists.push(wishlist);
      db.save();
    }

    const products = wishlist.productIds
      .map((id) => db.products.find((p) => p._id === id && p.isActive))
      .filter(Boolean)
      .map((p) => enrichProduct(p!));

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully.',
      data: {
        wishlist,
        products,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist.',
      errors: [(err as Error).message],
    });
  }
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const productExists = db.products.some((p) => p._id === productId && p.isActive);
    if (!productExists) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    let wishlist = db.wishlists.find((w) => w.userId === userId);
    const now = new Date().toISOString();

    if (!wishlist) {
      wishlist = {
        _id: 'wsh_' + Date.now().toString(36),
        userId,
        productIds: [productId],
        createdAt: now,
        updatedAt: now,
      };
      db.wishlists.push(wishlist);
    } else {
      if (!wishlist.productIds.includes(productId)) {
        wishlist.productIds.push(productId);
        wishlist.updatedAt = now;
      }
    }

    db.save();

    const products = wishlist.productIds
      .map((id) => db.products.find((p) => p._id === id && p.isActive))
      .filter(Boolean)
      .map((p) => enrichProduct(p!));

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist.',
      data: { wishlist, products },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist.',
      errors: [(err as Error).message],
    });
  }
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.params;

    const wishlist = db.wishlists.find((w) => w.userId === userId);
    if (!wishlist) {
      res.status(200).json({
        success: true,
        message: 'Wishlist is empty.',
        data: { products: [] },
      });
      return;
    }

    wishlist.productIds = wishlist.productIds.filter((id) => id !== productId);
    wishlist.updatedAt = new Date().toISOString();
    db.save();

    const products = wishlist.productIds
      .map((id) => db.products.find((p) => p._id === id && p.isActive))
      .filter(Boolean)
      .map((p) => enrichProduct(p!));

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
      data: { wishlist, products },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist.',
      errors: [(err as Error).message],
    });
  }
};
