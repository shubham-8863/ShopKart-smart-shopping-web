import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import products from '../../data/products';
import { getProducts } from '../../services/api';

export default function FeaturedProducts({ wishlistIds = [], onToggleWishlist }) {
  const [featuredProducts, setFeaturedProducts] = useState(products.slice(0, 4));

  useEffect(() => {
    let isMounted = true;
    getProducts()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setFeaturedProducts(data.slice(0, 4));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch featured products:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-[#FAF8F4] py-20 sm:py-24 lg:py-28 border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-xl text-left">
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
              Featured Picks
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
              Worth a closer look.
            </h2>
            <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-3 sm:mt-4">
              Explore a few standout products selected for their value, quality, and everyday usefulness.
            </p>
          </div>

          {/* View All Products Action */}
          <div className="shrink-0">
            <a
              href="#products"
              className="group inline-flex items-center gap-2 text-sm sm:text-[15px] font-medium text-[#222222] hover:text-[#D86F5C] transition-colors duration-150"
            >
              <span>View all products</span>
              <ArrowRight className="w-4 h-4 text-[#D86F5C] group-hover:translate-x-1 transition-transform duration-150" />
            </a>
          </div>
        </div>

        {/* 4-Column Responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
