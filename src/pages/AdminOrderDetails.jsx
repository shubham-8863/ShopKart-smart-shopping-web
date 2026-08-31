import React, { useState } from 'react';
import { 
  X, 
  Package, 
  CheckCircle2, 
  CreditCard, 
  MapPin, 
  ShieldCheck,
  Truck,
  Clock,
  XCircle,
  Check,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { formatPrice } from '../utils/pricing';

function formatOrderDate(dateString) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export default function AdminOrderDetails({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (!isOpen || !order) return null;

  const currentStatus = order.status || 'Placed';

  const handleStatusChange = async (targetStatus) => {
    setActionError(null);
    setUpdatingStatus(true);

    try {
      if (onUpdateStatus) {
        await onUpdateStatus(order.orderCode || order.id, targetStatus);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      setActionError(err.message || 'Unable to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const items = order.items || [];
  const totalItemCount =
    order.itemCount || items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between bg-[#FAF8F4]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#D86F5C]">
                Admin Order Management
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                currentStatus === 'Delivered'
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                  : currentStatus === 'Cancelled'
                  ? 'text-rose-700 bg-rose-50 border border-rose-200/60'
                  : currentStatus === 'Shipped'
                  ? 'text-indigo-700 bg-indigo-50 border border-indigo-200/60'
                  : 'text-amber-800 bg-amber-50 border border-amber-200/60'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{currentStatus}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#222222]">
              Order #{order.orderCode || order.id}
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Placed on {formatOrderDate(order.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#6B6B6B] hover:text-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
          
          {actionError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Lifecycle Action Controls Card */}
          <div className="p-5 rounded-2xl bg-[#FAF8F4] border border-black/[0.06] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                  Fulfillment Status Control
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Controlled backend transitions for this order.
                </p>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {currentStatus === 'Placed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('Processing')}
                      disabled={updatingStatus}
                      className="px-4 py-2 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium transition shadow-xs disabled:opacity-60 flex items-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{updatingStatus ? 'Updating...' : 'Accept Order (→ Processing)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('Cancelled')}
                      disabled={updatingStatus}
                      className="px-4 py-2 rounded-full border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium transition disabled:opacity-60 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  </>
                )}

                {currentStatus === 'Processing' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('Shipped')}
                      disabled={updatingStatus}
                      className="px-4 py-2 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium transition shadow-xs disabled:opacity-60 flex items-center gap-1.5 active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#D86F5C]" />
                      <span>{updatingStatus ? 'Updating...' : 'Mark as Shipped (→ Shipped)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('Cancelled')}
                      disabled={updatingStatus}
                      className="px-4 py-2 rounded-full border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium transition disabled:opacity-60 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  </>
                )}

                {currentStatus === 'Shipped' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Delivered')}
                    disabled={updatingStatus}
                    className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-xs disabled:opacity-60 flex items-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{updatingStatus ? 'Updating...' : 'Mark as Delivered (→ Delivered)'}</span>
                  </button>
                )}

                {currentStatus === 'Delivered' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Order fulfilled and completed
                  </span>
                )}

                {currentStatus === 'Cancelled' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-800 bg-rose-100/60 px-3 py-1.5 rounded-full">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Order cancelled — no further transitions
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Customer & Delivery Address Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Customer Details */}
            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Customer Information
              </h4>
              <p className="text-sm font-semibold text-[#222222]">
                {order.customer?.fullName || 'Anonymous Customer'}
              </p>
              <div className="text-xs text-[#6B6B6B] space-y-0.5">
                <p>Email: <strong className="text-[#222222]">{order.customer?.email}</strong></p>
                <p>Phone: <strong className="text-[#222222]">{order.customer?.phone || '—'}</strong></p>
                <p>Payment: <strong className="text-[#222222]">{order.paymentMethod}</strong></p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Shipping Address
              </h4>
              <div className="text-xs text-[#444444] space-y-0.5">
                <p className="font-medium text-[#222222]">{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>

          </div>

          {/* Section 2: Order Items Table */}
          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <h3 className="text-sm font-semibold text-[#222222]">
                Order Items ({totalItemCount})
              </h3>
            </div>

            <div className="divide-y divide-black/[0.05]">
              {items.map((item, idx) => {
                const product = item.product || {};
                const name = product.name || item.name || `Product #${item.productId}`;
                const image = product.image || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
                const unitPrice = item.unitPrice || product.price || 0;
                const lineTotal = item.lineTotal || unitPrice * item.quantity;

                return (
                  <div key={item.id || idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-black/5 shrink-0">
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#222222] truncate max-w-xs">
                          {name}
                        </p>
                        <p className="text-[11px] text-[#6B6B6B]">
                          Qty: <strong>{item.quantity}</strong> × {formatPrice(unitPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-[#222222]">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-black/[0.06] space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Subtotal:</span>
                <span className="font-medium text-[#222222]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Delivery:</span>
                <span className="font-medium text-[#222222]">
                  {order.deliveryCost === 0 ? 'Free' : formatPrice(order.deliveryCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#222222] pt-2 border-t border-black/[0.06]">
                <span>Total Amount:</span>
                <span>{formatPrice(order.total || order.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-[#FAF8F4] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-black/10 bg-white hover:bg-stone-50 text-[#222222] text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
