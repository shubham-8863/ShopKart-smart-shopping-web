import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Package, 
  CheckCircle2, 
  CreditCard, 
  MapPin, 
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { getOrderById, getStoredToken } from '../services/api';
import { formatPrice } from '../utils/pricing';

function formatOrderDate(dateString) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export default function OrderDetails({ orderId, orders = [], currentUser = null }) {
  const [order, setOrder] = useState(
    orders.find((o) => o.id === orderId || o.orderCode === orderId) || null
  );
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const token = getStoredToken();
    if (!token || !currentUser || !orderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    getOrderById(orderId, token, controller.signal)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          console.error('Error fetching order details:', err);
          setError(err.message || 'Unable to load order details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [orderId, currentUser, retryKey]);

  /* ==========================================================================
     1. Unauthenticated Prompt
     ========================================================================== */
  if (!currentUser) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Order Details
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#D86F5C] shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Sign in to view order details.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Please sign in to access information about this order.
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
     2. Loading Skeleton State
     ========================================================================== */
  if (loading) {
    return (
      <div className="bg-[#FAF8F4] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="h-4 bg-stone-200/70 rounded w-32 mb-6 animate-pulse" />
          <div className="h-10 bg-stone-200/70 rounded w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-black/5 p-6 h-96 animate-pulse" />
            <div className="lg:col-span-4 bg-white rounded-2xl border border-black/5 p-6 h-80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     3. Not Found or Error State
     ========================================================================== */
  if (!order || error) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Order Details
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#6B6B6B] shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            We couldn't find that order.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            {error || 'This order may belong to another account or does not exist.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Orders</span>
            </a>
            {error && (
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-black/10 hover:bg-stone-50 text-[#222222] text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shadow-2xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     4. Populated Order Details State (Server-backed)
     ========================================================================== */
  const items = order.items || [];
  const subtotal = order.subtotal || 0;
  const deliveryCost = order.deliveryCost ?? order.delivery ?? 0;
  const total = order.total || subtotal + deliveryCost;
  const totalItemCount =
    order.itemCount || items.reduce((sum, item) => sum + item.quantity, 0);

  const displayCode = order.orderCode || order.id;

  return (
    <div className="bg-[#FAF8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Back Link Navigation */}
        <nav aria-label="Back to Orders" className="mb-6 sm:mb-8 text-left">
          <a
            href="#orders"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </a>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 sm:mb-10 border-b border-black/[0.06] text-left">
          <div>
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
              Order Details
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
              Order #{displayCode}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-2">
              Placed on {formatOrderDate(order.createdAt)}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {order.status || 'Placed'}
            </span>
          </div>
        </div>

        {/* Two-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Purchased Items List (7-8 cols on desktop) */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-6 text-left">
            <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <h2 className="text-lg font-semibold text-[#222222]">
                  Items in this order
                </h2>
                <span className="text-xs font-medium text-[#6B6B6B]">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-black/[0.05]">
                {items.map((item, idx) => {
                  const product = item.product || {};
                  const productName = product.name || item.name || `Product #${item.productId}`;
                  const productCategory = product.category || item.category || 'Product';
                  const productImage = product.image || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
                  const unitPrice = item.unitPrice || product.price || 0;
                  const itemTotal = item.lineTotal || unitPrice * item.quantity;

                  return (
                    <div
                      key={item.productId || idx}
                      className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <a
                          href={`#product/${item.productId}`}
                          className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-black/5 group"
                        >
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </a>

                        <div className="min-w-0">
                          <p className="text-[11px] font-medium tracking-wider uppercase text-[#D86F5C] mb-0.5">
                            {productCategory}
                          </p>
                          <a
                            href={`#product/${item.productId}`}
                            className="text-sm sm:text-base font-semibold text-[#222222] hover:text-[#D86F5C] line-clamp-1 transition-colors"
                          >
                            {productName}
                          </a>
                          <p className="text-xs text-[#6B6B6B] mt-1">
                            Unit Price: {formatPrice(unitPrice)}
                          </p>
                          <p className="text-xs text-[#6B6B6B]">
                            Quantity: <strong>{item.quantity}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-xs text-[#6B6B6B] block sm:hidden">Item Total:</span>
                        <span className="text-base font-bold text-[#222222]">
                          {formatPrice(itemTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Order Summary, Payment, Shipping (4-5 cols on desktop) */}
          <aside className="lg:col-span-5 xl:col-span-4 space-y-6 text-left sticky top-24">
            
            {/* 1. Order Pricing Summary */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-[#222222] pb-3 border-b border-black/[0.06]">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#222222]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Delivery Charge</span>
                  <span className="font-medium">
                    {deliveryCost === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      <span className="text-[#222222]">{formatPrice(deliveryCost)}</span>
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-black/[0.06] flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-[#222222]">Final Total</span>
                  <span className="text-xl font-bold text-[#222222]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Payment Information */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-[#222222] pb-3 border-b border-black/[0.06] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D86F5C]" />
                <span>Payment Method</span>
              </h2>

              <div>
                <p className="text-sm font-semibold text-[#222222]">
                  {order.paymentMethod || 'Cash on Delivery'}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#6B6B6B] bg-[#FAF8F4] p-2.5 rounded-xl border border-black/[0.04]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secure record in ShopKart MySQL database</span>
                </div>
              </div>
            </div>

            {/* 3. Delivery Address */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-[#222222] pb-3 border-b border-black/[0.06] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D86F5C]" />
                <span>Delivery Address</span>
              </h2>

              <div className="text-xs sm:text-sm text-[#444444] space-y-1">
                {order.customer?.fullName && (
                  <p className="font-semibold text-[#222222]">
                    {order.customer.fullName}
                  </p>
                )}
                {order.shippingAddress?.address && (
                  <p>{order.shippingAddress.address}</p>
                )}
                {order.shippingAddress?.city && order.shippingAddress?.state && (
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                    {order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}
                  </p>
                )}
                {order.customer?.phone && (
                  <p className="text-xs text-[#6B6B6B] pt-1">
                    Phone: {order.customer.phone}
                  </p>
                )}
                {order.customer?.email && (
                  <p className="text-xs text-[#6B6B6B]">
                    Email: {order.customer.email}
                  </p>
                )}
              </div>
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}
