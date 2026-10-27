import type { Request, Response } from 'express';
import { db } from '../db/storageEngine.js';
import { getMongoConnectionStatus } from '../config/db.js';
import { enrichProduct } from './productController.js';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalProducts = db.products.length;
    const totalActiveProducts = db.products.filter((p) => p.isActive).length;
    const totalUsers = db.users.length;
    const totalSellers = db.sellers.length;
    const totalOffers = db.offers.length;
    const totalWishlists = db.wishlists.length;
    const totalShoppingLists = db.shoppingLists.length;
    const totalPriceAlerts = db.priceAlerts.length;
    const totalCategories = db.categories.length;

    // Recent products
    const recentProducts = [...db.products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(enrichProduct);

    // Recent offers
    const recentOffers = [...db.offers]
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 6)
      .map((o) => {
        const product = db.products.find((p) => p._id === o.productId);
        const seller = db.sellers.find((s) => s._id === o.sellerId);
        return {
          ...o,
          productName: product?.name || 'Unknown Product',
          sellerName: seller?.name || o.sellerName || 'Verified Seller',
        };
      });

    // Calculate genuine aggregate savings
    let calculatedTotalSavings = 0;
    for (const prod of db.products) {
      const enriched = enrichProduct(prod);
      if (enriched.highestOriginalPrice && enriched.lowestPrice > 0) {
        calculatedTotalSavings += (enriched.highestOriginalPrice - enriched.lowestPrice);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard metrics calculated successfully.',
      data: {
        stats: {
          totalProducts,
          totalActiveProducts,
          totalUsers,
          totalSellers,
          totalOffers,
          totalCategories,
          totalWishlists,
          totalShoppingLists,
          totalPriceAlerts,
          calculatedCatalogPotentialSavings: calculatedTotalSavings,
          isMongoConnected: getMongoConnectionStatus(),
          databaseEngine: getMongoConnectionStatus() ? 'MongoDB Replica/Cluster' : 'Persistent Embedded JSON DB',
        },
        recentProducts,
        recentOffers,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard stats.',
      errors: [(err as Error).message],
    });
  }
};

export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    let users = db.users.map((u) => {
      const { passwordHash: _hash, ...safe } = u;
      return safe;
    });

    if (search && typeof search === 'string') {
      const query = search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const total = users.length;
    const paginated = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: { users: paginated },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
      errors: [(err as Error).message],
    });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Valid role ("user" or "admin") is required.' });
      return;
    }

    const user = db.users.find((u) => u._id === id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.role = role;
    user.updatedAt = new Date().toISOString();
    db.save();

    const { passwordHash: _hash, ...safe } = user;
    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user: safe },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      errors: [(err as Error).message],
    });
  }
};

export const resetDemoData = async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.resetAndSeed();
    res.status(200).json({
      success: true,
      message: 'Demo dataset successfully refreshed and reseeded with default data.',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset demo data.',
      errors: [(err as Error).message],
    });
  }
};
