import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import {
  getSellers,
  createSeller,
  updateSeller,
  deleteSeller,
  getProductOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/sellerOfferController.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import {
  getShoppingLists,
  createShoppingList,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
} from '../controllers/shoppingListController.js';
import {
  getPriceAlerts,
  createPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
} from '../controllers/priceAlertController.js';
import {
  getDashboardStats,
  getAdminUsers,
  updateUserRole,
  resetDemoData,
} from '../controllers/adminController.js';
import { submitContactMessage } from '../controllers/contactController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getMongoConnectionStatus } from '../config/db.js';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'BasketWise API Service is operational.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      isMongoConnected: getMongoConnectionStatus(),
      version: '1.0.0',
    },
  });
});

// Authentication routes
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/logout', logout);
apiRouter.get('/auth/me', getMe);
apiRouter.patch('/auth/change-password', requireAuth, changePassword);

// User Profile routes
apiRouter.get('/users/profile', requireAuth, getProfile);
apiRouter.patch('/users/profile', requireAuth, updateProfile);

// Product routes
apiRouter.get('/products', getProducts);
apiRouter.get('/products/:idOrSlug', getProductByIdOrSlug);
apiRouter.post('/products', requireAdmin, createProduct);
apiRouter.patch('/products/:id', requireAdmin, updateProduct);
apiRouter.delete('/products/:id', requireAdmin, deleteProduct);

// Category routes
apiRouter.get('/categories', getCategories);
apiRouter.post('/categories', requireAdmin, createCategory);
apiRouter.patch('/categories/:id', requireAdmin, updateCategory);
apiRouter.delete('/categories/:id', requireAdmin, deleteCategory);

// Sellers & Offers routes
apiRouter.get('/sellers', getSellers);
apiRouter.post('/sellers', requireAdmin, createSeller);
apiRouter.patch('/sellers/:id', requireAdmin, updateSeller);
apiRouter.delete('/sellers/:id', requireAdmin, deleteSeller);

apiRouter.get('/products/:id/offers', getProductOffers);
apiRouter.post('/offers', requireAdmin, createOffer);
apiRouter.patch('/offers/:id', requireAdmin, updateOffer);
apiRouter.delete('/offers/:id', requireAdmin, deleteOffer);

// Wishlist routes (Authenticated)
apiRouter.get('/wishlist', requireAuth, getWishlist);
apiRouter.post('/wishlist/items', requireAuth, addToWishlist);
apiRouter.delete('/wishlist/items/:productId', requireAuth, removeFromWishlist);

// Shopping Lists routes (Authenticated)
apiRouter.get('/shopping-lists', requireAuth, getShoppingLists);
apiRouter.post('/shopping-lists', requireAuth, createShoppingList);
apiRouter.get('/shopping-lists/:id', requireAuth, getShoppingListById);
apiRouter.patch('/shopping-lists/:id', requireAuth, updateShoppingList);
apiRouter.delete('/shopping-lists/:id', requireAuth, deleteShoppingList);

// Price Alerts routes (Authenticated)
apiRouter.get('/price-alerts', requireAuth, getPriceAlerts);
apiRouter.post('/price-alerts', requireAuth, createPriceAlert);
apiRouter.patch('/price-alerts/:id', requireAuth, updatePriceAlert);
apiRouter.delete('/price-alerts/:id', requireAuth, deletePriceAlert);

// Admin dashboard routes (Admin role)
apiRouter.get('/admin/dashboard', requireAdmin, getDashboardStats);
apiRouter.get('/admin/users', requireAdmin, getAdminUsers);
apiRouter.patch('/admin/users/:id/role', requireAdmin, updateUserRole);
apiRouter.post('/admin/reset-demo', requireAdmin, resetDemoData);

// Contact message route
apiRouter.post('/contact', submitContactMessage);
