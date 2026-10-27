import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  Trash2,
  Star,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react';
import { useShopping } from '../context/ShoppingContext.jsx';
import { api } from '../services/api.js';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const CompareProducts = () => {
  const { comparisonProducts, removeFromComparison, clearComparison, addToBasket, addToComparison } = useShopping();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState('');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await api.get('/products', { limit: 50 });
        if (res.success) {
          setAllProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error loading catalog for compare:', err);
      }
    };
    loadCatalog();
  }, []);

  const handleAddProduct = () => {
    if (!selectedToAdd) return;
    const prod = allProducts.find((p) => p._id === selectedToAdd);
    if (prod) {
      addToComparison(prod);
      setSelectedToAdd('');
    }
  };

  const lowestOverallPrice =
    comparisonProducts.length > 0
      ? Math.min(...comparisonProducts.map((p) => p.lowestPrice))
      : 0;

  const allSpecKeys = Array.from(
    new Set(
      comparisonProducts.flatMap((p) =>
        p.specifications ? Object.keys(p.specifications) : []
      )
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header and Quick Add */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-emerald-600" />
            <span>Product Comparison Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare prices, retailer offers, and technical specifications across up to 4 items
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Add Product Dropdown */}
          {comparisonProducts.length < 4 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className="py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 max-w-[220px] truncate"
              >
                <option value="">+ Add Product to Compare...</option>
                {allProducts
                  .filter((p) => !comparisonProducts.some((cp) => cp._id === p._id))
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
              </select>

              <button
                disabled={!selectedToAdd}
                onClick={handleAddProduct}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                Add
              </button>
            </div>
          )}

          {comparisonProducts.length > 0 && (
            <button
              onClick={clearComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Workspace</span>
            </button>
          )}
        </div>
      </div>

      {comparisonProducts.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Comparison workspace is empty"
          description="Add at least two products to inspect side-by-side technical differences, customer ratings, and current market offers."
          actionLabel="Browse Products to Compare"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <div className="space-y-6">
          {comparisonProducts.length === 1 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have 1 product in your comparison. Add at least one more product to compare specs and pricing side-by-side.
              </span>
            </div>
          )}

          {/* Comparison Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48 min-w-[180px]">
                    Product
                  </th>
                  {comparisonProducts.map((product) => {
                    const isLowest = product.lowestPrice === lowestOverallPrice;
                    return (
                      <th
                        key={product._id}
                        className={`p-4 min-w-[260px] max-w-[320px] align-top ${
                          isLowest ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="flex flex-col h-full justify-between space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-500">{product.brand}</span>
                            <button
                              onClick={() => removeFromComparison(product._id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Remove from comparison"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="aspect-4/3 w-full bg-slate-100 rounded-lg overflow-hidden">
                            <img
                              src={product.images?.[0] || ''}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <Link
                            to={`/products/${product.slug || product._id}`}
                            className="text-xs font-semibold text-slate-900 hover:text-emerald-600 line-clamp-2"
                          >
                            {product.name}
                          </Link>

                          {/* Lowest offer callout */}
                          <div className="pt-2 border-t border-slate-200">
                            <div className="text-[11px] text-slate-500">Lowest Verified Offer</div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                                ₹{product.lowestPrice.toLocaleString('en-IN')}
                              </span>
                              {isLowest && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Lowest
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              at {product.lowestOfferSellerName || 'Verified Seller'}
                            </div>
                          </div>

                          <button
                            onClick={() => addToBasket(product)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Basket</span>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Brand */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/40">Brand</td>
                  {comparisonProducts.map((p) => (
                    <td key={p._id} className="p-4 text-slate-800 font-medium">
                      {p.brand}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/40">Category</td>
                  {comparisonProducts.map((p) => (
                    <td key={p._id} className="p-4 text-slate-600">
                      {p.categoryName || 'General'}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/40">Customer Rating</td>
                  {comparisonProducts.map((p) => (
                    <td key={p._id} className="p-4 text-slate-800">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{p.averageRating.toFixed(1)}</span>
                        <span className="text-slate-400">({p.reviewCount})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Sellers Available */}
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/40">Available Sellers</td>
                  {comparisonProducts.map((p) => (
                    <td key={p._id} className="p-4 text-slate-700 font-mono">
                      {p.offers?.length || 1} sellers competing
                    </td>
                  ))}
                </tr>

                {/* Technical Specifications Comparison */}
                <tr className="bg-slate-100/60 font-bold text-slate-800">
                  <td colSpan={comparisonProducts.length + 1} className="py-2.5 px-4 text-xs uppercase tracking-wider">
                    Specification Attributes
                  </td>
                </tr>

                {allSpecKeys.map((specKey) => (
                  <tr key={specKey}>
                    <td className="p-4 font-semibold text-slate-700 bg-slate-50/40">{specKey}</td>
                    {comparisonProducts.map((p) => {
                      const specVal = p.specifications?.[specKey];
                      return (
                        <td key={p._id} className="p-4 text-slate-600 font-mono">
                          {specVal || <span className="text-slate-300">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
