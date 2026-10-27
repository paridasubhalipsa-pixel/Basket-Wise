import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/products/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Skeleton.jsx';

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    productsCount: 20,
    sellersCount: 5,
    maxCatalogDiscount: 35,
  });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Load categories
        const catRes = await api.get('/categories');
        if (catRes.success) {
          setCategories(catRes.data.categories);
        }

        // Load featured products
        const prodRes = await api.get('/products', { limit: 6, sort: 'lowest_price' });
        if (prodRes.success) {
          setFeaturedProducts(prodRes.data.products);
        }

        // Load best deals
        const dealsRes = await api.get('/products', { featured: 'deals', limit: 4, sort: 'highest_discount' });
        if (dealsRes.success) {
          setDealProducts(dealsRes.data.products);
          const maxDisc = Math.max(...dealsRes.data.products.map((p) => p.maxDiscountPercent), 35);
          setStats((prev) => ({ ...prev, maxCatalogDiscount: maxDisc }));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md w-fit">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Transparent Multi-Seller Price Comparison</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
                Shop Smarter. <br />
                <span className="text-emerald-600">Save More.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Compare prices across multiple verified sellers in one place. Discover the true lowest offer, track price history observations, and optimize your entire shopping basket before spending a single rupee.
              </p>

              {/* Prominent Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-lg">
                <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white transition-all">
                  <div className="pl-4 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search headphones, smartwatches, coffee machines..."
                    className="w-full py-4 pl-3 pr-28 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Compare
                  </button>
                </div>
              </form>

              {/* Quick Suggestion Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                <span className="font-medium text-slate-400">Popular:</span>
                {['Sony WH-1000XM5', 'MacBook Pro M3', 'Garmin Titanium', 'Espresso Machine'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => navigate(`/products?search=${encodeURIComponent(term)}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl bg-slate-100 aspect-4/3 lg:aspect-square">
                <img
                  src="/src/assets/images/hero_smart_shopping_1792656373006.jpg"
                  alt="Modern electronics and shopping comparison showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-time Retailer Disparity</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Up to {stats.maxCatalogDiscount}% Price Variance Identified
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Different authorized retailers price identical products differently. We find the lowest price instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="mt-14 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                5+
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Verified Retail Sellers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
                100%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Transparent Benchmarks</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                ₹18,000+
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Catalog Potential Savings</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
                Up to {stats.maxCatalogDiscount}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Peak Verified Discounts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Popular Product Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to compare available offers across verified stores
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat._id)}`}
              className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {cat.productCount || 3} items
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Available Deals */}
      {dealProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Price Drops & Maximum Discounts</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Top Verified Deals
              </h2>
            </div>
            <Link
              to="/products?featured=deals"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Trending Product Comparisons
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top tracked consumer electronics, wearables, and home gear
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* How BasketWise Works */}
      <section className="bg-white border-y border-slate-200 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How BasketWise Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Three clear steps to eliminate overpaying across retail marketplaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Multi-Seller Search
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search or browse products. BasketWise aggregates offers from authorized retailers like Croma, Reliance Digital, Vijay Sales, and Tata CLiQ.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Side-by-Side Comparison
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluate detailed specifications, customer ratings, warranty terms, and verified historical price observations to spot real bargains.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Basket Optimization
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add multiple items to the Basket Calculator. Select optimal sellers per item to minimize overall checkout cost and maximize verified savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to stop overpaying on everyday electronics?
            </h3>
            <p className="text-sm text-slate-400">
              Create custom shopping lists, configure price drop alerts, and calculate multi-item basket savings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/products"
              className="px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors text-center shadow-xs"
            >
              Start Comparing
            </Link>
            <Link
              to="/basket"
              className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-center shadow-xs"
            >
              Open Basket Calculator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
