import type { Response } from 'express';
import { db } from '../db/storageEngine.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { enrichProduct } from './productController.js';
import type { ShoppingListDoc, ShoppingListItem } from '../types.js';

interface HydratedListItem extends ShoppingListItem {
  product: ReturnType<typeof enrichProduct> | null;
  bestOffer: {
    sellerName: string;
    price: number;
  } | null;
  itemSubtotal: number;
}

const hydrateList = (list: ShoppingListDoc) => {
  let estimatedTotal = 0;
  let purchasedCount = 0;

  const items: HydratedListItem[] = list.items.map((item) => {
    const rawProduct = db.products.find((p) => p._id === item.productId);
    const product = rawProduct ? enrichProduct(rawProduct) : null;

    let chosenPrice = product ? product.lowestPrice : 0;
    let chosenSeller = product?.lowestOfferSellerName || 'Best Offer';

    if (item.selectedSellerId && product) {
      const match = product.offers.find((o) => o.sellerId === item.selectedSellerId);
      if (match) {
        chosenPrice = match.price;
        chosenSeller = match.sellerName || 'Selected Seller';
      }
    }

    const itemSubtotal = chosenPrice * item.quantity;
    estimatedTotal += itemSubtotal;
    if (item.purchased) {
      purchasedCount++;
    }

    return {
      ...item,
      product,
      bestOffer: {
        sellerName: chosenSeller,
        price: chosenPrice,
      },
      itemSubtotal,
    };
  });

  const completionPercentage =
    list.items.length > 0 ? Math.round((purchasedCount / list.items.length) * 100) : 0;

  return {
    ...list,
    items,
    estimatedTotal,
    itemsCount: list.items.length,
    purchasedCount,
    completionPercentage,
  };
};

export const getShoppingLists = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const lists = db.shoppingLists.filter((l) => l.userId === userId);
    const hydratedLists = lists.map(hydrateList);

    res.status(200).json({
      success: true,
      message: 'Shopping lists retrieved successfully.',
      data: { lists: hydratedLists },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shopping lists.',
      errors: [(err as Error).message],
    });
  }
};

export const createShoppingList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { name, items = [] } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'A valid list name is required.' });
      return;
    }

    const now = new Date().toISOString();
    const newList: ShoppingListDoc = {
      _id: 'lst_' + Date.now().toString(36),
      userId,
      name: name.trim(),
      items: Array.isArray(items) ? items : [],
      createdAt: now,
      updatedAt: now,
    };

    db.shoppingLists.push(newList);
    db.save();

    res.status(201).json({
      success: true,
      message: 'Shopping list created successfully.',
      data: { list: hydrateList(newList) },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create shopping list.',
      errors: [(err as Error).message],
    });
  }
};

export const getShoppingListById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const list = db.shoppingLists.find((l) => l._id === id);
    if (!list) {
      res.status(404).json({ success: false, message: 'Shopping list not found.' });
      return;
    }

    if (list.userId !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied to this shopping list.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Shopping list retrieved successfully.',
      data: { list: hydrateList(list) },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get shopping list.',
      errors: [(err as Error).message],
    });
  }
};

export const updateShoppingList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const list = db.shoppingLists.find((l) => l._id === id);

    if (!list) {
      res.status(404).json({ success: false, message: 'Shopping list not found.' });
      return;
    }

    if (list.userId !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied to this shopping list.' });
      return;
    }

    const { name, items } = req.body;
    if (name) list.name = name.trim();
    if (Array.isArray(items)) {
      list.items = items.map((item) => ({
        productId: item.productId,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        purchased: Boolean(item.purchased),
        selectedSellerId: item.selectedSellerId,
      }));
    }

    list.updatedAt = new Date().toISOString();
    db.save();

    res.status(200).json({
      success: true,
      message: 'Shopping list updated successfully.',
      data: { list: hydrateList(list) },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update shopping list.',
      errors: [(err as Error).message],
    });
  }
};

export const deleteShoppingList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const index = db.shoppingLists.findIndex((l) => l._id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Shopping list not found.' });
      return;
    }

    const list = db.shoppingLists[index];
    if (list.userId !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    db.shoppingLists.splice(index, 1);
    db.save();

    res.status(200).json({
      success: true,
      message: 'Shopping list deleted successfully.',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete shopping list.',
      errors: [(err as Error).message],
    });
  }
};
