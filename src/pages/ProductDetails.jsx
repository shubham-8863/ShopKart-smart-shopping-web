import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Star, 
  ShoppingBag, 
  Scale, 
  Bell, 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  TrendingDown,
  Edit2,
  BellOff,
  CheckCircle2
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import products from '../data/products';
import { formatPrice } from '../utils/pricing';

export default function ProductDetails({
  productId,
  compareIds = [],
  onToggleCompare,
  onAddToCart,
  wishlistIds = [],
  onToggleWishlist,
  priceAlerts = [],
  onSetPriceAlert,
  onRemovePriceAlert,
}) {
  // Temporary UI action feedback states
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Price tracking inline edit state
  const [isEditingAlert, setIsEditingAlert] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [alertError, setAlertError] = useState('');

  // Find the selected product from data by numeric ID
  const product = products.find((p) => p.id === Number(productId));

  // Determine if this product is currently selected for comparison / wishlist / price alert
  const isComparing = product ? compareIds.includes(product.id) : false;
  const isWishlisted = product ? wishlistIds.includes(product.id) : false;
  const currentAlert = product
    ? priceAlerts.find((a) => a.productId === product.id && a.isActive)
    : null;

  // Sync target price input when opening edit or when alert changes
  useEffect(() => {
    if (currentAlert) {
      setTargetPriceInput(currentAlert.targetPrice.toString());
    } else if (product) {
      // Default suggested target (e.g. 10% below current price)
      const suggested = Math.round(product.price * 0.9);
      setTargetPriceInput(suggested.toString());
    }
    setAlertError('');
  }, [currentAlert, product, isEditingAlert]);

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

  // Filter Related Products (same category, excluding current product, max 3)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  // Action handlers
  const handleAddToCart = () => {
    setIsAddedToCart(true);
    if (onAddToCart) {
      onAddToCart(product.id);
    }
    setTimeout(() => setIsAddedToCart(false), 2200);
  };

  const handleSavePriceAlert = (e) => {
    e.preventDefault();
    const target = Number(targetPriceInput);

    if (!targetPriceInput.trim() || isNaN(target) || target <= 0) {
      setAlertError('Please enter a valid numeric target price.');
      return;
    }

    if (target >= product.price) {
      setAlertError('Choose a target price below the current price.');
      return;
    }

    if (onSetPriceAlert) {
      onSetPriceAlert(product.id, target);
    }
    setIsEditingAlert(false);
    setAlertError('');
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
                  {formatPrice(product.price)}
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
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                className={`h-12 px-5 rounded-xl border flex items-center gap-2 transition duration-150 active:scale-[0.98] shadow-2xs text-sm font-medium ${
                  isWishlisted
                    ? 'border-[#D86F5C] bg-[#FAF8F4] text-[#D86F5C]'
                    : 'border-black/10 bg-white hover:border-[#D86F5C] text-[#222222] hover:text-[#D86F5C]'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? 'fill-[#D86F5C] text-[#D86F5C]' : ''}`}
                />
                <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
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
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-black/[0.05] flex items-center justify-between">
                <span className="text-xs sm:text-sm text-[#6B6B6B]">Market Standing</span>
                <span className="text-xs sm:text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {product.priceStatus || 'Current market price'}
                </span>
              </div>
            </div>

            {/* Price Tracker Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
              
              {/* If user is setting / editing target price */}
              {isEditingAlert ? (
                <form onSubmit={handleSavePriceAlert} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-[#222222] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#D86F5C]" />
                        Set Target Price
                      </h3>
                      <span className="text-xs text-[#6B6B6B]">
                        Current: <strong>{formatPrice(product.price)}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      We'll track this product and let you know when it reaches your target.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="targetPriceInput" className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1">
                      Target Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6B6B6B]">
                        ₹
                      </span>
                      <input
                        type="number"
                        id="targetPriceInput"
                        value={targetPriceInput}
                        onChange={(e) => {
                          setTargetPriceInput(e.target.value);
                          if (alertError) setAlertError('');
                        }}
                        placeholder="Enter target price"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-black/10 text-sm text-[#222222] focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/60"
                      />
                    </div>
                    {alertError && (
                      <p className="text-xs text-rose-600 mt-1">{alertError}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium transition duration-150 active:scale-95 shadow-xs"
                    >
                      {currentAlert ? 'Update Alert' : 'Set Price Alert'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingAlert(false);
                        setAlertError('');
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#222222] text-xs font-medium transition duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : currentAlert ? (
                /* Active Alert Display */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Tracking Active
                      </span>
                      <span className="text-xs text-[#6B6B6B]">
                        Current: <strong>{formatPrice(product.price)}</strong>
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Your Target Price</p>
                      <p className="text-2xl font-semibold text-[#222222] mt-0.5">
                        {formatPrice(currentAlert.targetPrice)}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        Target is {formatPrice(product.price - currentAlert.targetPrice)} below current price
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsEditingAlert(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#222222] hover:text-[#D86F5C] transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit target</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemovePriceAlert && onRemovePriceAlert(product.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B6B] hover:text-rose-600 transition"
                    >
                      <BellOff className="w-3.5 h-3.5" />
                      <span>Stop tracking</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Inactive / Default Track CTA */
                <div className="flex flex-col justify-between h-full">
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
                      onClick={() => setIsEditingAlert(true)}
                      className="px-4 py-2 rounded-full text-xs font-medium inline-flex items-center gap-1.5 bg-[#222222] hover:bg-[#333333] text-white transition duration-150 active:scale-95 shadow-xs"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Track this price</span>
                    </button>
                    <span className="text-[11px] text-[#6B6B6B]">Free price alerts</span>
                  </div>
                </div>
              )}

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
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  isWishlisted={wishlistIds.includes(relProduct.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
