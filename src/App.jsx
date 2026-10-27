import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ShoppingProvider } from './context/ShoppingContext.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { ToastContainer } from './components/common/Toast.jsx';

// Pages
import { Home } from './pages/Home.jsx';
import { Products } from './pages/Products.jsx';
import { ProductDetails } from './pages/ProductDetails.jsx';
import { CompareProducts } from './pages/CompareProducts.jsx';
import { BasketCalculator } from './pages/BasketCalculator.jsx';
import { Wishlist } from './pages/Wishlist.jsx';
import { ShoppingLists } from './pages/ShoppingLists.jsx';
import { PriceAlerts } from './pages/PriceAlerts.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Profile } from './pages/Profile.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { About } from './pages/About.jsx';
import { Contact } from './pages/Contact.jsx';
import { PrivacyTerms } from './pages/PrivacyTerms.jsx';
import { NotFound } from './pages/NotFound.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App-level uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Application Error Encountered</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'An unexpected rendering issue occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Reload BasketWise
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ShoppingProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:idOrSlug" element={<ProductDetails />} />
                  <Route path="/compare" element={<CompareProducts />} />
                  <Route path="/basket" element={<BasketCalculator />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/shopping-lists" element={<ShoppingLists />} />
                  <Route path="/price-alerts" element={<PriceAlerts />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-terms" element={<PrivacyTerms />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <ToastContainer />
            </div>
          </BrowserRouter>
        </ShoppingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
