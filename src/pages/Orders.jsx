import React from 'react';
import { Package, ArrowRight } from 'lucide-react';
import OrderCard from '../components/order/OrderCard';

export default function Orders({ orders = [] }) {
  // Empty Orders State
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
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

      </div>
    </div>
  );
}
