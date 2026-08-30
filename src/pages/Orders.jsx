import React from 'react';
import { 
  Package, 
  ArrowRight, 
  LogIn, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import OrderCard from '../components/order/OrderCard';

export default function Orders({
  orders = [],
  currentUser = null,
  loading = false,
  error = null,
  onRetry,
}) {
  /* ==========================================================================
     1. Unauthenticated Prompt
     ========================================================================== */
  if (!currentUser) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Your Orders
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#D86F5C] shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Sign in to view your orders.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Your purchase history is securely connected to your ShopKart account.
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
            Unable to load orders.
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
      <div className="bg-[#FAF8F4] py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 space-y-6">
          <div className="h-4 bg-stone-200/70 rounded w-28 animate-pulse" />
          <div className="h-10 bg-stone-200/70 rounded w-64 animate-pulse" />
          <div className="space-y-4 pt-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/5 p-6 h-40 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     4. Empty Orders State
     ========================================================================== */
  if (orders.length === 0) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Your Orders
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#6B6B6B] shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            No orders yet.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Once you place an order, you'll find your purchases here.
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
     5. Populated Orders State (Server-backed)
     ========================================================================== */
  return (
    <div className="bg-[#FAF8F4] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 text-left">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
              Your Orders
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
              Everything you've ordered.
            </h1>
            <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2">
              Review your recent purchases and keep track of what you've brought home.
            </p>
          </div>

          <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] shrink-0">
            <span>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>
        </div>

        {/* Orders Stack (Newest First) */}
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.orderCode || order.id} order={order} />
          ))}
        </div>

      </div>
    </div>
  );
}
