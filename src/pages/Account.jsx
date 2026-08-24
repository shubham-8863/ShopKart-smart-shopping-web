import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Package, 
  Heart, 
  Bell, 
  ArrowRight, 
  Edit2, 
  Check, 
  ShoppingBag,
  Mail,
  Phone
} from 'lucide-react';

export default function Account({
  orders = [],
  wishlistIds = [],
  priceAlerts = [],
  onShowToast,
}) {
  // Local profile state
  const [profile, setProfile] = useState({
    fullName: 'Shubham Saini',
    email: 'shubham@example.com',
    phone: '+91 98765 43210',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);

  // Local delivery address state
  const [address, setAddress] = useState({
    street: '21 MG Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    pin: '302001',
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(address);

  // Derived counts from centralized state
  const activeAlertCount = priceAlerts.filter((a) => a.isActive).length;

  // Profile handlers
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(profileForm);
    setIsEditingProfile(false);
    if (onShowToast) {
      onShowToast('Profile updated.');
    }
  };

  const handleCancelProfile = () => {
    setProfileForm(profile);
    setIsEditingProfile(false);
  };

  // Address handlers
  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddress(addressForm);
    setIsEditingAddress(false);
    if (onShowToast) {
      onShowToast('Delivery address updated.');
    }
  };

  const handleCancelAddress = () => {
    setAddressForm(address);
    setIsEditingAddress(false);
  };

  return (
    <div className="bg-[#FAF8F4] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 text-left">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Your Account
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
            Everything in one place.
          </h1>
          <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2.5 max-w-2xl">
            Manage your profile, revisit your orders, and keep track of the products you care about.
          </p>
        </div>

        {/* Prominent Order History Discoverability Action Card */}
        <section className="mb-10 text-left">
          <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:shadow-md transition">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-stone-50 border border-black/5 flex items-center justify-center text-[#D86F5C] shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-0.5">
                  Order History
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#222222]">
                    Your orders
                  </h2>
                  <span className="text-xs font-semibold text-[#6B6B6B] bg-stone-100 px-2.5 py-0.5 rounded-full">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1">
                  Review your previous purchases and order details.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href="#orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
              >
                <span>View my orders</span>
                <ArrowRight className="w-4 h-4 text-[#D86F5C]" />
              </a>
            </div>
          </div>
        </section>

        {/* Section 1: Shopping Activity Overview */}
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

        {/* Section 2: Profile & Delivery Details (2-Column Grid on Desktop) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
          
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
                      setProfileForm(profile);
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
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, fullName: e.target.value })
                      }
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
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
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
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save changes</span>
                    </button>
                    <button
                      type="button"
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
                      {profile.fullName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#444444]">
                    <Mail className="w-4 h-4 text-[#6B6B6B]" />
                    <span>{profile.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#444444]">
                    <Phone className="w-4 h-4 text-[#6B6B6B]" />
                    <span>{profile.phone}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6B6B6B] mt-6 pt-4 border-t border-black/[0.05]">
              Frontend prototype: Account information stored in local session.
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
                      setAddressForm(address);
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
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, street: e.target.value })
                      }
                      required
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
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, city: e.target.value })
                        }
                        required
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
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, state: e.target.value })
                        }
                        required
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
                      value={addressForm.pin}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, pin: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium inline-flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save changes</span>
                    </button>
                    <button
                      type="button"
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
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} - {address.pin}
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6B6B6B] mt-6 pt-4 border-t border-black/[0.05]">
              Pre-fills your shipping details during checkout.
            </p>
          </div>

        </section>

        {/* Section 3: Quick Actions */}
        <section className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs text-left">
          <h2 className="text-base font-semibold text-[#222222] mb-4 pb-3 border-b border-black/[0.06]">
            Quick actions
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a
              href="#orders"
              className="p-3.5 rounded-xl border border-black/5 hover:border-[#D86F5C] hover:bg-[#FAF8F4] text-center transition group flex flex-col items-center justify-center gap-2"
            >
              <Package className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#D86F5C] transition-colors" />
              <span className="text-xs font-medium text-[#222222]">View Orders</span>
            </a>

            <a
              href="#wishlist"
              className="p-3.5 rounded-xl border border-black/5 hover:border-[#D86F5C] hover:bg-[#FAF8F4] text-center transition group flex flex-col items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#D86F5C] transition-colors" />
              <span className="text-xs font-medium text-[#222222]">Wishlist</span>
            </a>

            <a
              href="#price-alerts"
              className="p-3.5 rounded-xl border border-black/5 hover:border-[#D86F5C] hover:bg-[#FAF8F4] text-center transition group flex flex-col items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#D86F5C] transition-colors" />
              <span className="text-xs font-medium text-[#222222]">Price Alerts</span>
            </a>

            <a
              href="#products"
              className="p-3.5 rounded-xl border border-black/5 hover:border-[#D86F5C] hover:bg-[#FAF8F4] text-center transition group flex flex-col items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#D86F5C] transition-colors" />
              <span className="text-xs font-medium text-[#222222]">Continue Shopping</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
