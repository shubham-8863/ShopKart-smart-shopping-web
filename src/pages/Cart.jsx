import React from 'react';
import { 
  ShoppingBag, 
  ArrowRight, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  LogIn, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { formatPrice } from '../utils/pricing';

export default function Cart({
  cartData = { items: [], subtotal: 0, delivery: 0, total: 0, freeDeliveryThreshold: 2000 },
  currentUser = null,
  loading = false,
  error = null,
  onRetry,
  onUpdateQuantity,
  onRemoveItem,
  updatingItemId = null,
}) {
  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;
  const delivery = cartData?.delivery || 0;
  const total = cartData?.total || 0;
  const isFreeDelivery = delivery === 0;

  const handleProceedToCheckout = () => {
    window.location.hash = '#checkout';
  };

  /* ==========================================================================
     1. Logged Out Authentication Prompt State
     ========================================================================== */
  if (!currentUser) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Your Cart
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#D86F5C] shadow-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Sign in to see your cart.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Your cart is saved to your account so you can pick up where you left off.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
            >
              <LogIn className="w-4 h-4 text-[#D86F5C]" />
              <span>Sign in</span>
            </a>
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/10 bg-white hover:bg-stone-50 text-[#222222] text-sm font-medium transition duration-150"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 text-[#6B6B6B]" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     2. Error State
     ========================================================================== */
  if (error) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200/60 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Unable to load your cart.
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2">
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
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
     3. Loading Skeleton State
     ========================================================================== */
  if (loading) {
    return (
      <div className="bg-[#FAF8F4] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="h-4 bg-stone-200/60 rounded w-24 mb-3 animate-pulse" />
          <div className="h-10 bg-stone-200/60 rounded w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-black/5 p-6 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-stone-100/70 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-4 bg-white rounded-2xl border border-black/5 p-6 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     4. Empty Cart State
     ========================================================================== */
  if (items.length === 0) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Your Cart
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#6B6B6B] shadow-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Nothing here yet.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Explore the collection and add something you'd love to bring home.
          </p>
          <a
            href="#products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     5. Populated Cart State (Server-backed)
     ========================================================================== */
  return (
    <div className="bg-[#FAF8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="max-w-2xl text-left mb-8 sm:mb-12">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
            Your Cart
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
            Ready when you are.
          </h1>
          <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2">
            Review your selections before moving on to checkout.
          </p>
        </div>

        {/* Two-Column Cart Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Cart Items List (7-8 cols on desktop) */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 text-left">
            <div className="bg-white rounded-2xl border border-black/5 shadow-xs overflow-hidden">
              <div className="divide-y divide-black/[0.06]">
                {items.map((item) => {
                  const isUpdating = updatingItemId === item.productId;

                  return (
                    <div
                      key={item.productId}
                      className={`p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-opacity ${
                        isUpdating ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Item Image & Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <a
                          href={`#product/${item.productId}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-black/5"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </a>

                        <div className="min-w-0">
                          <p className="text-[11px] font-medium tracking-wider uppercase text-[#D86F5C] mb-0.5">
                            {item.category}
                          </p>
                          <a
                            href={`#product/${item.productId}`}
                            className="text-sm sm:text-base font-semibold text-[#222222] hover:text-[#D86F5C] transition-colors line-clamp-1 leading-snug"
                          >
                            {item.name}
                          </a>
                          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1">
                            {formatPrice(item.unitPrice)} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls, Subtotal & Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                        
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-black/10 rounded-lg overflow-hidden bg-[#FAF8F4]/60">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1 || isUpdating}
                            onClick={() =>
                              onUpdateQuantity &&
                              onUpdateQuantity(item.productId, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#222222] hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs sm:text-sm font-semibold text-[#222222]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={item.quantity >= item.stock || isUpdating}
                            onClick={() =>
                              onUpdateQuantity &&
                              onUpdateQuantity(item.productId, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#222222] hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right min-w-[80px]">
                          <span className="text-sm sm:text-base font-semibold text-[#222222]">
                            {formatPrice(item.itemSubtotal)}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          disabled={isUpdating}
                          onClick={() => onRemoveItem && onRemoveItem(item.productId)}
                          className="p-1.5 text-[#6B6B6B] hover:text-rose-600 transition duration-150 rounded-lg hover:bg-rose-50 disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Return link */}
            <div className="pt-2">
              <a
                href="#products"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#6B6B6B] hover:text-[#D86F5C] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue shopping</span>
              </a>
            </div>
          </section>

          {/* Right Column: Order Summary Card (4-5 cols on desktop) */}
          <aside className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-5 text-left">
              
              <h2 className="text-lg font-semibold text-[#222222] pb-3 border-b border-black/[0.06]">
                Order Summary
              </h2>

              {/* Summary Calculations */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#222222]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span className="flex items-center gap-1">
                    <span>Delivery</span>
                    <span className="text-[10px] text-[#6B6B6B]">
                      (Standard)
                    </span>
                  </span>
                  <span className="font-semibold">
                    {isFreeDelivery ? (
                      <span className="text-emerald-600 font-medium">Free</span>
                    ) : (
                      <span className="text-[#222222]">{formatPrice(delivery)}</span>
                    )}
                  </span>
                </div>

                {/* Free Delivery Threshold Notification */}
                {!isFreeDelivery && (
                  <div className="p-2.5 rounded-lg bg-[#FAF8F4] border border-black/[0.04] text-[11px] text-[#6B6B6B] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#D86F5C] shrink-0" />
                    <span>
                      Add <strong>{formatPrice(2000 - subtotal)}</strong> more for free delivery.
                    </span>
                  </div>
                )}
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

              {/* Checkout CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-xs transition duration-150 active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Features */}
              <div className="pt-2 border-t border-black/[0.05] flex items-center justify-center gap-2 text-[11px] text-[#6B6B6B]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure, encrypted checkout</span>
              </div>

            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}
