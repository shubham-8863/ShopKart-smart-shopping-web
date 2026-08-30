import React from 'react';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { formatPrice } from '../../utils/pricing';

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

export default function OrderCard({ order }) {
  if (!order) return null;

  const items = order.items || [];
  const previewItems = items.slice(0, 3);
  const remainingCount = items.length - 3;
  const totalItemCount =
    order.itemCount || items.reduce((sum, item) => sum + item.quantity, 0);

  const displayCode = order.orderCode || order.id;

  return (
    <article className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200 text-left space-y-5">
      
      {/* Card Header: Order ID, Date & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-base sm:text-lg font-bold text-[#222222]">
              Order #{displayCode}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {order.status || 'Placed'}
            </span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Placed on {formatOrderDate(order.createdAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-[#6B6B6B] block">Total Amount</span>
          <span className="text-base sm:text-lg font-bold text-[#222222]">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Card Body: Purchased Product Thumbnails Preview */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {previewItems.map((item, idx) => {
            const product = item.product || {};
            const productName = product.name || item.name || `Product #${item.productId}`;
            const productImage = product.image || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
            const unitPrice = item.unitPrice || product.price || 0;

            return (
              <div
                key={item.productId || idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF8F4]/70 border border-black/[0.04]"
              >
                <a
                  href={`#product/${item.productId}`}
                  className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-black/5"
                >
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </a>
                <div className="min-w-0 flex-1">
                  <a
                    href={`#product/${item.productId}`}
                    className="text-xs font-medium text-[#222222] hover:text-[#D86F5C] truncate block transition-colors"
                  >
                    {productName}
                  </a>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Qty: {item.quantity} × {formatPrice(unitPrice)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {remainingCount > 0 && (
          <p className="text-xs text-[#6B6B6B] font-medium pt-1">
            + {remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>

      {/* Card Footer: Metadata & View Details Action */}
      <div className="pt-4 border-t border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
          <span>
            Payment: <strong>{order.paymentMethod || 'Cash on Delivery'}</strong>
          </span>
          <span>•</span>
          <span>
            <strong>{totalItemCount}</strong> {totalItemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <a
          href={`#order/${displayCode}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] transition-colors"
        >
          <span>View order</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

    </article>
  );
}
