import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShopping } from '../context/ShoppingContext.jsx';
import { api } from '../services/api.js';
import { ConfirmModal } from '../components/common/ConfirmModal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const ShoppingLists = () => {
  const { user } = useAuth();
  const { addToBasket, showToast } = useShopping();

  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [listToRename, setListToRename] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');

  const fetchLists = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/shopping-lists');
      if (res.success) {
        setLists(res.data.lists);
        if (res.data.lists.length > 0 && !activeListId) {
          setActiveListId(res.data.lists[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load shopping lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();

    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products', { limit: 50 });
        if (res.success) setAllProducts(res.data.products);
      } catch {
        // ignore
      }
    };
    fetchCatalog();
  }, [user]);

  const activeList = lists.find((l) => l._id === activeListId) || lists[0];

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const res = await api.post('/shopping-lists', {
        name: newListName.trim(),
        items: [],
      });
      if (res.success) {
        setLists((prev) => [res.data.list, ...prev]);
        setActiveListId(res.data.list._id);
        setCreateModalOpen(false);
        setNewListName('');
        showToast(`Created shopping list "${res.data.list.name}"`, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRenameList = async (e) => {
    e.preventDefault();
    if (!listToRename || !renameValue.trim()) return;

    try {
      const res = await api.patch(`/shopping-lists/${listToRename._id}`, {
        name: renameValue.trim(),
      });
      if (res.success) {
        setLists((prev) => prev.map((l) => (l._id === listToRename._id ? res.data.list : l)));
        setRenameModalOpen(false);
        setListToRename(null);
        showToast('Shopping list renamed.', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;

    try {
      const res = await api.delete(`/shopping-lists/${listToDelete._id}`);
      if (res.success) {
        const updated = lists.filter((l) => l._id !== listToDelete._id);
        setLists(updated);
        setActiveListId(updated[0]?._id || null);
        setDeleteModalOpen(false);
        setListToDelete(null);
        showToast('Shopping list deleted.', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleItemPurchased = async (productId, currentPurchased) => {
    if (!activeList) return;

    const updatedItems = activeList.items.map((item) => {
      if (item.productId === productId) {
        return {
          productId: item.productId,
          quantity: item.quantity,
          purchased: !currentPurchased,
          selectedSellerId: item.selectedSellerId,
        };
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        purchased: item.purchased,
        selectedSellerId: item.selectedSellerId,
      };
    });

    try {
      const res = await api.patch(`/shopping-lists/${activeList._id}`, {
        items: updatedItems,
      });
      if (res.success) {
        setLists((prev) => prev.map((l) => (l._id === activeList._id ? res.data.list : l)));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddItemToList = async () => {
    if (!activeList || !selectedProductToAdd) return;

    const existingIndex = activeList.items.findIndex(
      (item) => item.productId === selectedProductToAdd
    );

    let updatedItems = [];
    if (existingIndex > -1) {
      updatedItems = activeList.items.map((it, idx) =>
        idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it
      );
    } else {
      updatedItems = [
        ...activeList.items,
        { productId: selectedProductToAdd, quantity: 1, purchased: false },
      ];
    }

    try {
      const res = await api.patch(`/shopping-lists/${activeList._id}`, {
        items: updatedItems,
      });
      if (res.success) {
        setLists((prev) => prev.map((l) => (l._id === activeList._id ? res.data.list : l)));
        setSelectedProductToAdd('');
        showToast('Item added to shopping list.', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveItemFromList = async (productId) => {
    if (!activeList) return;

    const updatedItems = activeList.items
      .filter((it) => it.productId !== productId)
      .map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        purchased: it.purchased,
        selectedSellerId: it.selectedSellerId,
      }));

    try {
      const res = await api.patch(`/shopping-lists/${activeList._id}`, {
        items: updatedItems,
      });
      if (res.success) {
        setLists((prev) => prev.map((l) => (l._id === activeList._id ? res.data.list : l)));
        showToast('Item removed from shopping list.', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <ListTodo className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to Access Shopping Lists</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Create multiple customized shopping lists, track completion progress, and monitor market totals.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-emerald-600" />
            <span>Smart Shopping Lists</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize lists, track item quantities, and view estimated costs calculated from lowest verified offers
          </p>
        </div>

        <button
          onClick={() => {
            setNewListName('');
            setCreateModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Shopping List</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      ) : lists.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No shopping lists yet"
          description="Create your first shopping list to track electronics, gear, or groceries with lowest market price calculations."
          actionLabel="Create My First List"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Lists Selector Tabs */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider px-1">
              Your Saved Lists ({lists.length})
            </div>

            <div className="space-y-2">
              {lists.map((list) => {
                const isActive = list._id === activeList?._id;
                return (
                  <div
                    key={list._id}
                    onClick={() => setActiveListId(list._id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {list.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setListToRename(list);
                            setRenameValue(list.name);
                            setRenameModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title="Rename list"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setListToDelete(list);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{list.items.length} items</span>
                      <span className="font-bold text-slate-900">
                        ₹{(list.estimatedTotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{list.completionPercentage || 0}% checked</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${list.completionPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active List Item Management */}
          {activeList && (
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* List Header & Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeList.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeList.items.length} items · {activeList.purchasedCount || 0} purchased
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Estimated List Total</div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                    ₹{(activeList.estimatedTotal || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Add Item to List Row */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="w-full sm:flex-1 py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="">+ Select a catalog product to add...</option>
                  {allProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Lowest: ₹{p.lowestPrice.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>

                <button
                  disabled={!selectedProductToAdd}
                  onClick={handleAddItemToList}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap"
                >
                  Add Item
                </button>
              </div>

              {/* Items List */}
              {activeList.items.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl">
                  No items in this list yet. Choose a product from the dropdown above to add it.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeList.items.map((item) => {
                    const product = item.product;
                    return (
                      <div
                        key={item.productId}
                        className={`py-3.5 flex items-center justify-between gap-4 transition-opacity ${
                          item.purchased ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleItemPurchased(item.productId, item.purchased)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                              item.purchased
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white hover:border-emerald-500'
                            }`}
                          >
                            {item.purchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          {/* Image */}
                          <div className="w-12 h-12 bg-slate-100 rounded-md overflow-hidden shrink-0">
                            <img
                              src={product?.images?.[0] || ''}
                              alt={product?.name || 'Product'}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/products/${product?.slug || item.productId}`}
                              className={`text-xs font-semibold text-slate-900 hover:text-emerald-600 block truncate ${
                                item.purchased ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {product?.name || 'Catalog Item'}
                            </Link>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>Qty: {item.quantity}</span>
                              <span aria-hidden="true">·</span>
                              <span>Lowest at {item.bestOffer?.sellerName || 'Verified Seller'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                              ₹{(item.itemSubtotal || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ₹{(item.bestOffer?.price || 0).toLocaleString('en-IN')} ea
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {product && (
                              <button
                                onClick={() => addToBasket(product)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded"
                                title="Add to Basket"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveItemFromList(item.productId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                              title="Delete item from list"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Create New Shopping List</h3>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Living Room Audio Upgrade"
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Rename Shopping List</h3>
            <form onSubmit={handleRenameList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  required
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Shopping List?"
        message={`Are you sure you want to permanently delete "${listToDelete?.name}"? All items in this list will be removed.`}
        confirmLabel="Delete List"
        onConfirm={handleDeleteList}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
