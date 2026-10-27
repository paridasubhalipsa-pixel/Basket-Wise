import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Package,
  Layers,
  Store,
  Tag,
  Users,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Database,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShopping } from '../context/ShoppingContext.jsx';
import { api } from '../services/api.js';
import { ConfirmModal } from '../components/common/ConfirmModal.jsx';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useShopping();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data lists
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Modals & Forms
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormBrand, setProdFormBrand] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catFormName, setCatFormName] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');

  const [showSellerModal, setShowSellerModal] = useState(false);
  const [sellerFormName, setSellerFormName] = useState('');
  const [sellerFormWebsite, setSellerFormWebsite] = useState('');
  const [sellerFormDelivery, setSellerFormDelivery] = useState('');

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerFormProduct, setOfferFormProduct] = useState('');
  const [offerFormSeller, setOfferFormSeller] = useState('');
  const [offerFormPrice, setOfferFormPrice] = useState('');
  const [offerFormOriginalPrice, setOfferFormOriginalPrice] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setStats(res.data.stats);
        setRecentProducts(res.data.recentProducts || []);
      }

      // Load all lists
      const [prodsRes, catsRes, sellersRes, usersRes] = await Promise.all([
        api.get('/products', { limit: 50 }),
        api.get('/categories'),
        api.get('/sellers'),
        api.get('/admin/users'),
      ]);

      if (prodsRes.success) setProductsList(prodsRes.data.products || []);
      if (catsRes.success) setCategoriesList(catsRes.data.categories || []);
      if (sellersRes.success) setSellersList(sellersRes.data.sellers || []);
      if (usersRes.success) setUsersList(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, loadDashboardData]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Access Required</h2>
        <p className="text-sm text-slate-500 mb-6">
          This dashboard requires administrator privileges. Please sign in with an admin credential.
        </p>
        <Link to="/login" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  // Product Form Handler
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.patch(`/products/${editingProduct._id}`, {
          name: prodFormName,
          brand: prodFormBrand,
          categoryId: prodFormCategory,
          description: prodFormDesc,
        });
        if (res.success) showToast('Product updated successfully.', 'success');
      } else {
        const res = await api.post('/products', {
          name: prodFormName,
          brand: prodFormBrand,
          categoryId: prodFormCategory,
          description: prodFormDesc,
        });
        if (res.success) showToast('Product added successfully.', 'success');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Category Form Handler
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/categories', {
        name: catFormName,
        description: catFormDesc,
      });
      if (res.success) {
        showToast('Category created.', 'success');
        setShowCategoryModal(false);
        setCatFormName('');
        setCatFormDesc('');
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Seller Form Handler
  const handleSaveSeller = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sellers', {
        name: sellerFormName,
        website: sellerFormWebsite,
        deliveryDays: sellerFormDelivery || '2-3 Business Days',
      });
      if (res.success) {
        showToast('Seller added.', 'success');
        setShowSellerModal(false);
        setSellerFormName('');
        setSellerFormWebsite('');
        setSellerFormDelivery('');
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Offer Form Handler
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerFormProduct || !offerFormSeller || !offerFormPrice) return;
    try {
      const res = await api.post('/offers', {
        productId: offerFormProduct,
        sellerId: offerFormSeller,
        price: Number(offerFormPrice),
        originalPrice: offerFormOriginalPrice ? Number(offerFormOriginalPrice) : undefined,
      });
      if (res.success) {
        showToast('Seller offer published & recorded into price history!', 'success');
        setShowOfferModal(false);
        setOfferFormPrice('');
        setOfferFormOriginalPrice('');
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Action
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'product') {
        await api.delete(`/products/${deleteTarget.id}`);
      } else if (deleteTarget.type === 'category') {
        await api.delete(`/categories/${deleteTarget.id}`);
      } else if (deleteTarget.type === 'seller') {
        await api.delete(`/sellers/${deleteTarget.id}`);
      }
      showToast(`${deleteTarget.name} deleted.`, 'info');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Role toggle
  const handleToggleUserRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/role`, { role: nextRole });
      if (res.success) {
        showToast(`Updated ${targetUser.name}'s role to ${nextRole}.`, 'success');
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Reset Demo Dataset
  const handleResetDemoData = async () => {
    try {
      const res = await api.post('/admin/reset-demo');
      if (res.success) {
        showToast('Demo dataset refreshed and restored.', 'success');
        setResetConfirmOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded w-fit mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            BasketWise Operations & Catalog Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage live products, categories, sellers, verified offers, and user permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Products
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {stats.totalProducts}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {stats.totalActiveProducts} Active
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Categories
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {stats.totalCategories}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Taxonomy Nodes</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Sellers
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {stats.totalSellers}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Authorized Stores</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Offers
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {stats.totalOffers}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Live Benchmarks</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Registered Users
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {stats.totalUsers}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Accounts</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Storage Mode
            </div>
            <div className="text-xs font-bold text-slate-900 mt-2 truncate">
              {stats.databaseEngine}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Persisted</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'products', label: 'Products' },
          { key: 'categories', label: 'Categories' },
          { key: 'sellers', label: 'Sellers' },
          { key: 'offers', label: 'Offers & Prices' },
          { key: 'users', label: 'User Roles' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-3.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Recently Updated Catalog Products
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {recentProducts.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0">
                      <img
                        src={p.images?.[0] || ''}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/products/${p.slug || p._id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 block line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {p.brand} · {p.categoryName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{p.lowestPrice ? p.lowestPrice.toLocaleString('en-IN') : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.offersCount} seller {p.offersCount === 1 ? 'offer' : 'offers'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Manage Catalog Products</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdFormName('');
                setProdFormBrand('');
                setProdFormCategory(categoriesList[0]?._id || '');
                setProdFormDesc('');
                setShowProductModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Lowest Price</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsList.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.brand}</td>
                    <td className="py-3 px-3 text-slate-600">{p.categoryName || 'General'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 tabular-nums">
                      ₹{p.lowestPrice ? p.lowestPrice.toLocaleString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProdFormName(p.name);
                            setProdFormBrand(p.brand);
                            setProdFormCategory(p.categoryId);
                            setProdFormDesc(p.description || '');
                            setShowProductModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget({ type: 'product', id: p._id, name: p.name });
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Manage Taxonomy Categories</h3>
            <button
              onClick={() => {
                setCatFormName('');
                setCatFormDesc('');
                setShowCategoryModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {categoriesList.map((cat) => (
              <div key={cat._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">{cat.name}</div>
                  <div className="text-slate-500 text-[11px]">{cat.description}</div>
                </div>
                <button
                  onClick={() => {
                    setDeleteTarget({ type: 'category', id: cat._id, name: cat.name });
                    setDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Sellers */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Manage Retailer Partnerships</h3>
            <button
              onClick={() => {
                setSellerFormName('');
                setSellerFormWebsite('');
                setSellerFormDelivery('');
                setShowSellerModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Retail Seller</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {sellersList.map((seller) => (
              <div key={seller._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">{seller.name}</div>
                  <div className="text-slate-500 text-[11px]">
                    {seller.website} · {seller.deliveryDays}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDeleteTarget({ type: 'seller', id: seller._id, name: seller.name });
                    setDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Offers & Prices */}
      {activeTab === 'offers' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Retailer Offer Publishing</h3>
              <p className="text-xs text-slate-500">
                Publishing an offer automatically registers a timestamped observation in verified Price History.
              </p>
            </div>
            <button
              onClick={() => {
                setOfferFormProduct(productsList[0]?._id || '');
                setOfferFormSeller(sellersList[0]?._id || '');
                setOfferFormPrice('');
                setOfferFormOriginalPrice('');
                setShowOfferModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Offer</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
            Use this panel to input verified retailer price quotes. Whenever a price change is published, connected Price Alerts and user Shopping List totals recalculate instantly.
          </div>
        </div>
      )}

      {/* Tab 6: User Roles */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">User Accounts & Access Control</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Current Role</th>
                  <th className="py-2.5 px-3 text-right">Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          u.role === 'admin'
                            ? 'text-emerald-800 bg-emerald-100'
                            : 'text-slate-700 bg-slate-100'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        Switch to {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  placeholder="e.g. Sennheiser Momentum 4 Wireless"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={prodFormBrand}
                    onChange={(e) => setProdFormBrand(e.target.value)}
                    placeholder="e.g. Sennheiser"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={prodFormCategory}
                    onChange={(e) => setProdFormCategory(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  >
                    {categoriesList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  placeholder="Comprehensive description of product specifications..."
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Product Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="e.g. Gaming & VR Gear"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Seller Modal */}
      {showSellerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Partner Retailer</h3>
            <form onSubmit={handleSaveSeller} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seller Name</label>
                <input
                  type="text"
                  required
                  value={sellerFormName}
                  onChange={(e) => setSellerFormName(e.target.value)}
                  placeholder="e.g. Poorvika Mobiles"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  required
                  value={sellerFormWebsite}
                  onChange={(e) => setSellerFormWebsite(e.target.value)}
                  placeholder="https://www.example.com"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Terms</label>
                <input
                  type="text"
                  value={sellerFormDelivery}
                  onChange={(e) => setSellerFormDelivery(e.target.value)}
                  placeholder="e.g. Express 24-Hour Dispatch"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSellerModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg cursor-pointer"
                >
                  Save Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Offer Modal */}
      {showOfferModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Publish Retailer Offer</h3>
            <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product</label>
                <select
                  value={offerFormProduct}
                  onChange={(e) => setOfferFormProduct(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900"
                >
                  {productsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Retail Seller</label>
                <select
                  value={offerFormSeller}
                  onChange={(e) => setOfferFormSeller(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900"
                >
                  {sellersList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={offerFormPrice}
                    onChange={(e) => setOfferFormPrice(Number(e.target.value))}
                    placeholder="e.g. 24999"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Original MSRP (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={offerFormOriginalPrice}
                    onChange={(e) => setOfferFormOriginalPrice(Number(e.target.value))}
                    placeholder="e.g. 29999"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg cursor-pointer"
                >
                  Publish Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete ${deleteTarget?.type}?`}
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Permanently"
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Reset Demo Data Modal */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        title="Reset Demo Dataset to Default?"
        message="This will reseed all products, verified retailer offers, price histories, and initial admin/user accounts to their default state."
        confirmLabel="Reset & Reseed Data"
        onConfirm={handleResetDemoData}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};
