import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBasket, Check, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShopping } from '../context/ShoppingContext.jsx';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useShopping();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center relative">
              <ShoppingBasket className="w-4 h-4" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-white flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-400 stroke-[3]" />
              </div>
            </div>
            <span>
              Basket<span className="text-emerald-600">Wise</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500">
            Access your custom shopping lists, price drop alerts, and wishlist
          </p>
        </div>

        {/* 1-Click Demo Account Quick Fill Buttons */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Click Demo Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@basketwise.com', 'Admin@123')}
              className="py-1.5 px-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-slate-900">Admin Account</div>
              <div className="text-[10px] text-slate-400">admin@basketwise.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('alex@example.com', 'User@123')}
              className="py-1.5 px-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-slate-900">User Account</div>
              <div className="text-[10px] text-slate-400">alex@example.com</div>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
