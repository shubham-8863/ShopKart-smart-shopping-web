import React from 'react';
import { Search, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#DCEFF0]/30 via-[#FAF8F4] to-[#F7DED0]/20 pt-6 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Floating Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full bg-white rounded-full p-2 pl-5 sm:pl-6 shadow-md shadow-stone-300/30 border border-stone-200/80 flex items-center justify-between gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-stone-300/40"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Search className="w-5 h-5 text-[#6B6B6B] shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                className="w-full bg-transparent text-[#222222] placeholder:text-[#6B6B6B]/70 text-sm sm:text-base focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs sm:text-sm font-medium transition duration-150 active:scale-95 shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Hero Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#222222] leading-[1.08] uppercase">
              Shop Smart.
              <br />
              Buy Better.
            </h1>

            <p className="text-base sm:text-lg text-[#6B6B6B] mt-5 max-w-lg leading-relaxed">
              Compare products, track prices, and find the right products without the guesswork.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[12px] bg-[#222222] hover:bg-[#333333] text-white font-medium text-sm sm:text-base shadow-xs transition duration-150 active:scale-95"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#compare"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[12px] border border-black/10 bg-white/70 hover:bg-white text-[#222222] font-medium text-sm sm:text-base transition duration-150 active:scale-95"
              >
                Compare Products
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Lifestyle Product Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-[24px] overflow-hidden shadow-md shadow-stone-300/30 border border-black/[0.04] bg-stone-100 aspect-[4/3] sm:aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
                alt="Curated lifestyle products collection"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
