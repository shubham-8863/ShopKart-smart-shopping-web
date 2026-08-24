import React from 'react';
import { CheckCircle2, ArrowRight, Home, Package } from 'lucide-react';
import { formatPrice } from '../utils/pricing';

export default function OrderSuccess({ lastOrder }) {
  const orderId = lastOrder?.id || 'SK1001';
  const total = lastOrder?.total || 0;
  const paymentMethod = lastOrder?.paymentMethod || 'Cash on Delivery';
  const itemCount = lastOrder?.itemCount || 1;
  const customerName = lastOrder?.customer?.fullName || 'Valued Customer';
  const city = lastOrder?.shippingAddress?.city;
  const state = lastOrder?.shippingAddress?.state;

  return (
    <div className="bg-[#FAF8F4] py-16 sm:py-24 min-h-[70vh] flex items-center justify-center text-center">
      <div className="max-w-lg mx-auto px-6">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Eyebrow */}
        <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
          Confirmation
        </p>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#222222] tracking-tight">
          Order placed successfully.
        </h1>

        {/* Supporting text & Prototype Notice */}
        <p className="text-sm sm:text-base text-[#6B6B6B] mt-3 leading-relaxed">
          Thank you, <strong>{customerName}</strong>! Order <strong>#{orderId}</strong> has been received. This is a frontend prototype and no real payment was processed.
        </p>

        {/* Order Breakdown Card */}
        <div className="mt-8 bg-white rounded-2xl border border-black/5 p-6 shadow-xs text-left space-y-3.5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B6B6B] pb-3 border-b border-black/[0.05]">
            <span>Order Reference</span>
            <span className="text-sm font-semibold text-[#222222]">
              #{orderId}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B6B6B]">
            <span>Order Total</span>
            <span className="text-base font-bold text-[#222222]">
              {formatPrice(total)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B6B6B]">
            <span>Payment Method</span>
            <span className="font-medium text-[#222222]">
              {paymentMethod}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B6B6B]">
            <span>Total Items</span>
            <span className="font-medium text-[#222222]">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {city && state && (
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B6B6B] pt-2 border-t border-black/[0.05]">
              <span>Delivery Destination</span>
              <span className="font-medium text-[#222222]">
                {city}, {state}
              </span>
            </div>
          )}
        </div>

        {/* Actions Hierarchy */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </a>

          <a
            href="#products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-black/10 hover:bg-stone-50 text-[#222222] text-sm font-medium transition duration-150 active:scale-95 shadow-2xs"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-black/10 hover:bg-stone-50 text-[#222222] text-sm font-medium transition duration-150 active:scale-95 shadow-2xs"
          >
            <Home className="w-4 h-4 text-[#6B6B6B]" />
            <span>Home</span>
          </a>
        </div>

      </div>
    </div>
  );
}
