import React from 'react';
import { Heart, ShoppingBag, User, Search, Menu } from 'lucide-react';

export default function Navbar({ compareCount = 0, cartCount = 0, wishlistCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/85 backdrop-blur-md transition-colors border-b border-black/[0.04]">
      <nav
        aria-label="Main Navigation"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-20 flex items-center justify-between gap-6"
      >
        {/* Brand / Logo */}
        <div className="flex items-center shrink-0">
          <a
            href="#"
            className="group select-none flex items-center gap-2"
            aria-label="ShopKart Home"
          >
            <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#222222] group-hover:text-[#D86F5C] transition-colors duration-200">
              ShopKart
            </span>
          </a>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#products"
            className="text-[15px] font-medium text-[#444444] hover:text-[#D86F5C] transition-colors duration-150"
          >
            Products
          </a>
          <a
            href="#compare"
            className="text-[15px] font-medium text-[#444444] hover:text-[#D86F5C] transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#D86F5C] text-white text-[10px] font-bold flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </a>
        </div>

        {/* Right-Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Link / Button */}
          <a
            href="#wishlist"
            aria-label="Wishlist"
            className="relative hidden sm:flex p-2.5 rounded-full text-[#444444] hover:text-[#D86F5C] hover:bg-black/[0.04] transition duration-150 active:scale-95 items-center justify-center"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D86F5C] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </a>

          {/* Mobile Search Button */}
          <button
            type="button"
            aria-label="Search"
            className="md:hidden p-2.5 rounded-full text-[#444444] hover:text-[#D86F5C] hover:bg-black/[0.04] transition duration-150 active:scale-95"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Shopping Cart Link / Button */}
          <a
            href="#cart"
            aria-label="Shopping cart"
            className="relative p-2.5 rounded-full text-[#444444] hover:text-[#D86F5C] hover:bg-black/[0.04] transition duration-150 active:scale-95 flex items-center justify-center"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D86F5C] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </a>

          {/* Account Button */}
          <button
            type="button"
            aria-label="Account"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-stone-50 text-[#222222] text-sm font-medium transition duration-150 shadow-xs active:scale-95"
          >
            <User className="w-4 h-4 text-[#6B6B6B]" />
            <span>Account</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden p-2.5 rounded-full text-[#444444] hover:text-[#D86F5C] hover:bg-black/[0.04] transition duration-150 active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
