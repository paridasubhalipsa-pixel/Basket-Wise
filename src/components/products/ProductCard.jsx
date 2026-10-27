import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeftRight, ShoppingBag, Star, ImageOff } from 'lucide-react';
import { useShopping } from '../../context/ShoppingContext.jsx';

export const ProductCard = ({ product }) => {
  const { addToBasket, addToComparison, removeFromComparison, isInComparison, toggleWishlist, isInWishlist } =
    useShopping();
  const [imageError, setImageError] = useState(false);

  const inCompare = isInComparison(product._id);
  const inWishlist = isInWishlist(product._id);

  const primaryImage = product.images?.[0] || '';

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {!imageError && primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-400">
            <ImageOff className="w-8 h-8 mb-1 text-slate-300" />
            <span className="text-xs">{product.brand}</span>
          </div>
        )}

        {/* Quick action overlay buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {/* Wishlist toggle */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-2 rounded-lg backdrop-blur-md transition-colors shadow-xs ${
              inWishlist
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
            title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Compare toggle */}
          <button
            onClick={() => (inCompare ? removeFromComparison(product._id) : addToComparison(product))}
            className={`p-2 rounded-lg backdrop-blur-md transition-colors shadow-xs ${
              inCompare
                ? 'bg-emerald-600 text-white'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-emerald-600'
            }`}
            title={inCompare ? 'Remove from comparison' : 'Compare product'}
            aria-label="Compare"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Discount Badge */}
        {product.maxDiscountPercent > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-500 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
            Save {product.maxDiscountPercent}%
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean unboxed metadata with dot separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.categoryName || 'General'}</span>
            {product.averageRating > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5 text-slate-700">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{product.averageRating.toFixed(1)}</span>
                </span>
              </>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.slug || product._id}`}
            className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Lowest Seller Information */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div>
              <div className="text-xs text-slate-400 font-medium">Lowest available</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  ₹{product.lowestPrice.toLocaleString('en-IN')}
                </span>
                {product.highestOriginalPrice && product.highestOriginalPrice > product.lowestPrice && (
                  <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                    ₹{product.highestOriginalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {product.lowestOfferSellerName && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400">At seller</div>
                <div className="text-xs font-medium text-emerald-700 truncate max-w-[110px]">
                  {product.lowestOfferSellerName}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link
              to={`/products/${product.slug || product._id}`}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors"
            >
              Compare Sellers
            </Link>

            <button
              onClick={() => addToBasket(product)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Basket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
