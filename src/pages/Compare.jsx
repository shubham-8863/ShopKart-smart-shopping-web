import React, { useMemo } from 'react';
import { Scale, X, ArrowRight, Plus, Star, TrendingDown, ArrowLeft } from 'lucide-react';
import products from '../data/products';

// Helper to convert camelCase keys (e.g., "skinType", "keyIngredient") to clean title strings
function formatSpecLabel(key) {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Helper to format currency
function formatPrice(price) {
  return typeof price === 'number'
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(price)
    : price;
}

export default function Compare({ compareIds = [], onRemove, onClear }) {
  // Retrieve selected product objects from dataset
  const compareProducts = useMemo(() => {
    return compareIds
      .map((id) => products.find((p) => p.id === Number(id)))
      .filter(Boolean);
  }, [compareIds]);

  // Dynamically collect unique specification keys across all selected products
  const allSpecKeys = useMemo(() => {
    const keys = [];
    compareProducts.forEach((product) => {
      if (product.specifications) {
        Object.keys(product.specifications).forEach((key) => {
          if (!keys.includes(key)) {
            keys.push(key);
          }
        });
      }
    });
    return keys;
  }, [compareProducts]);

  // Compute best price and best rating for subtle visual indicators
  const minPrice = useMemo(() => {
    if (compareProducts.length < 2) return null;
    const prices = compareProducts.map((p) => p.price).filter((p) => typeof p === 'number');
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min !== max ? min : null;
  }, [compareProducts]);

  const maxRating = useMemo(() => {
    if (compareProducts.length < 2) return null;
    const ratings = compareProducts.map((p) => p.rating).filter((r) => typeof r === 'number');
    const max = Math.max(...ratings);
    const min = Math.min(...ratings);
    return max !== min ? max : null;
  }, [compareProducts]);

  // Empty Compare State
  if (compareProducts.length === 0) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <div className="w-14 h-14 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 text-[#D86F5C] shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Compare products side by side.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-2 leading-relaxed">
            Choose products you're considering and see their differences at a glance.
          </p>
          <a
            href="#products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
          >
            <span>Explore products</span>
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 text-left">
          <div>
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
              Compare
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
              Choose with confidence.
            </h1>
            <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2 max-w-xl">
              Put products side by side and see what makes each one different.
            </p>
          </div>

          {/* Controls / Clear */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs sm:text-sm text-[#6B6B6B]">
              Comparing <strong>{compareProducts.length}</strong> of 3 max
            </span>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-medium text-[#D86F5C] hover:underline transition"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Single product prompt if only 1 is selected */}
        {compareProducts.length === 1 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-4">
            <span>
              💡 You have selected 1 product. Add up to 2 more to see a full side-by-side comparison.
            </span>
            <a
              href="#products"
              className="font-semibold text-amber-950 underline hover:text-amber-800 shrink-0"
            >
              Add more products →
            </a>
          </div>
        )}

        {/* Comparison Showcase Container */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-xs overflow-hidden">
          
          {/* Top Row: Product Columns */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              
              {/* Product Header Cards Grid */}
              <div className="grid grid-cols-12 border-b border-black/[0.06] bg-[#FAF8F4]/50">
                {/* Blank Header Top-Left Corner */}
                <div className="col-span-3 p-5 sm:p-6 flex flex-col justify-end text-left border-r border-black/[0.06]">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">
                    Products
                  </span>
                </div>

                {/* Product Summary Cards */}
                {compareProducts.map((product) => (
                  <div
                    key={product.id}
                    className="col-span-3 p-5 sm:p-6 flex flex-col justify-between text-left border-r border-black/[0.06] relative group"
                  >
                    {/* Remove Action Button */}
                    <button
                      type="button"
                      onClick={() => onRemove && onRemove(product.id)}
                      aria-label={`Remove ${product.name} from comparison`}
                      className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white border border-black/10 hover:border-black/20 flex items-center justify-center text-[#6B6B6B] hover:text-[#222222] transition duration-150 shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      {/* Image */}
                      <a
                        href={`#product/${product.id}`}
                        className="block aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 mb-4 border border-black/5"
                      >
                        <img
                          src={product.image}
                          alt={`${product.name} preview`}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </a>

                      {/* Category */}
                      <p className="text-[11px] font-medium tracking-wider uppercase text-[#D86F5C] mb-1">
                        {product.category}
                      </p>

                      {/* Product Name */}
                      <a
                        href={`#product/${product.id}`}
                        className="text-sm sm:text-base font-semibold text-[#222222] hover:text-[#D86F5C] line-clamp-2 transition-colors leading-snug"
                      >
                        {product.name}
                      </a>
                    </div>

                    {/* Price & Rating quick glance */}
                    <div className="mt-4 pt-3 border-t border-black/[0.05]">
                      <div className="text-base sm:text-lg font-semibold text-[#222222]">
                        {formatPrice(product.price)}
                      </div>
                      {typeof product.rating === 'number' && (
                        <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Another Product Placeholder Slot (if less than 3 products) */}
                {compareProducts.length < 3 && (
                  <div
                    className={`${
                      compareProducts.length === 1 ? 'col-span-6' : 'col-span-3'
                    } p-6 flex flex-col items-center justify-center text-center border-r border-black/[0.06] bg-stone-50/40`}
                  >
                    <a
                      href="#products"
                      className="w-12 h-12 rounded-full border-2 border-dashed border-black/20 hover:border-[#D86F5C] hover:text-[#D86F5C] flex items-center justify-center text-[#6B6B6B] transition duration-150 mb-3 bg-white"
                    >
                      <Plus className="w-5 h-5" />
                    </a>
                    <span className="text-xs sm:text-sm font-medium text-[#222222]">
                      Add another product
                    </span>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5 max-w-[140px]">
                      Select from catalog to compare side by side
                    </p>
                  </div>
                )}
              </div>

              {/* Detailed Comparison Rows Table */}
              <div className="divide-y divide-black/[0.05] text-left text-xs sm:text-sm">
                
                {/* 1. Price Row */}
                <div className="grid grid-cols-12 items-center hover:bg-stone-50/40 transition">
                  <div className="col-span-3 p-4 sm:p-5 font-semibold text-[#222222] border-r border-black/[0.05]">
                    Price
                  </div>
                  {compareProducts.map((p) => {
                    const isLowest = minPrice !== null && p.price === minPrice;
                    return (
                      <div
                        key={p.id}
                        className="col-span-3 p-4 sm:p-5 border-r border-black/[0.05] flex items-center gap-2"
                      >
                        <span className="font-semibold text-[#222222]">
                          {formatPrice(p.price)}
                        </span>
                        {isLowest && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            Lowest
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {compareProducts.length < 3 && (
                    <div
                      className={`${
                        compareProducts.length === 1 ? 'col-span-6' : 'col-span-3'
                      } p-4 sm:p-5 border-r border-black/[0.05] text-[#9BA7AA]` }
                    >
                      —
                    </div>
                  )}
                </div>

                {/* 2. Rating Row */}
                <div className="grid grid-cols-12 items-center hover:bg-stone-50/40 transition">
                  <div className="col-span-3 p-4 sm:p-5 font-semibold text-[#222222] border-r border-black/[0.05]">
                    Rating
                  </div>
                  {compareProducts.map((p) => {
                    const isHighest = maxRating !== null && p.rating === maxRating;
                    return (
                      <div
                        key={p.id}
                        className="col-span-3 p-4 sm:p-5 border-r border-black/[0.05] flex items-center gap-2"
                      >
                        <div className="flex items-center gap-1 font-medium text-[#222222]">
                          <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                          <span>{p.rating?.toFixed(1) || '—'}</span>
                        </div>
                        {isHighest && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                            Highest
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {compareProducts.length < 3 && (
                    <div
                      className={`${
                        compareProducts.length === 1 ? 'col-span-6' : 'col-span-3'
                      } p-4 sm:p-5 border-r border-black/[0.05] text-[#9BA7AA]`}
                    >
                      —
                    </div>
                  )}
                </div>

                {/* 3. Price Status Row */}
                <div className="grid grid-cols-12 items-center hover:bg-stone-50/40 transition">
                  <div className="col-span-3 p-4 sm:p-5 font-semibold text-[#222222] border-r border-black/[0.05]">
                    Price Status
                  </div>
                  {compareProducts.map((p) => (
                    <div
                      key={p.id}
                      className="col-span-3 p-4 sm:p-5 border-r border-black/[0.05] text-emerald-600 font-medium flex items-center gap-1"
                    >
                      {p.priceStatus ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{p.priceStatus}</span>
                        </>
                      ) : (
                        <span className="text-[#9BA7AA] font-normal">—</span>
                      )}
                    </div>
                  ))}
                  {compareProducts.length < 3 && (
                    <div
                      className={`${
                        compareProducts.length === 1 ? 'col-span-6' : 'col-span-3'
                      } p-4 sm:p-5 border-r border-black/[0.05] text-[#9BA7AA]`}
                    >
                      —
                    </div>
                  )}
                </div>

                {/* 4. Dynamic Category Specifications Rows */}
                {allSpecKeys.map((key) => (
                  <div
                    key={key}
                    className="grid grid-cols-12 items-center hover:bg-stone-50/40 transition"
                  >
                    <div className="col-span-3 p-4 sm:p-5 font-semibold text-[#222222] border-r border-black/[0.05]">
                      {formatSpecLabel(key)}
                    </div>
                    {compareProducts.map((p) => {
                      const val = p.specifications ? p.specifications[key] : null;
                      return (
                        <div
                          key={p.id}
                          className="col-span-3 p-4 sm:p-5 border-r border-black/[0.05] text-[#444444]"
                        >
                          {val || <span className="text-[#9BA7AA]">—</span>}
                        </div>
                      );
                    })}
                    {compareProducts.length < 3 && (
                      <div
                        className={`${
                          compareProducts.length === 1 ? 'col-span-6' : 'col-span-3'
                        } p-4 sm:p-5 border-r border-black/[0.05] text-[#9BA7AA]`}
                      >
                        —
                      </div>
                    )}
                  </div>
                ))}

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
