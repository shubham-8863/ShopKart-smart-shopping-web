import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#DCEFF0]/25 via-[#FAF8F4] to-[#F7DED0]/20 flex items-center py-12 sm:py-16 lg:py-20 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">
          
          {/* Left Column: Eyebrow, Heading, Description & CTAs (approx 42-45% width on desktop) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center text-left">
            {/* Eyebrow Text */}
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-4 sm:mb-5">
              Smarter shopping, simplified
            </p>

            {/* Main Heading in Sentence Case */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] xl:text-[66px] font-semibold text-[#222222] tracking-tight leading-[1.02] max-w-[480px]">
              Shop smart.<br />
              Buy better.
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed mt-5 sm:mt-6 max-w-[460px]">
              Compare products, discover better options, and track prices before you buy.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 mt-8 sm:mt-10">
              <a
                href="#products"
                className="h-12 px-7 rounded-[11px] bg-[#222222] hover:bg-[#333333] text-white font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2.5 shadow-xs transition duration-150 active:scale-[0.98]"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </a>

              <a
                href="#compare"
                className="h-12 px-7 rounded-[11px] border border-black/15 bg-transparent hover:bg-black/[0.03] text-[#222222] font-medium text-sm sm:text-base inline-flex items-center justify-center transition duration-150 active:scale-[0.98]"
              >
                Compare Products
              </a>
            </div>
          </div>

          {/* Right Column: Dominant Editorial Lifestyle Image (approx 55-58% width on desktop) */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm border border-black/[0.04] bg-stone-100 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80"
                alt="Curated lifestyle products in a modern marketplace setting"
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
