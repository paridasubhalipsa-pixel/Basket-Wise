import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBasket, Check, Heart, User as UserIcon, ShieldAlert, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useShopping } from '../../context/ShoppingContext.jsx';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { basketItemsCount, comparisonProducts, wishlistIds } = useShopping();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark with basket-check mark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 transition-colors relative">
              <ShoppingBasket className="w-5 h-5" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
              </div>
            </div>
            <span>
              Basket<span className="text-emerald-600 font-extrabold">Wise</span>
            </span>
          </Link>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              to="/products"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                isActive('/products') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Products
            </Link>

            <Link
              to="/compare"
              className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                isActive('/compare') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              <span>Compare</span>
              {comparisonProducts.length > 0 && (
                <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                  {comparisonProducts.length}
                </span>
              )}
            </Link>

            <Link
              to="/basket"
              className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                isActive('/basket') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              <span>Basket</span>
              {basketItemsCount > 0 && (
                <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                  {basketItemsCount}
                </span>
              )}
            </Link>

            <Link
              to="/shopping-lists"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                isActive('/shopping-lists') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Lists
            </Link>

            <Link
              to="/price-alerts"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 ${
                isActive('/price-alerts') ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Alerts
            </Link>
          </nav>

          {/* Zone 3: 1 Primary Action / User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Wishlist icon */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-xs font-medium text-slate-700 focus:outline-hidden"
                >
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs uppercase font-bold">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-emerald-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Products
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <span>Compare Products</span>
            {comparisonProducts.length > 0 && (
              <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {comparisonProducts.length}
              </span>
            )}
          </Link>
          <Link
            to="/basket"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <span>Basket Calculator</span>
            {basketItemsCount > 0 && (
              <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {basketItemsCount}
              </span>
            )}
          </Link>
          <Link
            to="/shopping-lists"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Shopping Lists
          </Link>
          <Link
            to="/price-alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Price Alerts
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold rounded-lg text-emerald-700 bg-emerald-50"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
