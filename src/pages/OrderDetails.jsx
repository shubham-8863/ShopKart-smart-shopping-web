import React from 'react';
import { 
  ArrowLeft, 
  Package, 
  CheckCircle2, 
  CreditCard, 
  MapPin, 
  ShieldCheck,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import products from '../data/products';
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

export default function OrderDetails({ orderId, orders = [] }) {
  // Find order by ID in the application orders collection
  const order = orders.find((o) => o.id === orderId);

  // Invalid or Not Found Order State
  if (!order) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Order Not Found
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#6B6B6B] shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            We couldn't find that order.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            The order may no longer be available in this session.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Orders</span>
            </a>
            <a
              href="#products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-black/10 hover:bg-stone-50 text-[#222222] text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shadow-2xs"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Resolve items against mock product catalog for visuals, while preserving unitPrice
  const resolvedItems = (order.items || [])
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === Number(item.productId)),
    }))
    .filter((item) => Boolean(item.product));

  // Compute or use stored pricing totals
  const subtotal =
    order.subtotal !== undefined
      ? order.subtotal
      : resolvedItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );

  const deliveryCost =
    order.deliveryCost !== undefined
      ? order.deliveryCost
      : order.delivery !== undefined
      ? order.delivery
      : subtotal >= 2000
      ? 0
      : 99;

  const total =
    order.total !== undefined ? order.total : subtotal + deliveryCost;

  const totalItemCount =
    order.itemCount ||
    resolvedItems.reduce((sum, item) => sum + item.quantity, 0);

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
              Order #{order.id}
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
                {resolvedItems.map((item) => {
                  const itemTotal = item.unitPrice * item.quantity;

                  return (
                    <div
                      key={item.productId}
                      className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <a
                          href={`#product/${item.product.id}`}
                          className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-black/5 group"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </a>

                        <div className="min-w-0">
                          <p className="text-[11px] font-medium tracking-wider uppercase text-[#D86F5C] mb-0.5">
                            {item.product.category}
                          </p>
                          <a
                            href={`#product/${item.product.id}`}
                            className="text-sm sm:text-base font-semibold text-[#222222] hover:text-[#D86F5C] line-clamp-1 transition-colors"
                          >
                            {item.product.name}
                          </a>
                          <p className="text-xs text-[#6B6B6B] mt-1">
                            Unit Price: {formatPrice(item.unitPrice)}
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
                  <span>Frontend Prototype: Paid or selected at checkout</span>
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
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.pincode}
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
