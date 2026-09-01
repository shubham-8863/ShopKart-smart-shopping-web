import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-black/[0.06] text-[#222222]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 sm:py-16">
        
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* 1. Brand Column (span 5 on desktop) */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-4 text-left">
            <a
              href="#"
              className="inline-block group select-none"
              aria-label="ShopKart Home"
            >
              <span className="text-2xl font-bold tracking-tight text-[#222222] group-hover:text-[#D86F5C] transition-colors duration-200">
                ShopKart
              </span>
            </a>
            
            <p className="text-sm font-medium text-[#222222]">
              Smart shopping, thoughtfully designed.
            </p>

            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed max-w-sm">
              A full-stack e-commerce project featuring dynamic catalog discovery, server-authoritative checkout, automated price alerts, and verified customer ratings.
            </p>
          </div>

          {/* 2. Shop Navigation Column (span 2 on desktop) */}
          <nav aria-label="Shop navigation" className="lg:col-span-2 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#222222] mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#products"
                  className="text-sm text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D86F5C]"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="#compare"
                  className="text-sm text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D86F5C]"
                >
                  Compare
                </a>
              </li>
            </ul>
          </nav>

          {/* 3. Account Navigation Column (span 2 on desktop) */}
          <nav aria-label="Account navigation" className="lg:col-span-2 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#222222] mb-4">
              Account
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#account"
                  className="text-sm text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D86F5C]"
                >
                  My Account
                </a>
              </li>
              <li>
                <a
                  href="#orders"
                  className="text-sm text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D86F5C]"
                >
                  Orders
                </a>
              </li>
              <li>
                <a
                  href="#wishlist"
                  className="text-sm text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D86F5C]"
                >
                  Wishlist
                </a>
              </li>
              <li>
                <a
                  href="#cart"
                  className="text-sm text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D86F5C]"
                >
                  Cart
                </a>
              </li>
              <li>
                <a
                  href="#price-alerts"
                  className="text-sm text-[#6B6B6B] hover:text-[#D86F5C] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D86F5C]"
                >
                  Price Alerts
                </a>
              </li>
            </ul>
          </nav>

          {/* 4. Technology & Information Column (span 3 on desktop) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#222222] mb-4">
              About
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
              Built with React, Express & MySQL.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF8F4] border border-black/5 text-[11px] font-medium text-[#6B6B6B] tracking-wide">
                React · Express · MySQL
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Subtle Tagline */}
        <div className="mt-12 pt-8 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#888888]">
          <p>© 2026 ShopKart. All rights reserved.</p>
          <p className="text-[#6B6B6B]">Made for smarter shopping.</p>
        </div>

      </div>
    </footer>
  );
}
