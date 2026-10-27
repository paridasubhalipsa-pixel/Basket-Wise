import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShopping } from '../context/ShoppingContext.jsx';
import { api } from '../services/api.js';
import { ProductCard } from '../components/products/ProductCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistIds, addToBasket } = useShopping();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get('/wishlist');
        if (res.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [user, wishlistIds]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to Access Your Wishlist</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Track saved products, observe price drop trends, and save items across your sessions.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>My Saved Wishlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {products.length} {products.length === 1 ? 'product' : 'products'} saved with live lowest marketplace pricing
          </p>
        </div>

        {products.length > 0 && (
          <button
            onClick={() => {
              products.forEach((p) => addToBasket(p));
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All to Basket</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Click the heart icon on any product in the catalog to save it here for tracking."
          actionLabel="Browse Products"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
