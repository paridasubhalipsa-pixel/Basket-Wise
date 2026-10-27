import React from 'react';
import { ShieldCheck, HeartHandshake, Eye, ShoppingBasket } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <ShoppingBasket className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About BasketWise
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Empowering consumers with objective, transparent price intelligence across verified digital retailers.
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Our Core Mission</h2>
          <p>
            Online shopping has become increasingly fragmented. The exact same consumer electronics product, home appliance, or wearable can vary dramatically in price from one authorized seller to another on the exact same day.
          </p>
          <p>
            BasketWise was designed to eliminate the exhausting routine of manually checking multiple retailer tabs. By compiling transparent multi-seller price comparisons, verified historical observations, and multi-product basket calculations, we enable smart consumers to make confident, budget-conscious decisions.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg w-fit">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">100% Unbiased</h3>
            <p className="text-xs text-slate-500">
              We never inflate prices or favor sponsored positions. Lowest offers are always highlighted objectively.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Verified Retailers</h3>
            <p className="text-xs text-slate-500">
              All indexed seller offers are checked against authorized national retail networks with authentic warranties.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg w-fit">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Ethical Data Standard</h3>
            <p className="text-xs text-slate-500">
              BasketWise strictly complies with authorized partner APIs and transparent data benchmarks. We do not engage in unauthorized scraper attacks.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm">Demo Mode & Architecture Note</h3>
          <p>
            BasketWise is built as a complete production-style MERN application (React with Vite, Express.js REST API under <code>/api/v1</code>, and dual persistent database architecture with Mongoose schemas).
          </p>
          <p>
            All price points and historical records in this release reflect verified demonstration benchmark data to provide realistic testing without relying on unauthorized live web scraping.
          </p>
        </section>
      </div>
    </div>
  );
};
