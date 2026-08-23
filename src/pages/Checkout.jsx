import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle2, 
  Truck
} from 'lucide-react';
import products from '../data/products';
import { formatPrice, calculateOrderTotals } from '../utils/pricing';

export default function Checkout({ cartItems = [], onPlaceOrder }) {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute Order Pricing using shared utility
  const { resolvedItems, subtotal, isFreeDelivery, deliveryCost, total } = calculateOrderTotals(
    cartItems,
    products
  );

  // Empty Cart Protection
  if (resolvedItems.length === 0) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Checkout
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#6B6B6B] shadow-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Your cart is waiting.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Add something to your cart before continuing to checkout.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#cart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-black/10 hover:bg-stone-50 text-[#222222] text-sm font-medium transition duration-150 active:scale-95 shadow-2xs"
            >
              <span>Back to Cart</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Payment Method Selection Handler
  const handlePaymentSelect = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    if (errors.paymentMethod) {
      setErrors((prev) => ({ ...prev, paymentMethod: '' }));
    }
  };

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^\+?[\d\s-]{10,14}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Please enter your delivery address.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your city.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Please enter your state.';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Please enter your 6-digit PIN code.';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code.';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onPlaceOrder) {
        onPlaceOrder({
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          paymentMethod: formData.paymentMethod,
          items: resolvedItems,
          subtotal,
          deliveryCost,
          total,
          itemCount: resolvedItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      }
      window.location.hash = '#order-success';
    }, 400);
  };

  return (
    <div className="bg-[#FAF8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="max-w-2xl text-left mb-8 sm:mb-12">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
            Checkout
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
            Almost yours.
          </h1>
          <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2">
            Enter your details and review your order before placing it.
          </p>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form (7-8 cols on desktop) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 xl:col-span-8 space-y-8 text-left">
            
            {/* Section 1: Contact Information */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-semibold text-[#222222] mb-5 pb-3 border-b border-black/[0.06]">
                1. Contact Information
              </h2>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="e.g. Aditi Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#222222] placeholder-stone-400 focus:outline-none transition ${
                      errors.fullName
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-black/10 focus:border-[#222222] bg-[#FAF8F4]/50 focus:bg-white'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="aditi@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-[#222222] placeholder-stone-400 focus:outline-none transition ${
                        errors.email
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : 'border-black/10 focus:border-[#222222] bg-[#FAF8F4]/50 focus:bg-white'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-[#222222] placeholder-stone-400 focus:outline-none transition ${
                        errors.phone
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : 'border-black/10 focus:border-[#222222] bg-[#FAF8F4]/50 focus:bg-white'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Address */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-semibold text-[#222222] mb-5 pb-3 border-b border-black/[0.06]">
                2. Delivery Address
              </h2>

              <div className="space-y-4">
                {/* Street Address */}
                <div>
                  <label htmlFor="address" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                    Street Address / Flat / Landmark <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="42, Lavender Lane, Indiranagar"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#222222] placeholder-stone-400 focus:outline-none transition ${
                      errors.address
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-black/10 focus:border-[#222222] bg-[#FAF8F4]/50 focus:bg-white'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-rose-600 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City & State Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Bengaluru"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-[#222222] placeholder-stone-400 focus:outline-none transition ${
                        errors.city
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : 'border-black/10 focus:border-[#222222] bg-[#FAF8F4]/50 focus:bg-white'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-rose-600 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      placeholder="Karnataka"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-[#222222] placeholder-stone-400 focus:outline-none transition ${
                        errors.state
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                          : 'border-black/10 focus:border-[#222222] bg-[#FAF8F4]/50 focus:bg-white'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-rose-600 mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* PIN Code */}
                <div className="w-full sm:w-1/2">
                  <label htmlFor="pincode" className="block text-xs font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    maxLength={6}
                    placeholder="560038"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-[#222222] placeholder-stone-400 focus:outline-none transition ${
                      errors.pincode
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-black/10 focus:border-[#222222] bg-[#FAF8F4]/50 focus:bg-white'
                    }`}
                  />
                  {errors.pincode && (
                    <p className="text-xs text-rose-600 mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-semibold text-[#222222] mb-1 pb-3 border-b border-black/[0.06]">
                3. Payment Method
              </h2>
              <p className="text-xs text-[#6B6B6B] mb-4">
                Choose how you would like to pay upon checkout.
              </p>

              <div className="space-y-3" role="radiogroup" aria-label="Payment Method">
                
                {/* Option: Cash on Delivery */}
                <div
                  onClick={() => handlePaymentSelect('Cash on Delivery')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    formData.paymentMethod === 'Cash on Delivery'
                      ? 'border-[#D86F5C] bg-[#FAF8F4] text-[#222222]'
                      : 'border-black/10 hover:border-black/20 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      formData.paymentMethod === 'Cash on Delivery'
                        ? 'border-[#D86F5C]'
                        : 'border-black/30'
                    }`}>
                      {formData.paymentMethod === 'Cash on Delivery' && (
                        <div className="w-2 h-2 rounded-full bg-[#D86F5C]" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#222222] block">
                        Cash on Delivery
                      </span>
                      <span className="text-xs text-[#6B6B6B]">
                        Pay with cash or UPI on delivery
                      </span>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-[#6B6B6B]" />
                </div>

                {/* Option: UPI */}
                <div
                  onClick={() => handlePaymentSelect('UPI')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    formData.paymentMethod === 'UPI'
                      ? 'border-[#D86F5C] bg-[#FAF8F4] text-[#222222]'
                      : 'border-black/10 hover:border-black/20 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      formData.paymentMethod === 'UPI'
                        ? 'border-[#D86F5C]'
                        : 'border-black/30'
                    }`}>
                      {formData.paymentMethod === 'UPI' && (
                        <div className="w-2 h-2 rounded-full bg-[#D86F5C]" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#222222] block">
                        UPI (Instant Payment)
                      </span>
                      <span className="text-xs text-[#6B6B6B]">
                        Google Pay, PhonePe, Paytm & BHIM
                      </span>
                    </div>
                  </div>
                  <QrCode className="w-5 h-5 text-[#6B6B6B]" />
                </div>

                {/* Option: Card */}
                <div
                  onClick={() => handlePaymentSelect('Credit / Debit Card')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    formData.paymentMethod === 'Credit / Debit Card'
                      ? 'border-[#D86F5C] bg-[#FAF8F4] text-[#222222]'
                      : 'border-black/10 hover:border-black/20 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      formData.paymentMethod === 'Credit / Debit Card'
                        ? 'border-[#D86F5C]'
                        : 'border-black/30'
                    }`}>
                      {formData.paymentMethod === 'Credit / Debit Card' && (
                        <div className="w-2 h-2 rounded-full bg-[#D86F5C]" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#222222] block">
                        Credit / Debit Card
                      </span>
                      <span className="text-xs text-[#6B6B6B]">
                        Visa, Mastercard, RuPay & more
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-[#6B6B6B]" />
                </div>

              </div>

              {errors.paymentMethod && (
                <p className="text-xs text-rose-600 mt-2">{errors.paymentMethod}</p>
              )}

              <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-black/[0.04] text-[11px] text-[#6B6B6B] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Frontend Prototype: No card details or banking credentials are requested or charged.
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 rounded-xl bg-[#222222] hover:bg-[#333333] disabled:bg-[#444444] text-white font-medium text-base flex items-center justify-center gap-2 shadow-xs transition duration-150 active:scale-[0.98]"
              >
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Right Column: Order Review Summary (4-5 cols on desktop) */}
          <aside className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-5 text-left">
              
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <h2 className="text-lg font-semibold text-[#222222]">
                  Order Summary
                </h2>
                <a
                  href="#cart"
                  className="text-xs font-medium text-[#D86F5C] hover:underline"
                >
                  Edit cart
                </a>
              </div>

              {/* Items List (Compact Review) */}
              <div className="divide-y divide-black/[0.05] max-h-[300px] overflow-y-auto pr-1">
                {resolvedItems.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-black/5">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#222222] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#6B6B6B]">
                          Qty: {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-[#222222] shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary Calculations */}
              <div className="space-y-3 pt-3 border-t border-black/[0.06] text-xs sm:text-sm">
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#222222]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Delivery</span>
                  <span className="font-semibold">
                    {isFreeDelivery ? (
                      <span className="text-emerald-600 font-medium">Free</span>
                    ) : (
                      <span className="text-[#222222]">{formatPrice(99)}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-black/[0.06] pt-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm sm:text-base font-semibold text-[#222222]">
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-[#222222]">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6B6B]">
                  Includes all applicable taxes
                </p>
              </div>

              {/* Back to Cart link */}
              <div className="pt-2 border-t border-black/[0.05]">
                <a
                  href="#cart"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B6B] hover:text-[#D86F5C] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to cart</span>
                </a>
              </div>

            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}
