import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  MapPin, 
  Package, 
  Heart, 
  Bell, 
  ArrowRight, 
  Edit2, 
  Check, 
  Mail, 
  Phone,
  LogOut,
  LogIn,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  getCurrentUserProfile, 
  updateCurrentUserProfile, 
  getStoredToken 
} from '../services/api';

export default function Account({
  currentUser = null,
  onLogout,
  orders = [],
  wishlistIds = [],
  priceAlerts = [],
  onShowToast,
  onUpdateCurrentUser,
}) {
  // Server-backed Profile Data State
  const [accountProfile, setAccountProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit Mode & Local Form States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState(null);

  // Derived counts from centralized state
  const activeAlertCount = priceAlerts.filter((a) => a.isActive).length;

  // Fetch authenticated user profile from GET /api/users/me
  const fetchProfile = useCallback(() => {
    const token = getStoredToken();
    if (!token || !currentUser) return;

    setLoading(true);
    setError(null);

    getCurrentUserProfile(token)
      .then((data) => {
        setAccountProfile(data);
        setProfileForm({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
        });
        setAddressForm({
          street: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching account profile:', err);
        setError(err.message || 'Unable to load your account profile.');
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    } else {
      setAccountProfile(null);
      setError(null);
      setLoading(false);
    }
  }, [currentUser, fetchProfile]);

  // Profile Save Handler (PUT /api/users/me)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) return;

    if (!profileForm.fullName || profileForm.fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }

    setSavingProfile(true);
    setProfileError(null);

    try {
      const updated = await updateCurrentUserProfile(
        {
          fullName: profileForm.fullName.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone ? profileForm.phone.trim() : '',
        },
        token
      );

      setAccountProfile(updated);
      setIsEditingProfile(false);

      if (onUpdateCurrentUser) {
        onUpdateCurrentUser((prev) => ({
          ...prev,
          fullName: updated.fullName,
          email: updated.email,
          phone: updated.phone,
        }));
      }

      if (onShowToast) {
        onShowToast('Profile updated.');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setProfileError(err.message || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    if (accountProfile) {
      setProfileForm({
        fullName: accountProfile.fullName || '',
        email: accountProfile.email || '',
        phone: accountProfile.phone || '',
      });
    }
    setProfileError(null);
    setIsEditingProfile(false);
  };

  // Address Save Handler (PUT /api/users/me)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) return;

    if (addressForm.pincode && addressForm.pincode.trim() !== '') {
      if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
        setAddressError('PIN code must be exactly 6 digits.');
        return;
      }
    }

    setSavingAddress(true);
    setAddressError(null);

    try {
      const updated = await updateCurrentUserProfile(
        {
          address: addressForm.street ? addressForm.street.trim() : '',
          city: addressForm.city ? addressForm.city.trim() : '',
          state: addressForm.state ? addressForm.state.trim() : '',
          pincode: addressForm.pincode ? addressForm.pincode.trim() : '',
        },
        token
      );

      setAccountProfile(updated);
      setIsEditingAddress(false);

      if (onUpdateCurrentUser) {
        onUpdateCurrentUser((prev) => ({
          ...prev,
          address: updated.address,
          city: updated.city,
          state: updated.state,
          pincode: updated.pincode,
        }));
      }

      if (onShowToast) {
        onShowToast('Delivery address updated.');
      }
    } catch (err) {
      console.error('Failed to update address:', err);
      setAddressError(err.message || 'Unable to update address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCancelAddress = () => {
    if (accountProfile) {
      setAddressForm({
        street: accountProfile.address || '',
        city: accountProfile.city || '',
        state: accountProfile.state || '',
        pincode: accountProfile.pincode || '',
      });
    }
    setAddressError(null);
    setIsEditingAddress(false);
  };

  /* ==========================================================================
     1. Logged-Out State
     ========================================================================== */
  if (!currentUser) {
    return (
      <div className="bg-[#FAF8F4] py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          
          {/* Logged Out Hero Card */}
          <div className="bg-white rounded-3xl border border-black/5 p-8 sm:p-12 shadow-xs text-center mb-12">
            <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-black/5 flex items-center justify-center mx-auto mb-5 text-[#D86F5C]">
              <User className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
              Your Account
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#222222] tracking-tight">
              Sign in to make ShopKart yours.
            </h1>
            <p className="text-[#6B6B6B] text-sm sm:text-base leading-relaxed mt-2.5 max-w-md mx-auto">
              Access your orders, saved products, and price tracking from one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#auth"
                className="px-6 py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-[#D86F5C]" />
                <span>Sign in</span>
              </a>
              <a
                href="#auth"
                className="px-6 py-3 rounded-full border border-black/10 bg-white hover:bg-stone-50 text-[#222222] text-sm font-medium transition duration-150"
              >
                Create account
              </a>
            </div>
          </div>

          {/* Session Shopping Activity */}
          <section className="text-left">
            <h2 className="text-lg font-semibold text-[#222222] mb-5">
              Current session activity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Orders */}
              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/5 flex items-center justify-center text-[#D86F5C] mb-4">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#222222]">Orders</h3>
                  <p className="text-2xl font-bold text-[#222222] mt-1">{orders.length}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {orders.length === 1 ? 'order placed' : 'orders placed'}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-black/[0.05]">
                  <a href="#orders" className="text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1.5 transition">
                    <span>View orders</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D86F5C]" />
                  </a>
                </div>
              </div>

              {/* Wishlist */}
              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/5 flex items-center justify-center text-[#D86F5C] mb-4">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#222222]">Wishlist</h3>
                  <p className="text-2xl font-bold text-[#222222] mt-1">{wishlistIds.length}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {wishlistIds.length === 1 ? 'item saved' : 'items saved'}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-black/[0.05]">
                  <a href="#wishlist" className="text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1.5 transition">
                    <span>View wishlist</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D86F5C]" />
                  </a>
                </div>
              </div>

              {/* Price Alerts */}
              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/5 flex items-center justify-center text-[#D86F5C] mb-4">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#222222]">Price Alerts</h3>
                  <p className="text-2xl font-bold text-[#222222] mt-1">{activeAlertCount}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {activeAlertCount === 1 ? 'product tracked' : 'products tracked'}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-black/[0.05]">
                  <a href="#price-alerts" className="text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1.5 transition">
                    <span>View price alerts</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D86F5C]" />
                  </a>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    );
  }

  /* ==========================================================================
     2. Loading Skeleton State
     ========================================================================== */
  if (loading && !accountProfile) {
    return (
      <div className="bg-[#FAF8F4] py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="h-4 bg-stone-200/70 rounded w-28 mb-3 animate-pulse" />
          <div className="h-10 bg-stone-200/70 rounded w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-black/5 p-6 h-64 animate-pulse" />
            <div className="bg-white rounded-2xl border border-black/5 p-6 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     3. Error State
     ========================================================================== */
  if (error && !accountProfile) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200/60 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Unable to load your account.
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchProfile}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     4. Authenticated & Populated Account State (Server-backed)
     ========================================================================== */
  const currentFullName = accountProfile?.fullName || currentUser?.fullName || 'Shopper';
  const currentEmail = accountProfile?.email || currentUser?.email || '';
  const currentPhone = accountProfile?.phone ?? currentUser?.phone;
  const currentAddress = accountProfile?.address ?? currentUser?.address;
  const currentCity = accountProfile?.city ?? currentUser?.city;
  const currentState = accountProfile?.state ?? currentUser?.state;
  const currentPincode = accountProfile?.pincode ?? currentUser?.pincode;
  const currentRole = accountProfile?.role || currentUser?.role || 'customer';

  // Build clean address line
  const addressLine = [currentCity, currentState].filter(Boolean).join(', ');
  const fullAddressLine = addressLine
    ? `${addressLine}${currentPincode ? ` - ${currentPincode}` : ''}`
    : currentPincode ? `PIN: ${currentPincode}` : '';

  return (
    <div className="bg-[#FAF8F4] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* 1. Account Header with Logout Button */}
        <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5 text-left">
          <div>
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
              Your Account
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
              Welcome, {currentFullName.split(' ')[0]}.
            </h1>
            <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2.5 max-w-2xl">
              Manage your profile, revisit your orders, and keep track of the products you care about.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-xs sm:text-sm font-medium text-[#222222] transition duration-150 shadow-2xs active:scale-95"
            >
              <LogOut className="w-4 h-4 text-[#6B6B6B]" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* 2. Shopping Activity Section */}
        <section className="mb-12 text-left">
          <h2 className="text-lg font-semibold text-[#222222] mb-5">
            Your ShopKart activity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Orders Activity Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/5 flex items-center justify-center text-[#D86F5C] mb-4">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#222222]">
                  Orders
                </h3>
                <p className="text-2xl font-bold text-[#222222] mt-1">
                  {orders.length}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  {orders.length === 1 ? 'order placed' : 'orders placed'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-black/[0.05]">
                <a
                  href="#orders"
                  className="text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1.5 transition"
                >
                  <span>View orders</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D86F5C]" />
                </a>
              </div>
            </div>

            {/* Wishlist Activity Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/5 flex items-center justify-center text-[#D86F5C] mb-4">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#222222]">
                  Wishlist
                </h3>
                <p className="text-2xl font-bold text-[#222222] mt-1">
                  {wishlistIds.length}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  {wishlistIds.length === 1 ? 'item saved' : 'items saved'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-black/[0.05]">
                <a
                  href="#wishlist"
                  className="text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1.5 transition"
                >
                  <span>View wishlist</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D86F5C]" />
                </a>
              </div>
            </div>

            {/* Price Alerts Activity Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/5 flex items-center justify-center text-[#D86F5C] mb-4">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#222222]">
                  Price Alerts
                </h3>
                <p className="text-2xl font-bold text-[#222222] mt-1">
                  {activeAlertCount}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  {activeAlertCount === 1 ? 'product tracked' : 'products tracked'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-black/[0.05]">
                <a
                  href="#price-alerts"
                  className="text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1.5 transition"
                >
                  <span>View price alerts</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D86F5C]" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 3 & 4. Profile & Delivery Details (2-Column Grid on Desktop) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Profile Information Card */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#D86F5C]" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#222222]">
                    Profile information
                  </h2>
                </div>

                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({
                        fullName: currentFullName,
                        email: currentEmail,
                        phone: currentPhone || '',
                      });
                      setProfileError(null);
                      setIsEditingProfile(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#222222] hover:text-[#D86F5C] transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit profile</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                /* Profile Edit Form */
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {profileError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-xs text-rose-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, fullName: e.target.value });
                        if (profileError) setProfileError(null);
                      }}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, email: e.target.value });
                        if (profileError) setProfileError(null);
                      }}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => {
                        setProfileForm({ ...profileForm, phone: e.target.value });
                        if (profileError) setProfileError(null);
                      }}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs disabled:opacity-60"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{savingProfile ? 'Saving...' : 'Save changes'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingProfile}
                      onClick={handleCancelProfile}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#222222] text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile Display */
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs text-[#6B6B6B] block">Full Name</span>
                    <span className="font-semibold text-[#222222] text-base">
                      {currentFullName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#444444]">
                    <Mail className="w-4 h-4 text-[#6B6B6B]" />
                    <span>{currentEmail}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#444444]">
                    <Phone className="w-4 h-4 text-[#6B6B6B]" />
                    {currentPhone ? (
                      <span>{currentPhone}</span>
                    ) : (
                      <span className="text-xs text-[#6B6B6B] italic">Not provided</span>
                    )}
                  </div>

                  {currentRole && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-[#222222] border border-black/5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D86F5C]" />
                        <span>Account Role: {currentRole}</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6B6B6B] mt-6 pt-4 border-t border-black/[0.05]">
              Stored securely in ShopKart MySQL database.
            </p>
          </div>

          {/* Delivery Information Card */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D86F5C]" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#222222]">
                    Delivery information
                  </h2>
                </div>

                {!isEditingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddressForm({
                        street: currentAddress || '',
                        city: currentCity || '',
                        state: currentState || '',
                        pincode: currentPincode || '',
                      });
                      setAddressError(null);
                      setIsEditingAddress(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#222222] hover:text-[#D86F5C] transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit address</span>
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                /* Address Edit Form */
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  {addressError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-xs text-rose-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, street: e.target.value });
                        if (addressError) setAddressError(null);
                      }}
                      placeholder="e.g. 21 MG Road, Flat 4B"
                      className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, city: e.target.value });
                          if (addressError) setAddressError(null);
                        }}
                        placeholder="e.g. Jaipur"
                        className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, state: e.target.value });
                          if (addressError) setAddressError(null);
                        }}
                        placeholder="e.g. Rajasthan"
                        className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, pincode: e.target.value });
                        if (addressError) setAddressError(null);
                      }}
                      placeholder="6-digit PIN code"
                      className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs disabled:opacity-60"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{savingAddress ? 'Saving...' : 'Save changes'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingAddress}
                      onClick={handleCancelAddress}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#222222] text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Address Display */
                <div className="space-y-2 text-sm text-[#444444]">
                  <p className="font-semibold text-[#222222]">
                    Default Shipping Address
                  </p>
                  {currentAddress ? (
                    <p>{currentAddress}</p>
                  ) : (
                    <p className="text-xs text-[#6B6B6B] italic">No street address provided</p>
                  )}
                  {fullAddressLine ? (
                    <p>{fullAddressLine}</p>
                  ) : (
                    <p className="text-xs text-[#6B6B6B] italic">City / State / PIN not provided</p>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6B6B6B] mt-6 pt-4 border-t border-black/[0.05]">
              Pre-fills your shipping details during checkout.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
}
