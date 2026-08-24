import React, { useState } from 'react';
import { 
  Bell, 
  ArrowRight, 
  TrendingDown, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import products from '../data/products';
import { formatPrice } from '../utils/pricing';

export default function PriceAlerts({
  priceAlerts = [],
  onSetPriceAlert,
  onRemovePriceAlert,
}) {
  const [editingProductId, setEditingProductId] = useState(null);
  const [editTargetInput, setEditTargetInput] = useState('');
  const [editError, setEditError] = useState('');

  // Resolve active alerts against mock product dataset
  const activeAlerts = priceAlerts
    .map((alert) => ({
      ...alert,
      product: products.find((p) => p.id === Number(alert.productId)),
    }))
    .filter((a) => Boolean(a.product && a.isActive));

  const handleStartEdit = (alert) => {
    setEditingProductId(alert.product.id);
    setEditTargetInput(alert.targetPrice.toString());
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditTargetInput('');
    setEditError('');
  };

  const handleSaveEdit = (e, product) => {
    e.preventDefault();
    const target = Number(editTargetInput);

    if (!editTargetInput.trim() || isNaN(target) || target <= 0) {
      setEditError('Please enter a valid numeric target price.');
      return;
    }

    if (target >= product.price) {
      setEditError('Target price must be below current price.');
      return;
    }

    if (onSetPriceAlert) {
      onSetPriceAlert(product.id, target);
    }
    setEditingProductId(null);
    setEditError('');
  };

  // Empty Price Alerts State
  if (activeAlerts.length === 0) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Price Tracking
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#6B6B6B] shadow-xs">
            <Bell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Nothing being tracked yet.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Set a target price on a product and we'll keep it on your radar.
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
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 text-left">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
              Price Tracking
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
              Keep an eye on the price.
            </h1>
            <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2">
              Track products you care about and set a price worth waiting for.
            </p>
          </div>

          <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] shrink-0">
            <span>
              {activeAlerts.length} {activeAlerts.length === 1 ? 'product' : 'products'} being tracked
            </span>
          </div>
        </div>

        {/* Tracked Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {activeAlerts.map((alert) => {
            const { product } = alert;
            const diff = product.price - alert.targetPrice;
            const discountPct = Math.round((diff / product.price) * 100);
            const isEditingThis = editingProductId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-black/5 p-6 sm:p-7 shadow-xs flex flex-col justify-between text-left relative group transition hover:shadow-md"
              >
                <div>
                  {/* Top Row: Thumbnail, Title, Category */}
                  <div className="flex items-start gap-4 pb-4 border-b border-black/[0.05]">
                    <a
                      href={`#product/${product.id}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-black/5"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </a>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[11px] font-medium tracking-wider uppercase text-[#D86F5C]">
                          {product.category}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      </div>

                      <a
                        href={`#product/${product.id}`}
                        className="text-base sm:text-lg font-semibold text-[#222222] hover:text-[#D86F5C] line-clamp-1 transition-colors leading-snug"
                      >
                        {product.name}
                      </a>

                      <p className="text-xs text-[#6B6B6B] mt-1">
                        Current: <strong>{formatPrice(product.price)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Price Comparison / Target Information */}
                  <div className="py-4 space-y-3">
                    {isEditingThis ? (
                      /* Inline Target Price Edit Form */
                      <form
                        onSubmit={(e) => handleSaveEdit(e, product)}
                        className="p-3.5 rounded-xl bg-[#FAF8F4] border border-black/[0.06] space-y-3"
                      >
                        <div>
                          <label className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                            New Target Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6B6B]">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={editTargetInput}
                              onChange={(e) => {
                                setEditTargetInput(e.target.value);
                                if (editError) setEditError('');
                              }}
                              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-black/10 text-xs sm:text-sm text-[#222222] bg-white focus:outline-none focus:border-[#D86F5C]"
                            />
                          </div>
                          {editError && (
                            <p className="text-xs text-rose-600 mt-1">{editError}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium inline-flex items-center gap-1 shadow-xs transition"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-[#222222] text-xs font-medium transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Target Price Summary & Visual Bar */
                      <div>
                        <div className="flex items-baseline justify-between text-left mb-1.5">
                          <span className="text-xs text-[#6B6B6B]">Your Target Price</span>
                          <span className="text-lg font-bold text-[#222222]">
                            {formatPrice(alert.targetPrice)}
                          </span>
                        </div>

                        {/* Progress / Relationship Visual Indicator */}
                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mb-2">
                          <div
                            className="bg-[#D86F5C] h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(10, ((alert.targetPrice / product.price) * 100))
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                          <span>
                            Waiting for: <strong>{formatPrice(diff)} less</strong> ({discountPct}% drop)
                          </span>
                          <span>Goal: {formatPrice(alert.targetPrice)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3.5 border-t border-black/[0.05] flex items-center justify-between text-xs font-medium">
                  <a
                    href={`#product/${product.id}`}
                    className="text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1 transition"
                  >
                    <span>View product</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-3">
                    {!isEditingThis && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(alert)}
                        className="text-[#222222] hover:text-[#D86F5C] inline-flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onRemovePriceAlert && onRemovePriceAlert(product.id)
                      }
                      className="text-[#6B6B6B] hover:text-rose-600 inline-flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Stop tracking</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
