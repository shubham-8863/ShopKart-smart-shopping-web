import React from 'react';
import { Search, Heart, ShoppingBag, ArrowRight, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#101313] border-b border-white/10">
      <nav
        aria-label="Main Navigation"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 lg:h-24 flex items-center justify-between gap-6"
      >
        {/* Brand / Logo */}
        <div className="flex items-center shrink-0">
          <a
            href="#"
            className="group select-none"
            aria-label="ShopKart Home"
          >
            <span className="text-xl sm:text-2xl font-semibold tracking-[0.2em] uppercase text-[#E8EEF0] group-hover:text-white transition-colors duration-200">
              SHOPKART
            </span>
          </a>
        </div>

        {/* Center: Navigation Links & Search */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {/* Understated Text Navigation Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <a
              href="#products"
              className="text-sm font-medium text-[#9BA7AA] hover:text-[#E8EEF0] transition-colors duration-150"
            >
              Products
            </a>
            <a
              href="#compare"
              className="text-sm font-medium text-[#9BA7AA] hover:text-[#E8EEF0] transition-colors duration-150"
            >
              Compare
            </a>
          </div>

          {/* Integrated Dark Editorial Search Field */}
          <div className="relative w-56 lg:w-72">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2 rounded-full border border-white/10 bg-[#151919] text-[#E8EEF0] placeholder:text-[#9BA7AA]/60 text-xs sm:text-sm focus:outline-none focus:border-white/25 transition duration-150"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA7AA] pointer-events-none" />
          </div>
        </div>

        {/* Right-Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Icon Button */}
          <button
            type="button"
            aria-label="Wishlist"
            className="hidden sm:flex p-2.5 rounded-full text-[#9BA7AA] hover:text-[#E8EEF0] hover:bg-white/5 transition duration-150 active:scale-95"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Mobile Search Button */}
          <button
            type="button"
            aria-label="Search"
            className="md:hidden p-2.5 rounded-full text-[#9BA7AA] hover:text-[#E8EEF0] hover:bg-white/5 transition duration-150 active:scale-95"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Shopping Cart Icon Button */}
          <button
            type="button"
            aria-label="Shopping cart"
            className="p-2.5 rounded-full text-[#9BA7AA] hover:text-[#E8EEF0] hover:bg-white/5 transition duration-150 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Account CTA Button */}
          <button
            type="button"
            aria-label="Account"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#303536] hover:bg-[#3d4344] text-[#E8EEF0] text-xs sm:text-sm font-medium transition duration-150 active:scale-95 ml-1"
          >
            <span>Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden p-2.5 rounded-full text-[#9BA7AA] hover:text-[#E8EEF0] hover:bg-white/5 transition duration-150 active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
