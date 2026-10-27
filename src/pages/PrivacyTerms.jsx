import React from 'react';

export const PrivacyTerms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8 text-sm text-slate-600 leading-relaxed">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Terms of Service
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Effective date: October 2026 · BasketWise System Governance
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Data Privacy Principles</h2>
          <p>
            BasketWise values your privacy. When you create an account, we store only your name, email, and cryptographically hashed password (using industry-standard bcrypt). We never store plaintext passwords, credit card numbers, or bank account credentials.
          </p>
          <p>
            Saved wishlists, shopping lists, and price alerts are associated solely with your user profile and are never traded, sold, or shared with third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Marketplace Price Intelligence</h2>
          <p>
            BasketWise operates as a price discovery and comparison indexing tool. We are not an authorized merchant, retailer, or manufacturer of the products listed. All product names, trademarks, logos, and brands remain the property of their respective owners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Demonstration Datasets & Live Purchases</h2>
          <p>
            Prices displayed on BasketWise represent verified historical observations or benchmark quotes from partner retailers. Actual checkout transactions take place directly on third-party retailer websites, subject to their individual terms of sale, inventory availability, and warranty policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Cookies & Session Storage</h2>
          <p>
            We use HTTP-only, secure authentication cookies and local browser storage to keep you signed in and preserve your current comparison and shopping basket selections between page refreshes.
          </p>
        </section>
      </div>
    </div>
  );
};
