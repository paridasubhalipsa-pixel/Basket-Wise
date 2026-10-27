import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, Check, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-lg font-bold text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center relative">
                <ShoppingBasket className="w-4 h-4" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-white flex items-center justify-center">
                  <Check className="w-2 h-2 text-emerald-400 stroke-[3]" />
                </div>
              </div>
              <span>
                Basket<span className="text-emerald-500">Wise</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering consumers to identify lowest market offers, evaluate price history, and plan optimized shopping baskets.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Seller Catalog</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Product Discovery
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Side-by-Side Comparison
                </Link>
              </li>
              <li>
                <Link to="/basket" className="hover:text-white transition-colors">
                  Basket Calculator
                </Link>
              </li>
              <li>
                <Link to="/shopping-lists" className="hover:text-white transition-colors">
                  Smart Shopping Lists
                </Link>
              </li>
              <li>
                <Link to="/price-alerts" className="hover:text-white transition-colors">
                  Target Price Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Transparency
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About BasketWise
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-terms" className="hover:text-white transition-colors">
                  Privacy Policy & Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Disclosure Box */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-medium mb-1.5">
              <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ethical Data Policy</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              BasketWise operates in demo mode with authorized verified benchmark observations. We do not engage in unauthorized scraping or live simulation without partner APIs.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BasketWise Systems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy-terms" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
