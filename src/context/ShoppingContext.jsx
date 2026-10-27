import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const ShoppingContext = createContext(undefined);

export const ShoppingProvider = ({ children }) => {
  const { user } = useAuth();

  // Basket State (persisted in localStorage for convenience)
  const [basket, setBasket] = useState(() => {
    try {
      const stored = localStorage.getItem('bw_basket');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Comparison State (persisted in localStorage)
  const [comparisonProducts, setComparisonProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('bw_compare');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Wishlist State (synced from API for authenticated users)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync basket to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bw_basket', JSON.stringify(basket));
    } catch {
      // ignore
    }
  }, [basket]);

  // Sync comparison to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bw_compare', JSON.stringify(comparisonProducts));
    } catch {
      // ignore
    }
  }, [comparisonProducts]);

  // Load wishlist when user logs in
  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      if (res.success && res.data.wishlist) {
        setWishlistIds(res.data.wishlist.productIds || []);
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Basket handlers
  const addToBasket = (product, selectedOffer, quantity = 1) => {
    const offerToUse =
      selectedOffer ||
      product.offers?.find((o) => o.price === product.lowestPrice) ||
      product.offers?.[0] || {
        _id: 'off_default',
        productId: product._id,
        sellerId: 'sel_default',
        sellerName: product.lowestOfferSellerName || 'Verified Seller',
        price: product.lowestPrice,
        currency: '₹',
        productUrl: '#',
        availability: 'in_stock',
        lastUpdated: new Date().toISOString(),
      };

    setBasket((prev) => {
      const existingIndex = prev.findIndex((item) => item.product._id === product._id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          selectedOffer: offerToUse,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedOffer: offerToUse }];
    });

    showToast(`Added "${product.name.slice(0, 32)}..." to your Basket`, 'success');
  };

  const updateBasketQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromBasket(productId);
      return;
    }
    setBasket((prev) =>
      prev.map((item) => (item.product._id === productId ? { ...item, quantity } : item))
    );
  };

  const updateBasketOffer = (productId, offer) => {
    setBasket((prev) =>
      prev.map((item) => (item.product._id === productId ? { ...item, selectedOffer: offer } : item))
    );
    showToast(`Selected ${offer.sellerName} (₹${offer.price.toLocaleString('en-IN')}) for this item.`, 'info');
  };

  const removeFromBasket = (productId) => {
    setBasket((prev) => prev.filter((item) => item.product._id !== productId));
    showToast('Item removed from basket.', 'info');
  };

  const clearBasket = () => {
    setBasket([]);
    showToast('Basket cleared.', 'info');
  };

  // Calculations
  const basketTotal = basket.reduce(
    (sum, item) => sum + item.selectedOffer.price * item.quantity,
    0
  );

  const referenceTotal = basket.reduce((sum, item) => {
    const orig = item.selectedOffer.originalPrice || item.product.highestOriginalPrice || item.selectedOffer.price;
    return sum + orig * item.quantity;
  }, 0);

  const estimatedSavings = Math.max(0, referenceTotal - basketTotal);

  const basketItemsCount = basket.reduce((count, item) => count + item.quantity, 0);

  const saveBasketToShoppingList = async (name) => {
    if (!user) {
      showToast('Please sign in to save your basket as a shopping list.', 'error');
      return false;
    }

    if (basket.length === 0) {
      showToast('Your basket is empty.', 'error');
      return false;
    }

    try {
      const items = basket.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        purchased: false,
        selectedSellerId: item.selectedOffer.sellerId,
      }));

      const res = await api.post('/shopping-lists', { name, items });
      if (res.success) {
        showToast(`Saved basket as "${name}" shopping list!`, 'success');
        return true;
      }
      showToast(res.message || 'Failed to save shopping list.', 'error');
      return false;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Comparison handlers
  const addToComparison = (product) => {
    if (comparisonProducts.some((p) => p._id === product._id)) {
      showToast('Product is already in your comparison workspace.', 'info');
      return;
    }

    if (comparisonProducts.length >= 4) {
      showToast('You can compare up to 4 products at once. Remove one to add another.', 'info');
      return;
    }

    setComparisonProducts((prev) => [...prev, product]);
    showToast(`Added "${product.name.slice(0, 28)}..." to Compare Workspace`, 'success');
  };

  const removeFromComparison = (productId) => {
    setComparisonProducts((prev) => prev.filter((p) => p._id !== productId));
    showToast('Removed product from comparison.', 'info');
  };

  const clearComparison = () => {
    setComparisonProducts([]);
    showToast('Comparison workspace cleared.', 'info');
  };

  const isInComparison = (productId) => {
    return comparisonProducts.some((p) => p._id === productId);
  };

  // Wishlist handlers
  const isInWishlist = (productId) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      showToast('Please sign in to add items to your Wishlist.', 'info');
      return false;
    }

    const alreadyIn = isInWishlist(product._id);
    try {
      if (alreadyIn) {
        const res = await api.delete(`/wishlist/items/${product._id}`);
        if (res.success) {
          setWishlistIds((prev) => prev.filter((id) => id !== product._id));
          showToast(`Removed "${product.name.slice(0, 28)}..." from Wishlist`, 'info');
          return true;
        }
      } else {
        const res = await api.post('/wishlist/items', { productId: product._id });
        if (res.success) {
          setWishlistIds((prev) => [...prev, product._id]);
          showToast(`Added "${product.name.slice(0, 28)}..." to Wishlist`, 'success');
          return true;
        }
      }
      return false;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  return (
    <ShoppingContext.Provider
      value={{
        basket,
        addToBasket,
        updateBasketQuantity,
        updateBasketOffer,
        removeFromBasket,
        clearBasket,
        basketTotal,
        referenceTotal,
        estimatedSavings,
        basketItemsCount,
        saveBasketToShoppingList,
        comparisonProducts,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        loadWishlist,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShopping must be used within a ShoppingProvider');
  }
  return context;
};
