import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
        <ShoppingBasket className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        The product, category, or comparison view you are seeking may have been relocated or does not exist.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
