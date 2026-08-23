import React, { useState } from 'react';
import { 
  Heart, 
  Star, 
  ShoppingBag, 
  Scale, 
  Bell, 
  ArrowLeft, 
  Check, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import products from '../data/products';

export default function ProductDetails({ productId, compareIds = [], onToggleCompare }) {
  // Temporary UI action feedback states
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTracked, setIsTracked] = useState(false);

  // Find the selected product from data by numeric ID
  const product = products.find((p) => p.id === Number(productId));

  // Determine if this product is currently selected for comparison
  const isComparing = product ? compareIds.includes(product.id) : false;

  // Handle Invalid Product ID State
  if (!product) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center mx-auto mb-4 text-[#6B6B6B]">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Product not found.
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2">
            We couldn't find the product you're looking for. It may have been moved or removed.
          </p>
          <a
            href="#products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </a>
        </div>
      </div>
    );
  }

  // Format INR Currency
  const formattedPrice =
    typeof product.price === 'number'
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(product.price)
      : product.price;

  // Filter Related Products (same category, excluding current product, max 3)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Temporary UI interaction handlers
  const handleAddToCart = () => {
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2200);
  };

  const handleToggleWishlist = () => {
    setIsWishlisted((prev) => !prev);
  };

  const handleToggleTrackPrice = () => {
    setIsTracked((prev) => !prev);
  };

  return (
    <div className="bg-[#FAF8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Breadcrumb / Back Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-[#6B6B6B] mb-8 sm:mb-12">
          <a 
            href="#products" 
            className="hover:text-[#D86F5C] transition-colors duration-150 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Products</span>
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-black/30 shrink-0" />
          <span className="text-[#6B6B6B]">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-black/30 shrink-0" />
          <span className="text-[#222222] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product Information Main Grid (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Product Image (45% / 5-6 cols on desktop) */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden bg-white border border-black/5 shadow-xs aspect-[4/3] sm:aspect-square w-full">
              <img
                src={product.image}
                alt={`${product.name} product image`}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>

          {/* Right Column: Product Metadata & Primary Actions (55% / 6-7 cols on desktop) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col text-left">
            
            {/* Category Label */}
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2.5">
              {product.category}
            </p>

            {/* Product Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1] mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {typeof product.rating === 'number' && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#222222] mb-4">
                <Star className="w-4 h-4 fill-[#222222] text-[#222222]" />
                <span>{product.rating.toFixed(1)} rating</span>
              </div>
            )}

            {/* Short Description */}
            <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mb-6 max-w-xl">
              {product.description}
            </p>

            {/* Price & Price Status Block */}
            <div className="py-4 border-y border-black/[0.06] mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#222222]">
                  {formattedPrice}
                </span>

                {product.priceStatus && (
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {product.priceStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Primary: Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`h-12 px-8 rounded-xl font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xs transition duration-150 active:scale-[0.98] ${
                  isAddedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#222222] hover:bg-[#333333] text-white'
                }`}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Secondary: Wishlist Button */}
              <button
                type="button"
                aria-label="Add to wishlist"
                onClick={handleToggleWishlist}
                className={`h-12 w-12 rounded-xl border flex items-center justify-center transition duration-150 active:scale-[0.98] shadow-2xs ${
                  isWishlisted
                    ? 'border-[#D86F5C] bg-[#FAF8F4] text-[#D86F5C]'
                    : 'border-black/10 bg-white hover:border-[#D86F5C] text-[#222222] hover:text-[#D86F5C]'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-[#D86F5C]' : ''}`}
                />
              </button>

              {/* Secondary: Compare Button */}
              <button
                type="button"
                onClick={() => onToggleCompare && onToggleCompare(product.id)}
                className={`h-12 px-5 rounded-xl border text-sm font-medium flex items-center gap-2 transition duration-150 active:scale-[0.98] shadow-2xs ${
                  isComparing
                    ? 'border-[#D86F5C] bg-[#FAF8F4] text-[#D86F5C]'
                    : 'border-black/10 bg-white hover:bg-stone-50 text-[#222222]'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{isComparing ? 'In Comparison' : '+ Compare'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Section 2: Price Insights & Price Tracking */}
        <section className="mt-16 sm:mt-20 pt-10 sm:pt-14 border-t border-black/[0.06] text-left">
          <div className="max-w-2xl mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#222222] tracking-tight">
              Price insights
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] mt-1.5">
              Understand where this product's current price stands before you buy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Price Position Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-[#6B6B6B] mb-1">
                  Current Price Position
                </p>
                <div className="text-2xl font-semibold text-[#222222] mt-2">
                  {formattedPrice}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-black/[0.05] flex items-center justify-between">
                <span className="text-xs sm:text-sm text-[#6B6B6B]">Price Status</span>
                <span className="text-xs sm:text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {product.priceStatus || 'Current market price'}
                </span>
              </div>
            </div>

            {/* Price Tracker Card (Future PriceAlert Intent) */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#222222] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#D86F5C]" />
                  Want to pay less?
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1.5 leading-relaxed">
                  Set a target price and we'll let you know when this product reaches it.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleToggleTrackPrice}
                  className={`px-4 py-2 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition duration-150 active:scale-95 ${
                    isTracked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#222222] hover:bg-[#333333] text-white'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isTracked ? 'Price Alert Active' : 'Track this price'}</span>
                </button>
                <span className="text-[11px] text-[#6B6B6B]">Free price alerts</span>
              </div>
            </div>

          </div>
        </section>

        {/* Section 3: About this product */}
        <section className="mt-14 sm:mt-18 pt-10 sm:pt-12 border-t border-black/[0.06] text-left">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#222222] tracking-tight mb-4">
            About this product
          </h2>
          <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed max-w-3xl">
            {product.description}
          </p>
        </section>

        {/* Section 4: Related Products ("You may also like") */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-10 sm:pt-14 border-t border-black/[0.06] text-left">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
                  Similar In {product.category}
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#222222] tracking-tight">
                  You may also like
                </h2>
              </div>
              <a
                href="#products"
                className="text-xs sm:text-sm font-medium text-[#222222] hover:text-[#D86F5C] transition-colors"
              >
                Browse all →
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
