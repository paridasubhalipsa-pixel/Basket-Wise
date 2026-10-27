import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ArrowLeftRight,
  ShoppingBag,
  Star,
  ChevronRight,
  Bell,
  ImageOff,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useShopping } from '../context/ShoppingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SellerOffersTable } from '../components/products/SellerOffersTable.jsx';
import { PriceHistoryChart } from '../components/products/PriceHistoryChart.jsx';
import { ProductCard } from '../components/products/ProductCard.jsx';

export const ProductDetails = () => {
  const { idOrSlug } = useParams();
  const { user } = useAuth();
  const { addToBasket, addToComparison, removeFromComparison, isInComparison, toggleWishlist, isInWishlist, showToast } =
    useShopping();

  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [targetAlertPrice, setTargetAlertPrice] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!idOrSlug) return;
      try {
        setLoading(true);
        const res = await api.get(`/products/${idOrSlug}`);

        if (res.success) {
          setProduct(res.data.product);
          setOffers(res.data.offers);
          setPriceHistory(res.data.priceHistory);
          setRelated(res.data.related);
          if (res.data.product.lowestPrice) {
            setTargetAlertPrice(Math.round(res.data.product.lowestPrice * 0.95)); // 5% below lowest
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrSlug]);

  const handleCreatePriceAlert = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to configure target price alerts.', 'info');
      return;
    }

    if (!targetAlertPrice || targetAlertPrice <= 0 || !product) {
      showToast('Please enter a valid target price.', 'error');
      return;
    }

    try {
      const res = await api.post('/price-alerts', {
        productId: product._id,
        targetPrice: Number(targetAlertPrice),
      });

      if (res.success) {
        showToast(`Target price alert set for ₹${Number(targetAlertPrice).toLocaleString('en-IN')}`, 'success');
        setShowAlertModal(false);
      } else {
        showToast(res.message || 'Failed to create alert.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="w-48 h-4 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 aspect-4/3 bg-slate-200 rounded-xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="w-3/4 h-8 bg-slate-200 rounded" />
            <div className="w-1/2 h-6 bg-slate-200 rounded" />
            <div className="w-full h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested product could not be located in our verified catalog.
        </p>
        <Link
          to="/products"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const inCompare = isInComparison(product._id);
  const inWishlist = isInWishlist(product._id);
  const primaryImage = product.images?.[0] || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/products" className="hover:text-slate-900 transition-colors">
          Products
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 w-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {!imageError && primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400">
                <ImageOff className="w-12 h-12 mb-2 text-slate-300" />
                <span className="text-sm font-medium">{product.brand}</span>
              </div>
            )}

            {product.maxDiscountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                Save {product.maxDiscountPercent}% vs Retail MSRP
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase & Specification Module */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand & Category Unboxed Header */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-slate-900 font-semibold">{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>{product.categoryName || 'General'}</span>
              {product.averageRating > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 text-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
                    <span className="text-slate-400">({product.reviewCount} verified reviews)</span>
                  </div>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Lowest verified marketplace offer</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                    ₹{product.lowestPrice.toLocaleString('en-IN')}
                  </span>
                  {product.highestOriginalPrice && product.highestOriginalPrice > product.lowestPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                      ₹{product.highestOriginalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {product.lowestOfferSellerName && (
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Lowest price at</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {product.lowestOfferSellerName}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => addToBasket(product)}
                className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Lowest Offer to Basket</span>
              </button>

              <button
                onClick={() => (inCompare ? removeFromComparison(product._id) : addToComparison(product))}
                className={`flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl border transition-colors ${
                  inCompare
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{inCompare ? 'In Comparison Workspace' : 'Add to Compare'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1 text-xs">
              <button
                onClick={() => toggleWishlist(product)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>{inWishlist ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>

              <button
                onClick={() => setShowAlertModal(true)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-medium"
              >
                <Bell className="w-4 h-4 text-slate-400" />
                <span>Set Price Drop Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Comparison Section */}
      <section className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Seller Price Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your preferred retailer by price, delivery terms, or merchant trust rating
            </p>
          </div>
        </div>

        <SellerOffersTable product={product} offers={offers} />
      </section>

      {/* Technical Specifications Matrix */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="space-y-4 pt-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Technical Specifications
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(product.specifications).map(([key, val], idx) => (
                <div
                  key={key}
                  className={`grid grid-cols-1 sm:grid-cols-3 py-3 px-5 ${
                    idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <span className="font-semibold text-slate-700">{key}</span>
                  <span className="sm:col-span-2 text-slate-600 font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Verified Price History Observations */}
      <section className="space-y-4 pt-6">
        <PriceHistoryChart priceHistory={priceHistory} currentPrice={product.lowestPrice} />
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Related in {product.categoryName}
            </h2>
            <Link
              to={`/products?category=${product.categoryId}`}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View More in Category
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Create Target Price Alert
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              We will evaluate active retailer offers and notify your account dashboard as soon as verified offers meet or drop below your target.
            </p>

            <form onSubmit={handleCreatePriceAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product
                </label>
                <div className="text-xs font-medium text-slate-900 bg-slate-100 p-2.5 rounded-lg">
                  {product.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Lowest Price
                </label>
                <div className="text-sm font-mono font-bold text-emerald-600 bg-slate-50 p-2 rounded-lg">
                  ₹{product.lowestPrice.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Target Alert Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={targetAlertPrice}
                  onChange={(e) => setTargetAlertPrice(Number(e.target.value))}
                  placeholder="e.g. 24000"
                  className="w-full py-2 px-3 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
