import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RotateCcw, PackageSearch } from 'lucide-react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/products/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter state from URL params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialBrand = searchParams.get('brand') || 'all';
  const initialSort = searchParams.get('sort') || 'lowest_price';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialMinRating = searchParams.get('minRating') || '';
  const initialFeatured = searchParams.get('featured') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [minRating, setMinRating] = useState(initialMinRating);

  // Products and filters from API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        brand: selectedBrand !== 'all' ? selectedBrand : undefined,
        sort: sortBy,
        page: currentPage,
        limit: 12,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        featured: initialFeatured || undefined,
      };

      const res = await api.get('/products', params);

      if (res.success) {
        setProducts(res.data.products);
        setCategories(res.data.filters.categories);
        setAvailableBrands(res.data.filters.brands);
        if (res.pagination) {
          setTotalCount(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedCategory,
    selectedBrand,
    sortBy,
    currentPage,
    minPrice,
    maxPrice,
    minRating,
    initialFeatured,
  ]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBrand && selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (sortBy && sortBy !== 'lowest_price') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minRating) params.set('minRating', minRating);
    if (initialFeatured) params.set('featured', initialFeatured);

    setSearchParams(params, { replace: true });
  }, [
    searchTerm,
    selectedCategory,
    selectedBrand,
    sortBy,
    currentPage,
    minPrice,
    maxPrice,
    minRating,
    initialFeatured,
    setSearchParams,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('lowest_price');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(minRating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Price Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare prices across verified authorized retailers. Showing {totalCount} products.
          </p>
        </div>

        {/* Search input with live trigger */}
        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, brand, spec..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? 'block fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
          } lg:relative lg:bg-transparent lg:p-0 space-y-6`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 lg:hidden mb-4">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Price Range (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Min Rating Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="">Any Rating</option>
                <option value="4.5">★ 4.5 & Above</option>
                <option value="4.0">★ 4.0 & Above</option>
                <option value="3.5">★ 3.5 & Above</option>
              </select>
            </div>
          </div>

          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Apply & Close
            </button>
          )}
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort and Display Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-bold">{products.length}</span> of {totalCount} items
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:border-emerald-500"
              >
                <option value="lowest_price">Lowest Price First</option>
                <option value="highest_price">Highest Price First</option>
                <option value="highest_discount">Highest Discount %</option>
                <option value="rating_desc">Highest Customer Rating</option>
                <option value="name_asc">Alphabetical (A-Z)</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid or Skeletons or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No products matched your criteria"
              description="Try loosening your filters, clearing your search keywords, or selecting another category."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-medium">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-md font-mono ${
                        isCurrent
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
