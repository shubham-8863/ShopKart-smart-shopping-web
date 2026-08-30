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
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Award,
  LogIn
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { getProductById, getProducts, getProductReviews, createReview, getStoredToken } from '../services/api';
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
  currentUser = null,
}) {
  // Product API State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Review & Rating State
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0.0,
    reviewCount: 0,
    userRating: null,
    canRate: false,
    ratings: [],
  });
  const [selectedStar, setSelectedStar] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(null);

  // UI action feedback states
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Price tracking inline edit state
  const [isEditingAlert, setIsEditingAlert] = useState(false);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [alertError, setAlertError] = useState('');
  const [isSavingAlert, setIsSavingAlert] = useState(false);

  // Fetch product details and reviews
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const token = getStoredToken();

    setLoading(true);
    setError(null);
    setIs404(false);

    // 1. Fetch Product
    getProductById(productId, controller.signal)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setLoading(false);
          setError(null);

          // Fetch related products in same category
          if (data && data.category) {
            getProducts({ category: data.category }, controller.signal)
              .then((catProducts) => {
                if (isMounted) {
                  const filtered = catProducts
                    .filter((p) => p.id !== data.id)
                    .slice(0, 3);
                  setRelatedProducts(filtered);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          console.error('Error loading product details:', err);
          setLoading(false);
          if (err.status === 404) {
            setIs404(true);
          } else {
            setError(err.message || 'Unable to load product details.');
          }
        }
      });

    // 2. Fetch Reviews & Eligibility
    getProductReviews(productId, token, controller.signal)
      .then((revData) => {
        if (isMounted && revData) {
          setReviewsData(revData);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Could not load product reviews:', err.message);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [productId, retryKey, currentUser]);

  // Determine if this product is currently selected for comparison / wishlist / price alert
  const isComparing = product ? compareIds.includes(product.id) : false;
  const isWishlisted = product ? wishlistIds.includes(product.id) : false;
  const currentAlert = product
    ? priceAlerts.find((a) => a.productId === product.id)
    : null;

  // Sync target price input when opening edit or when alert/product changes
  useEffect(() => {
    if (currentAlert) {
      setTargetPriceInput(currentAlert.targetPrice.toString());
    } else if (product) {
      const suggested = Math.round(product.price * 0.9);
      setTargetPriceInput(suggested.toString());
    }
    setAlertError('');
  }, [currentAlert, product, isEditingAlert]);

  // Handle Add to Cart action
  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    setIsAddingToCart(true);

    try {
      if (onAddToCart) {
        const success = await onAddToCart(product.id);
        if (success !== false) {
          setIsAddedToCart(true);
          setTimeout(() => setIsAddedToCart(false), 2200);
        }
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle Price Alert submission
  const handleSavePriceAlert = async (e) => {
    e.preventDefault();
    if (!product || isSavingAlert) return;

    if (!currentUser) {
      window.location.hash = '#auth';
      return;
    }

    const target = Number(targetPriceInput);

    if (!targetPriceInput.trim() || isNaN(target) || target <= 0) {
      setAlertError('Please enter a valid numeric target price.');
      return;
    }

    if (target >= product.price) {
      setAlertError('Choose a target price below the current price.');
      return;
    }

    setIsSavingAlert(true);
    setAlertError('');

    try {
      if (onSetPriceAlert) {
        const success = await onSetPriceAlert(product.id, target);
        if (success !== false) {
          setIsEditingAlert(false);
          setAlertError('');
        }
      }
    } catch (err) {
      setAlertError(err.message || 'Unable to set price alert.');
    } finally {
      setIsSavingAlert(false);
    }
  };

  // Handle Rating Submission
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.hash = '#auth';
      return;
    }

    const token = getStoredToken();
    if (!token) return;

    setIsSubmittingRating(true);
    setRatingError(null);
    setRatingSuccess(null);

    try {
      const result = await createReview(
        { productId: product.id, rating: selectedStar },
        token
      );

      // Update product rating and reviews state
      setProduct((prev) => ({
        ...prev,
        rating: result.averageRating,
      }));

      setReviewsData((prev) => ({
        ...prev,
        averageRating: result.averageRating,
        reviewCount: result.reviewCount,
        userRating: result.rating,
        canRate: false,
      }));

      setRatingSuccess('Thank you! Your rating has been submitted.');
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setRatingError(err.message || 'Unable to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Loading State Skeleton
  if (loading) {
    return (
      <div className="bg-[#FAF8F4] py-10 sm:py-16 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="h-4 bg-stone-200/70 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-6 xl:col-span-5 aspect-square bg-stone-200/60 rounded-3xl animate-pulse" />
            <div className="lg:col-span-6 xl:col-span-7 space-y-4">
              <div className="h-4 bg-stone-200/70 rounded w-24 animate-pulse" />
              <div className="h-10 bg-stone-200/70 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-stone-200/70 rounded w-32 animate-pulse" />
              <div className="h-20 bg-stone-200/50 rounded w-full animate-pulse" />
              <div className="h-12 bg-stone-200/70 rounded w-1/3 animate-pulse" />
              <div className="h-14 bg-stone-200/60 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 404 Not Found State
  if (is404 || (!loading && !product && !error)) {
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
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </a>
        </div>
      </div>
    );
  }

  // Network / Server Error State
  if (error) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200/60 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Unable to load product.
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2">
            {error}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 bg-white hover:bg-stone-50 text-[#222222] text-sm font-medium transition duration-150"
            >
              <span>Back to Products</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isTriggered = currentAlert?.isTriggered || currentAlert?.targetReached;
  const isAlertActive = currentAlert?.isActive && !isTriggered;
  const displayRating = product.rating !== null && product.rating !== undefined && product.rating > 0
    ? Number(product.rating).toFixed(1)
    : null;

  return (
    <div className="bg-[#FAF8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Breadcrumb / Back Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-[#6B6B6B] mb-8 sm:mb-12">
          <a href="#products" className="hover:text-[#D86F5C] transition-colors">Products</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#222222] font-medium">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#6B6B6B] truncate max-w-[200px] sm:max-w-md">{product.name}</span>
        </nav>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-black/5 shadow-sm p-4 flex items-center justify-center relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Category Pill Over Image */}
              <div className="absolute top-7 left-7">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#222222] border border-black/5 shadow-2xs">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Pricing, Actions, Specs */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8 text-left">
            
            {/* Title & Rating */}
            <div>
              <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.15]">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                {displayRating ? (
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-[#222222]">
                      {displayRating}
                    </span>
                    {reviewsData.reviewCount > 0 && (
                      <span className="text-xs text-[#6B6B6B]">
                        ({reviewsData.reviewCount} {reviewsData.reviewCount === 1 ? 'rating' : 'ratings'})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-[#6B6B6B] font-medium">
                    No customer ratings yet
                  </span>
                )}
                <span className="text-xs text-[#6B6B6B]">•</span>
                <span className="text-xs text-[#6B6B6B]">
                  {product.inStock ? (
                    <span className="text-emerald-700 font-medium">In Stock ({product.stock} available)</span>
                  ) : (
                    <span className="text-rose-600 font-medium">Out of Stock</span>
                  )}
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-[#222222]">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-[#6B6B6B]">
                  Free standard delivery over ₹2,000
                </span>
              </div>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{product.priceStatus || 'Current market price'}</span>
              </p>
            </div>

            {/* Primary & Secondary Actions Hierarchy */}
            <div className="space-y-3 pt-2">
              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.inStock}
                className={`w-full py-4 px-8 rounded-full font-medium text-base flex items-center justify-center gap-2 shadow-xs transition duration-200 active:scale-[0.98] ${
                  isAddedToCart
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#222222] hover:bg-[#333333] text-white disabled:bg-stone-300 disabled:cursor-not-allowed'
                }`}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart</span>
                  </>
                ) : isAddingToCart ? (
                  <span>Adding...</span>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </>
                )}
              </button>

              {/* Auxiliary Quick Actions: Wishlist & Compare */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                  className={`py-3 px-4 rounded-full border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition duration-150 active:scale-95 shadow-2xs ${
                    isWishlisted
                      ? 'border-[#D86F5C] bg-[#D86F5C]/10 text-[#D86F5C]'
                      : 'border-black/10 bg-white hover:bg-stone-50 text-[#222222]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#D86F5C]' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>

                {/* Compare Button */}
                <button
                  type="button"
                  onClick={() => onToggleCompare && onToggleCompare(product.id)}
                  className={`py-3 px-4 rounded-full border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition duration-150 active:scale-95 shadow-2xs ${
                    isComparing
                      ? 'border-[#222222] bg-[#222222] text-white'
                      : 'border-black/10 bg-white hover:bg-stone-50 text-[#222222]'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                </button>
              </div>
            </div>

            {/* Specifications Card */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-xs space-y-4">
                <h2 className="text-base font-semibold text-[#222222] pb-3 border-b border-black/[0.06]">
                  Specifications
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-sm">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B]">
                        {key}
                      </dt>
                      <dd className="font-medium text-[#222222]">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

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
                {product.priceInsights?.avgPrice && (
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    30-day average: <strong>{formatPrice(product.priceInsights.avgPrice)}</strong>
                  </p>
                )}
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
              
              {isEditingAlert ? (
                <form onSubmit={handleSavePriceAlert} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-[#222222] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#D86F5C]" />
                        {currentAlert ? 'Edit Target Price' : 'Set Target Price'}
                      </h3>
                      <span className="text-xs text-[#6B6B6B]">
                        Current: <strong>{formatPrice(product.price)}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      Set a target price and we'll keep this product on your radar.
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
                      disabled={isSavingAlert}
                      className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium transition duration-150 active:scale-95 shadow-xs disabled:opacity-60"
                    >
                      {isSavingAlert ? 'Saving...' : currentAlert ? 'Update Alert' : 'Set Price Alert'}
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
              ) : isTriggered ? (
                /* Triggered Alert Display */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100/80 border border-amber-300/60 px-2.5 py-0.5 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Target Price Reached
                      </span>
                      <span className="text-xs text-[#6B6B6B]">
                        Current: <strong>{formatPrice(product.price)}</strong>
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-[#444444] space-y-1">
                      <p className="font-semibold text-amber-900">
                        Goal achieved!
                      </p>
                      <p>
                        Your target was {formatPrice(currentAlert.targetPrice)}. The current price is {formatPrice(product.price)}.
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
                      <span>Set new target</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemovePriceAlert && onRemovePriceAlert(product.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B6B] hover:text-rose-600 transition"
                    >
                      <BellOff className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              ) : isAlertActive ? (
                /* Active Alert Display */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Price tracking active
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
                      Set a target price and we'll keep this product on your radar.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          window.location.hash = '#auth';
                        } else {
                          setIsEditingAlert(true);
                        }
                      }}
                      className="px-4 py-2 rounded-full text-xs font-medium inline-flex items-center gap-1.5 bg-[#222222] hover:bg-[#333333] text-white transition duration-150 active:scale-95 shadow-xs"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Track this price</span>
                    </button>
                    <span className="text-[11px] text-[#6B6B6B]">Free price tracking</span>
                  </div>
                </div>
              )}

            </div>

          </div>
        </section>

        {/* Section 3: Verified Customer Rating & Reviews */}
        <section className="mt-14 sm:mt-18 pt-10 sm:pt-12 border-t border-black/[0.06] text-left">
          <div className="max-w-2xl mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#222222] tracking-tight">
              Customer Ratings
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] mt-1.5">
              Genuine feedback submitted by verified customers who purchased this item.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Rating Summary Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">
                    Overall Rating
                  </span>
                  <span className="text-xs text-[#6B6B6B]">
                    {reviewsData.reviewCount} verified {reviewsData.reviewCount === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="text-4xl sm:text-5xl font-bold text-[#222222]">
                    {reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : '—'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            reviewsData.averageRating >= star
                              ? 'fill-amber-400 text-amber-400'
                              : reviewsData.averageRating >= star - 0.5
                              ? 'fill-amber-300 text-amber-300'
                              : 'fill-stone-100 text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[#6B6B6B]">
                      {reviewsData.reviewCount > 0
                        ? `Based on ${reviewsData.reviewCount} customer purchases`
                        : 'No ratings submitted yet'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-black/[0.05] flex items-center gap-2 text-xs text-[#6B6B6B]">
                <Award className="w-4 h-4 text-[#D86F5C] shrink-0" />
                <span>Ratings require verified purchase history</span>
              </div>
            </div>

            {/* Rating Submission / Status Card */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs flex flex-col justify-between">
              
              {!currentUser ? (
                /* Unauthenticated state */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-base font-semibold text-[#222222] mb-1">
                      Have you purchased this item?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                      Sign in to your ShopKart account to rate products from your order history.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-black/[0.05]">
                    <a
                      href="#auth"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium transition active:scale-95 shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#D86F5C]" />
                      <span>Sign in to rate</span>
                    </a>
                  </div>
                </div>
              ) : reviewsData.userRating ? (
                /* User already rated */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Purchase Rating
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Your Rating</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-6 h-6 ${
                                star <= reviewsData.userRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-stone-100 text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-[#222222]">
                          {reviewsData.userRating} / 5
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] text-[#6B6B6B]">
                    Thank you for sharing your genuine feedback.
                  </p>
                </div>
              ) : reviewsData.canRate ? (
                /* Eligible to rate form */
                <form onSubmit={handleSubmitRating} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-[#222222]">
                        Rate this product
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Verified Buyer
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B]">
                      How would you rate your overall experience with this item?
                    </p>
                  </div>

                  {/* Interactive Star Selector */}
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStar(star)}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        className="p-1 text-stone-300 hover:text-amber-400 transition-colors focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 cursor-pointer transition-transform duration-150 active:scale-90 ${
                            (hoverStar || selectedStar) >= star
                              ? 'fill-amber-400 text-amber-400 scale-105'
                              : 'fill-stone-100 text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-semibold text-[#222222] ml-2">
                      {hoverStar || selectedStar} Star{(hoverStar || selectedStar) > 1 ? 's' : ''}
                    </span>
                  </div>

                  {ratingError && (
                    <p className="text-xs text-rose-600">{ratingError}</p>
                  )}

                  {ratingSuccess && (
                    <p className="text-xs text-emerald-600 font-medium">{ratingSuccess}</p>
                  )}

                  <div className="pt-2 border-t border-black/[0.05]">
                    <button
                      type="submit"
                      disabled={isSubmittingRating}
                      className="px-5 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] disabled:bg-stone-300 text-white text-xs font-medium transition duration-150 active:scale-95 shadow-xs"
                    >
                      {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Not purchased yet */
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-base font-semibold text-[#222222] mb-1">
                      Verified Ratings
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
                      Only verified buyers who have completed a purchase of this product can submit ratings.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-black/[0.05] text-[11px] text-[#6B6B6B]">
                    Purchase this product to unlock rating submission.
                  </div>
                </div>
              )}

            </div>

          </div>
        </section>

        {/* Section 4: About this product */}
        <section className="mt-14 sm:mt-18 pt-10 sm:pt-12 border-t border-black/[0.06] text-left">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#222222] tracking-tight mb-4">
            About this product
          </h2>
          <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed max-w-3xl">
            {product.description}
          </p>
        </section>

        {/* Section 5: Related Products ("You may also like") */}
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
