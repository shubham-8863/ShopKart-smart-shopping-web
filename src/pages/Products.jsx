import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  X, 
  Star, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { getProducts } from '../services/api';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
];

const RATING_OPTIONS = [
  { label: 'All ratings', value: 'all' },
  { label: '4.0 & above', value: 4.0 },
  { label: '4.5 & above', value: 4.5 },
  { label: '4.7 & above', value: 4.7 },
];

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating: High to Low', value: 'rating_desc' },
];

export default function Products({ wishlistIds = [], onToggleWishlist }) {
  // Search & Filter UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Backend API State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Check if any filter or search query is currently active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All Categories' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minRating !== 'all' ||
    sortBy !== 'recommended';

  // Reset all filters to default state
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('all');
    setSortBy('recommended');
  };

  // Fetch products from the REST API when query or filters change
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    // Debounce search typing by 250ms; other filters execute immediately
    const delay = searchQuery.trim() ? 250 : 0;
    const timeoutId = setTimeout(() => {
      getProducts(
        {
          search: searchQuery,
          category: selectedCategory,
          minPrice,
          maxPrice,
          minRating,
          sortBy,
        },
        controller.signal
      )
        .then((data) => {
          if (isMounted) {
            setProducts(data);
            setLoading(false);
            setError(null);
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          if (isMounted) {
            console.error('Error fetching products from API:', err);
            setError(err.message || 'Unable to load products.');
            setLoading(false);
          }
        });
    }, delay);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [
    searchQuery,
    selectedCategory,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    retryKey,
  ]);

  const productCountText = `${products.length} ${
    products.length === 1 ? 'product' : 'products'
  }`;

  return (
    <div className="bg-[#FAF8F4] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="max-w-2xl text-left mb-8 sm:mb-12">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            The Collection
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
            Find something worth bringing home.
          </h1>
          <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-3 sm:mt-4">
            Browse, compare, and discover products across categories — all in one place.
          </p>
        </div>

        {/* Global Search Input Box */}
        <div className="mb-10 sm:mb-12 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-10 py-3 rounded-full border border-black/10 bg-white text-[#222222] placeholder:text-[#6B6B6B]/70 text-sm sm:text-base focus:outline-none focus:border-[#D86F5C] focus:ring-1 focus:ring-[#D86F5C]/40 shadow-xs transition duration-150"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B] pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B6B6B] hover:text-[#222222] rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Toggle Button */}
        <div className="lg:hidden flex items-center justify-between gap-4 mb-6 pb-4 border-b border-black/[0.05]">
          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 bg-white text-[#222222] text-sm font-medium shadow-xs active:scale-95 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D86F5C]" />
            <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#D86F5C]" />
            )}
          </button>

          <span className="text-sm text-[#6B6B6B] font-medium">
            {!loading && productCountText}
          </span>
        </div>

        {/* Discovery Layout: 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Filter Panel (25% / 3 cols on desktop) */}
          <aside
            className={`lg:col-span-3 ${
              showMobileFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-7 text-left">
              
              {/* Filter Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
                <h2 className="text-base font-semibold text-[#222222] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#D86F5C]" />
                  Filters
                </h2>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs font-medium text-[#D86F5C] hover:underline flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* 1. Category Filter */}
              <div>
                <h3 className="text-xs font-medium tracking-wider uppercase text-[#6B6B6B] mb-3">
                  Category
                </h3>
                <div className="space-y-1.5">
                  {CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition duration-150 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#FAF8F4] text-[#222222] font-semibold border-l-2 border-[#D86F5C]'
                            : 'text-[#6B6B6B] hover:text-[#222222] hover:bg-stone-50'
                        }`}
                      >
                        <span>{category}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D86F5C]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Range Filter */}
              <div className="pt-2 border-t border-black/[0.05]">
                <h3 className="text-xs font-medium tracking-wider uppercase text-[#6B6B6B] mb-3">
                  Price Range (₹)
                </h3>
                <div className="grid grid-cols-2 gap-2.5 items-center">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6B6B]">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-black/10 bg-[#FAF8F4] text-[#222222] placeholder:text-[#6B6B6B]/60 text-xs sm:text-sm focus:outline-none focus:border-[#D86F5C]"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6B6B]">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-black/10 bg-[#FAF8F4] text-[#222222] placeholder:text-[#6B6B6B]/60 text-xs sm:text-sm focus:outline-none focus:border-[#D86F5C]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Minimum Rating Filter */}
              <div className="pt-2 border-t border-black/[0.05]">
                <h3 className="text-xs font-medium tracking-wider uppercase text-[#6B6B6B] mb-3">
                  Minimum Rating
                </h3>
                <div className="space-y-1.5">
                  {RATING_OPTIONS.map((option) => {
                    const isSelected = minRating === option.value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setMinRating(option.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition duration-150 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#FAF8F4] text-[#222222] font-semibold border-l-2 border-[#D86F5C]'
                            : 'text-[#6B6B6B] hover:text-[#222222] hover:bg-stone-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {option.value !== 'all' && (
                            <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                          )}
                          {option.label}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D86F5C]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset Action Link */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-black/[0.05]">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="w-full py-2 px-3 text-xs font-medium text-[#222222] hover:text-[#D86F5C] bg-[#FAF8F4] hover:bg-stone-100 rounded-lg transition duration-150"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

            </div>
          </aside>

          {/* Right Column: Results & Product Grid (75% / 9 cols on desktop) */}
          <section className="lg:col-span-9 flex flex-col">
            
            {/* Results Header: Count & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-black/[0.04]">
              <div className="text-left">
                <span className="text-base font-semibold text-[#222222]">
                  {loading ? 'Searching products...' : productCountText}
                </span>
                {!loading && selectedCategory !== 'All Categories' && (
                  <span className="text-xs text-[#6B6B6B] ml-2">
                    in <strong className="text-[#222222]">{selectedCategory}</strong>
                  </span>
                )}
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <label
                  htmlFor="sort-select"
                  className="text-xs text-[#6B6B6B] uppercase tracking-wider font-medium shrink-0"
                >
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs sm:text-sm font-medium text-[#222222] focus:outline-none focus:border-[#D86F5C] shadow-2xs transition"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-white rounded-2xl border border-rose-200/80 p-8 sm:p-12 text-center my-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200/50 flex items-center justify-center mx-auto mb-4 text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-[#222222]">
                  Unable to load products.
                </h3>
                <p className="text-sm text-[#6B6B6B] mt-2 max-w-md mx-auto">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Loading State Skeleton */}
            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-black/5 p-4 flex flex-col justify-between animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-stone-100 rounded-xl mb-4" />
                    <div className="h-4 bg-stone-100 rounded w-1/3 mb-2" />
                    <div className="h-5 bg-stone-100 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-stone-100 rounded w-full mb-4" />
                    <div className="flex items-center justify-between pt-3 border-t border-black/[0.04]">
                      <div className="h-5 bg-stone-100 rounded w-1/3" />
                      <div className="h-4 bg-stone-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Grid (Loaded successfully) */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
            )}

            {/* Empty Results State */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-2xl border border-black/5 p-12 sm:p-16 text-center my-4 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F4] flex items-center justify-center mx-auto mb-4 text-[#6B6B6B]">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#222222]">
                  No products found.
                </h3>
                <p className="text-sm text-[#6B6B6B] mt-2 max-w-sm mx-auto">
                  We couldn't find any products matching your active search and filter criteria.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-6 px-5 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </section>

        </div>

      </div>
    </div>
  );
}
