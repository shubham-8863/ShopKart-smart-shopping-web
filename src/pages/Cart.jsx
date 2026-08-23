import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import products from '../data/products';

// Helper to format currency
function formatPrice(amount) {
  return typeof amount === 'number'
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount)
    : amount;
}

export default function Cart({ cartItems = [], onUpdateQuantity, onRemoveItem }) {
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  // Resolve cart item references against the mock dataset
  const resolvedItems = cartItems
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === Number(item.productId)),
    }))
    .filter((item) => Boolean(item.product));

  // Compute Subtotal, Delivery Cost, and Final Total
  const subtotal = resolvedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const isFreeDelivery = subtotal >= 2000;
  const deliveryCost = isFreeDelivery ? 0 : 99;
  const total = subtotal + (resolvedItems.length > 0 ? deliveryCost : 0);

  const handleProceedToCheckout = () => {
    setCheckoutNotice(true);
    setTimeout(() => setCheckoutNotice(false), 3500);
  };

  // Empty Cart State
  if (resolvedItems.length === 0) {
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

        {/* Temporary Checkout Step Notice */}
        {checkoutNotice && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-4 text-left">
            <span>
              ℹ️ Checkout will be implemented in the next step. Your cart selections are ready!
            </span>
            <button
              type="button"
              onClick={() => setCheckoutNotice(false)}
              className="text-amber-800 font-bold hover:text-amber-950 text-xs uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Column Cart Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Cart Items List (7-8 cols on desktop) */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 text-left">
            <div className="bg-white rounded-2xl border border-black/5 shadow-xs overflow-hidden">
              <div className="divide-y divide-black/[0.06]">
                {resolvedItems.map((item) => (
                  <div
                    key={item.productId}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
                  >
                    {/* Item Image & Details */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <a
                        href={`#product/${item.product.id}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-black/5"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </a>

                      <div className="min-w-0">
                        <p className="text-[11px] font-medium tracking-wider uppercase text-[#D86F5C] mb-0.5">
                          {item.product.category}
                        </p>
                        <a
                          href={`#product/${item.product.id}`}
                          className="text-sm sm:text-base font-semibold text-[#222222] hover:text-[#D86F5C] transition-colors line-clamp-1 leading-snug"
                        >
                          {item.product.name}
                        </a>
                        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1">
                          {formatPrice(item.product.price)} each
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
                          disabled={item.quantity <= 1}
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
                          onClick={() =>
                            onUpdateQuantity &&
                            onUpdateQuantity(item.productId, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-[#222222] hover:bg-stone-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm sm:text-base font-semibold text-[#222222]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        aria-label={`Remove ${item.product.name} from cart`}
                        onClick={() => onRemoveItem && onRemoveItem(item.productId)}
                        className="p-1.5 text-[#6B6B6B] hover:text-rose-600 transition duration-150 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                ))}
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
                      <span className="text-[#222222]">{formatPrice(99)}</span>
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
