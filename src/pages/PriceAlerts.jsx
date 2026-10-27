import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Trash2,
  Edit2,
  CheckCircle2,
  ShoppingBag,
  Info,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShopping } from '../context/ShoppingContext.jsx';
import { api } from '../services/api.js';
import { ConfirmModal } from '../components/common/ConfirmModal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const PriceAlerts = () => {
  const { user } = useAuth();
  const { addToBasket, showToast } = useShopping();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingAlert, setEditingAlert] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState(null);

  const fetchAlerts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/price-alerts');
      if (res.success) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Failed to load price alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const handleUpdateTarget = async (e) => {
    e.preventDefault();
    if (!editingAlert || !editPriceValue || editPriceValue <= 0) return;

    try {
      const res = await api.patch(`/price-alerts/${editingAlert._id}`, {
        targetPrice: Number(editPriceValue),
      });
      if (res.success) {
        setAlerts((prev) => prev.map((a) => (a._id === editingAlert._id ? res.data.alert : a)));
        setEditingAlert(null);
        showToast('Target price updated.', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAlert = async () => {
    if (!alertToDelete) return;
    try {
      const res = await api.delete(`/price-alerts/${alertToDelete._id}`);
      if (res.success) {
        setAlerts((prev) => prev.filter((a) => a._id !== alertToDelete._id));
        setDeleteModalOpen(false);
        setAlertToDelete(null);
        showToast('Price alert deleted.', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to Manage Price Alerts</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Set custom target thresholds on electronics and receive evaluation triggers whenever market offers drop.
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
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>Target Price Alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking {alerts.length} target alerts against live verified retailer benchmarks
          </p>
        </div>
      </div>

      {/* Demo Notification Disclosure Banner */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Notification Evaluation Note:</span> Target threshold evaluation runs automatically against all current and updated seller offers. In demo mode, alerts are rendered directly in your web dashboard; production email dispatches require SMTP credentials.
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No active price alerts"
          description="Navigate to any product details page and tap 'Set Price Drop Alert' to monitor target pricing thresholds."
          actionLabel="Browse Catalog"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const product = alert.product;
            const reached = alert.isTargetReached;

            return (
              <div
                key={alert._id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  reached ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {product?.brand || 'Brand'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAlert(alert);
                          setEditPriceValue(alert.targetPrice);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Update target price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setAlertToDelete(alert);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={product?.images?.[0] || ''}
                        alt={product?.name || 'Product'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <Link
                      to={`/products/${product?.slug || alert.productId}`}
                      className="text-xs font-semibold text-slate-900 hover:text-emerald-600 line-clamp-2 leading-snug"
                    >
                      {product?.name || 'Catalog Product'}
                    </Link>
                  </div>

                  {/* Target Status Banner */}
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      reached
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Target Threshold:</span>
                      <span className="font-mono font-bold">
                        ₹{alert.targetPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Current Lowest Offer:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{alert.currentLowestPrice?.toLocaleString('en-IN') || '—'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between font-semibold">
                      <span>Status:</span>
                      {reached ? (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Target Reached!</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>₹{alert.differenceToTarget?.toLocaleString('en-IN')} above target</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-2">
                  {product && (
                    <button
                      onClick={() => addToBasket(product)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Basket Now</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Target Price Modal */}
      {editingAlert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Edit Target Price</h3>
            <form onSubmit={handleUpdateTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Target Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={editPriceValue}
                  onChange={(e) => setEditPriceValue(Number(e.target.value))}
                  className="w-full py-2 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAlert(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Price Alert?"
        message="Are you sure you want to stop monitoring price changes for this item?"
        confirmLabel="Delete Alert"
        onConfirm={handleDeleteAlert}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
