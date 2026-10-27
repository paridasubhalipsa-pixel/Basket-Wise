import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Shield, Heart, ListTodo, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useShopping } from '../context/ShoppingContext.jsx';

export const Profile = () => {
  const { user, updateProfile, changePassword, logout, isAdmin } = useAuth();
  const { wishlistIds, showToast } = useShopping();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <p className="text-sm text-slate-500 mb-4">Please log in to view your profile.</p>
        <Link to="/login" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUpdatingProfile(true);
    const res = await updateProfile(name.trim());
    setUpdatingProfile(false);
    if (res.success) {
      showToast('Profile name updated.', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    setChangingPass(true);
    const res = await changePassword(currentPassword, newPassword);
    setChangingPass(false);

    if (res.success) {
      showToast('Password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError(res.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal settings, password security, and active shopping collections
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs text-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            {isAdmin ? (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Administrator
              </span>
            ) : (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Verified Shopper
              </span>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <Link
              to="/wishlist"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="font-mono font-bold text-slate-900">{wishlistIds.length}</div>
              <div className="text-[10px] text-slate-500">Wishlist</div>
            </Link>
            <Link
              to="/shopping-lists"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="font-mono font-bold text-slate-900">Active</div>
              <div className="text-[10px] text-slate-500">Lists</div>
            </Link>
          </div>
        </div>

        {/* Update Profile & Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Update Name Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Profile Information
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email address cannot be changed in demo mode.
                </span>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Security & Password
            </h3>

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 chars"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="At least 6 chars"
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {changingPass ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
