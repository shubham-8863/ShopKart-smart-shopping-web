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
  X,
  LogIn,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { formatPrice } from '../utils/pricing';

export default function PriceAlerts({
  priceAlerts = [],
  currentUser = null,
  loading = false,
  error = null,
  onRetry,
  onSetPriceAlert,
  onRemovePriceAlert,
}) {
  const [editingProductId, setEditingProductId] = useState(null);
  const [editTargetInput, setEditTargetInput] = useState('');
  const [editError, setEditError] = useState('');

  /* ==========================================================================
     1. Unauthenticated Prompt
     ========================================================================== */
  if (!currentUser) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Price Tracking
          </p>
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#D86F5C] shadow-xs">
            <Bell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Sign in to track prices.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Set a target price and keep the products you care about on your radar.
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
            Unable to load your price alerts.
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
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 space-y-6">
          <div className="h-4 bg-stone-200/70 rounded w-32 animate-pulse" />
          <div className="h-10 bg-stone-200/70 rounded w-72 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/5 p-6 h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     4. Empty State
     ========================================================================== */
  if (priceAlerts.length === 0) {
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

  // Edit Handlers
  const handleStartEdit = (alert) => {
    setEditingProductId(alert.productId);
    setEditTargetInput(alert.targetPrice.toString());
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditTargetInput('');
    setEditError('');
  };

  const handleSaveEdit = async (e, alert) => {
    e.preventDefault();
    const target = Number(editTargetInput);

    if (!editTargetInput.trim() || isNaN(target) || target <= 0) {
      setEditError('Please enter a valid numeric target price.');
      return;
    }

    if (target >= alert.currentPrice) {
      setEditError('Target price must be below current price.');
      return;
    }

    if (onSetPriceAlert) {
      const success = await onSetPriceAlert(alert.productId, target);
      if (success) {
        setEditingProductId(null);
        setEditError('');
      }
    }
  };

  const activeCount = priceAlerts.filter((a) => a.isActive).length;

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
              {activeCount} {activeCount === 1 ? 'product' : 'products'} actively tracked
            </span>
          </div>
        </div>

        {/* Tracked Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {priceAlerts.map((alert) => {
            const diff = alert.currentPrice - alert.targetPrice;
            const isTriggered = alert.isTriggered || alert.targetReached;
            const isActive = alert.isActive && !isTriggered;
            const isEditingThis = editingProductId === alert.productId;
            const dropPct = Math.round(((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100);

            return (
              <div
                key={alert.productId}
                className={`bg-white rounded-2xl border ${
                  isTriggered ? 'border-amber-200 bg-amber-50/20' : 'border-black/5'
                } p-6 sm:p-7 shadow-xs flex flex-col justify-between text-left relative group transition hover:shadow-md`}
              >
                <div>
                  {/* Top Row: Thumbnail, Title, Category */}
                  <div className="flex items-start gap-4 pb-4 border-b border-black/[0.05]">
                    <a
                      href={`#product/${alert.productId}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-black/5"
                    >
                      <img
                        src={alert.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                        alt={alert.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </a>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[11px] font-medium tracking-wider uppercase text-[#D86F5C]">
                          {alert.category || 'Product'}
                        </p>
                        {isTriggered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full shrink-0">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Target Reached
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        )}
                      </div>

                      <a
                        href={`#product/${alert.productId}`}
                        className="text-base sm:text-lg font-semibold text-[#222222] hover:text-[#D86F5C] line-clamp-1 transition-colors leading-snug"
                      >
                        {alert.name}
                      </a>

                      <p className="text-xs text-[#6B6B6B] mt-1">
                        Current Price: <strong>{formatPrice(alert.currentPrice)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Price Comparison / Target Information */}
                  <div className="py-4 space-y-3">
                    {isEditingThis ? (
                      /* Inline Target Price Edit Form */
                      <form
                        onSubmit={(e) => handleSaveEdit(e, alert)}
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
                    ) : isTriggered ? (
                      /* Triggered Summary */
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs space-y-1">
                        <p className="font-semibold text-amber-900">
                          Target Price Reached!
                        </p>
                        <p className="text-[#6B6B6B]">
                          Your target was {formatPrice(alert.targetPrice)}. The current price is {formatPrice(alert.currentPrice)}.
                        </p>
                      </div>
                    ) : (
                      /* Active Target Summary */
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
                                Math.max(10, (alert.targetPrice / alert.currentPrice) * 100)
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                          <span>
                            Target is <strong>{formatPrice(diff)} below</strong> current price ({dropPct}%)
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
                    href={`#product/${alert.productId}`}
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
                        <span>{isTriggered ? 'Set new target' : 'Edit'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onRemovePriceAlert && onRemovePriceAlert(alert.productId)
                      }
                      className="text-[#6B6B6B] hover:text-rose-600 inline-flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isTriggered ? 'Dismiss' : 'Stop tracking'}</span>
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
