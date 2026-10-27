import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Save,
  Sparkles,
} from 'lucide-react';
import { useShopping } from '../context/ShoppingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ConfirmModal } from '../components/common/ConfirmModal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const BasketCalculator = () => {
  const { user } = useAuth();
  const {
    basket,
    updateBasketQuantity,
    updateBasketOffer,
    removeFromBasket,
    clearBasket,
    basketTotal,
    referenceTotal,
    estimatedSavings,
    saveBasketToShoppingList,
  } = useShopping();

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [saveListModalOpen, setSaveListModalOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [savingList, setSavingList] = useState(false);

  const handleSaveList = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;
    setSavingList(true);
    const success = await saveBasketToShoppingList(listName.trim());
    setSavingList(false);
    if (success) {
      setSaveListModalOpen(false);
      setListName('');
    }
  };

  const allSellersInBasket = Array.from(
    new Set(
      basket.flatMap((item) => item.product.offers?.map((o) => o.sellerName || 'Verified Seller') || [])
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <span>Shopping Basket Calculator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Optimize your multi-item cart across different sellers to maximize cumulative savings
          </p>
        </div>

        {basket.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setListName(`Planned Basket (${new Date().toLocaleDateString('en-IN')})`);
                setSaveListModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save to Shopping List</span>
            </button>

            <button
              onClick={() => setClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {basket.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping basket is empty"
          description="Add electronics, kitchen gear, or wearables to calculate real seller price variances and plan your lowest-cost basket."
          actionLabel="Explore Products Catalog"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Basket Items */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
              {basket.map((item) => {
                const itemTotal = item.selectedOffer.price * item.quantity;
                const availableOffers = item.product.offers || [];

                return (
                  <div key={item.product._id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
                    {/* Item Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={item.product.images?.[0] || ''}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details and Seller Selection */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {item.product.brand}
                          </span>
                          <Link
                            to={`/products/${item.product.slug || item.product._id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-emerald-600 block line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                        </div>

                        <button
                          onClick={() => removeFromBasket(item.product._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Interactive Seller Offer Switcher */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="text-slate-500 font-medium">Selected Seller:</span>
                        <select
                          value={item.selectedOffer._id}
                          onChange={(e) => {
                            const found = availableOffers.find((o) => o._id === e.target.value);
                            if (found) updateBasketOffer(item.product._id, found);
                          }}
                          className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:border-emerald-500 text-xs"
                        >
                          {availableOffers.map((o) => (
                            <option key={o._id} value={o._id}>
                              {o.sellerName || 'Verified Seller'} – ₹{o.price.toLocaleString('en-IN')}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity and Line Total */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateBasketQuantity(item.product._id, item.quantity - 1)}
                            className="p-1 rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateBasketQuantity(item.product._id, item.quantity + 1)}
                            className="p-1 rounded text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ₹{item.selectedOffer.price.toLocaleString('en-IN')} × {item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alternative Retailer Simulations */}
            {allSellersInBasket.length > 1 && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Single-Seller Basket Simulation</span>
                </div>
                <p className="text-xs text-slate-500">
                  Compare your optimized split basket against purchasing all items from one single retailer:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {allSellersInBasket.slice(0, 3).map((sellerName) => {
                    let totalIfBoughtHere = 0;
                    let hasAll = true;

                    for (const item of basket) {
                      const offer = item.product.offers?.find((o) => o.sellerName === sellerName);
                      if (offer) {
                        totalIfBoughtHere += offer.price * item.quantity;
                      } else {
                        hasAll = false;
                      }
                    }

                    const difference = totalIfBoughtHere - basketTotal;

                    return (
                      <div
                        key={sellerName}
                        className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1"
                      >
                        <span className="font-semibold text-slate-800 block truncate">{sellerName}</span>
                        {hasAll ? (
                          <>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              ₹{totalIfBoughtHere.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-amber-700 font-medium">
                              {difference > 0 ? `+₹${difference.toLocaleString('en-IN')} extra` : 'Matches lowest'}
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 text-[11px] italic">Incomplete inventory</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Cost Breakdown & Calculations */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Basket Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Selected Items</span>
                  <span className="font-mono font-semibold text-slate-900">{basket.length} items</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Standard Retail Reference</span>
                  <span className="font-mono text-slate-400 line-through">
                    ₹{referenceTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {estimatedSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg">
                    <span>Verified Catalog Savings</span>
                    <span className="font-mono font-bold">
                      -₹{estimatedSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                  <span className="text-sm font-bold">Optimized Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                      ₹{basketTotal.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-slate-400">Taxes included; shipping by seller</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setListName(`Planned Basket (${new Date().toLocaleDateString('en-IN')})`);
                    setSaveListModalOpen(true);
                  }}
                  className="w-full py-3 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Plan to Shopping Lists</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  BasketWise does not process payments directly. Proceed to your chosen retailers via product links to checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={clearModalOpen}
        title="Clear Shopping Basket?"
        message="Are you sure you want to remove all items from your basket calculator? This action cannot be undone."
        confirmLabel="Clear All Items"
        onConfirm={() => {
          clearBasket();
          setClearModalOpen(false);
        }}
        onCancel={() => setClearModalOpen(false)}
      />

      {/* Save to List Modal */}
      {saveListModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Save Basket to Shopping List
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Name this shopping list so you can re-open it later, check off items in-store, or track future price changes.
            </p>

            <form onSubmit={handleSaveList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  required
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g. Summer Tech Essentials"
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveListModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingList}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
                >
                  {savingList ? 'Saving...' : 'Save List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
