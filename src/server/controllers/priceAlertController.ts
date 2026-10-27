import type { Response } from 'express';
import { db } from '../db/storageEngine.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { enrichProduct } from './productController.js';
import type { PriceAlertDoc } from '../types.js';

interface HydratedPriceAlert extends PriceAlertDoc {
  product: ReturnType<typeof enrichProduct> | null;
  currentLowestPrice: number;
  isTargetReached: boolean;
  differenceToTarget: number;
}

const hydrateAlert = (alert: PriceAlertDoc): HydratedPriceAlert => {
  const rawProduct = db.products.find((p) => p._id === alert.productId);
  const product = rawProduct ? enrichProduct(rawProduct) : null;
  const currentLowestPrice = product ? product.lowestPrice : 0;
  const isTargetReached = currentLowestPrice > 0 && currentLowestPrice <= alert.targetPrice;
  const differenceToTarget = currentLowestPrice - alert.targetPrice;

  return {
    ...alert,
    product,
    currentLowestPrice,
    isTargetReached,
    differenceToTarget,
  };
};

export const getPriceAlerts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const now = new Date().toISOString();

    const alerts = db.priceAlerts.filter((a) => a.userId === userId);
    // Update lastEvaluatedAt
    alerts.forEach((a) => {
      a.lastEvaluatedAt = now;
    });
    db.save();

    const hydrated = alerts.map(hydrateAlert);

    res.status(200).json({
      success: true,
      message: 'Price alerts retrieved successfully.',
      data: { alerts: hydrated },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve price alerts.',
      errors: [(err as Error).message],
    });
  }
};

export const createPriceAlert = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId, targetPrice } = req.body;

    if (!productId || typeof targetPrice !== 'number' || targetPrice <= 0) {
      res.status(400).json({
        success: false,
        message: 'Product ID and a positive target price are required.',
      });
      return;
    }

    const product = db.products.find((p) => p._id === productId && p.isActive);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Check if alert already exists for this user and product
    const existing = db.priceAlerts.find((a) => a.userId === userId && a.productId === productId);
    const now = new Date().toISOString();

    if (existing) {
      existing.targetPrice = targetPrice;
      existing.isActive = true;
      existing.lastEvaluatedAt = now;
      existing.updatedAt = now;
      db.save();

      res.status(200).json({
        success: true,
        message: 'Existing price alert updated with new target.',
        data: { alert: hydrateAlert(existing) },
      });
      return;
    }

    const newAlert: PriceAlertDoc = {
      _id: 'alt_' + Date.now().toString(36),
      userId,
      productId,
      targetPrice,
      currency: '₹',
      isActive: true,
      lastEvaluatedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    db.priceAlerts.push(newAlert);
    db.save();

    res.status(201).json({
      success: true,
      message: 'Price alert set successfully.',
      data: { alert: hydrateAlert(newAlert) },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create price alert.',
      errors: [(err as Error).message],
    });
  }
};

export const updatePriceAlert = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const alert = db.priceAlerts.find((a) => a._id === id);

    if (!alert) {
      res.status(404).json({ success: false, message: 'Price alert not found.' });
      return;
    }

    if (alert.userId !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const { targetPrice, isActive } = req.body;
    if (typeof targetPrice === 'number' && targetPrice > 0) {
      alert.targetPrice = targetPrice;
    }
    if (isActive !== undefined) {
      alert.isActive = Boolean(isActive);
    }

    alert.lastEvaluatedAt = new Date().toISOString();
    alert.updatedAt = new Date().toISOString();
    db.save();

    res.status(200).json({
      success: true,
      message: 'Price alert updated.',
      data: { alert: hydrateAlert(alert) },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update price alert.',
      errors: [(err as Error).message],
    });
  }
};

export const deletePriceAlert = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const index = db.priceAlerts.findIndex((a) => a._id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Price alert not found.' });
      return;
    }

    const alert = db.priceAlerts[index];
    if (alert.userId !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    db.priceAlerts.splice(index, 1);
    db.save();

    res.status(200).json({
      success: true,
      message: 'Price alert deleted.',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete price alert.',
      errors: [(err as Error).message],
    });
  }
};
