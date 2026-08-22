import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Tech for everyday life',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Premium wireless headphones and modern electronic devices',
    colSpan: 'md:col-span-7', // ~58% width on row 1
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Style worth discovering',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    alt: 'Minimal contemporary fashion apparel and accessories',
    colSpan: 'md:col-span-5', // ~42% width on row 1
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    description: 'Make your space yours',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    alt: 'Minimalist modern interior furniture and home living decor',
    colSpan: 'md:col-span-5', // ~42% width on row 2
  },
  {
    id: 'beauty',
    name: 'Beauty',
    description: 'Everyday essentials',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Curated organic skincare and beauty products',
    colSpan: 'md:col-span-7', // ~58% width on row 2
  },
];

export default function CategorySection() {
  return (
    <section className="bg-[#FAF8F4] py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Section Header (Left-aligned) */}
        <div className="max-w-2xl text-left">
          <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-3">
            Explore the collection
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
            Find something you'll love.
          </h2>
          <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-3 sm:mt-4 max-w-[520px]">
            Explore products across categories, compare your options, and discover something worth bringing home.
          </p>
        </div>

        {/* Editorial Asymmetric Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 mt-12 sm:mt-16">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${category.colSpan} relative rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer text-left w-full h-64 sm:h-72 md:h-80 lg:h-[340px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D86F5C]`}
              aria-label={`Explore ${category.name} category`}
            >
              {/* Category Image */}
              <img
                src={category.image}
                alt={category.alt}
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                loading="lazy"
              />

              {/* Subtle Bottom Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Category Info */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 lg:p-7 flex items-end justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-normal mt-1">
                    {category.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-[#222222] transition-colors duration-300">
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
