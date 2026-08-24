import React from 'react';
import { Heart, Star } from 'lucide-react';

export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
}) {
  if (!product) return null;

  const formattedPrice =
    typeof product.price === 'number'
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(product.price)
      : product.price;

  const handleCardClick = () => {
    window.location.hash = `#product/${product.id}`;
  };

  return (
    <article
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-black/5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full overflow-hidden group cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-50">
        <img
          src={product.image}
          alt={`${product.name} product image`}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              onToggleWishlist(product.id);
            }
          }}
          className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition duration-200 active:scale-95 ${
            isWishlisted
              ? 'bg-white text-[#D86F5C] border border-[#D86F5C]/30 shadow-xs'
              : 'bg-white/90 backdrop-blur-xs text-[#222222] hover:text-[#D86F5C] hover:bg-white'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#D86F5C] text-[#D86F5C]' : ''
            }`}
          />
        </button>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          {product.category && (
            <p className="text-xs font-medium tracking-wider uppercase text-[#D86F5C] mb-1.5">
              {product.category}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-base sm:text-lg font-semibold text-[#222222] leading-snug line-clamp-2">
            {product.name}
          </h3>

          {/* Product Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1.5 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price, Rating & Price Status */}
        <div className="mt-4 pt-3.5 border-t border-black/[0.05]">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-semibold text-[#222222]">
              {formattedPrice}
            </span>

            {typeof product.rating === 'number' && (
              <div className="flex items-center gap-1 text-xs font-medium text-[#222222]">
                <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Price Status (Smart comparison differentiator) */}
          {product.priceStatus && (
            <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
              <span>↓</span>
              <span>{product.priceStatus}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
