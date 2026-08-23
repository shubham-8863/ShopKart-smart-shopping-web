import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import CategorySection from './components/home/CategorySection';
import FeaturedProducts from './components/home/FeaturedProducts';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Compare from './pages/Compare';

// Helper to parse hash route information
function getRouteInfo() {
  const hash = window.location.hash;
  if (hash.startsWith('#product/')) {
    const id = hash.replace('#product/', '');
    return { name: 'product-details', productId: id };
  }
  if (hash === '#products') {
    return { name: 'products', productId: null };
  }
  if (hash === '#compare') {
    return { name: 'compare', productId: null };
  }
  return { name: 'home', productId: null };
}

function App() {
  // Hash-based route state
  const [routeInfo, setRouteInfo] = useState(getRouteInfo());

  // Comparison list state (holds up to 3 product IDs)
  const [compareIds, setCompareIds] = useState([]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null), 3000;
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Route change listener
  useEffect(() => {
    const handleHashChange = () => {
      setRouteInfo(getRouteInfo());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Comparison management handlers
  const handleToggleCompare = (productId) => {
    const numericId = Number(productId);
    if (compareIds.includes(numericId)) {
      setCompareIds((prev) => prev.filter((id) => id !== numericId));
      setToastMessage('Removed from comparison.');
    } else {
      if (compareIds.length >= 3) {
        setToastMessage('You can compare up to 3 products.');
        return;
      }
      setCompareIds((prev) => [...prev, numericId]);
      setToastMessage('Added to comparison.');
    }
  };

  const handleRemoveCompare = (productId) => {
    const numericId = Number(productId);
    setCompareIds((prev) => prev.filter((id) => id !== numericId));
    setToastMessage('Removed from comparison.');
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    setToastMessage('Comparison cleared.');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222] font-sans antialiased flex flex-col relative">
      <Navbar compareCount={compareIds.length} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#222222] text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-lg transition-all transform duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D86F5C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1">
        {routeInfo.name === 'product-details' ? (
          <ProductDetails
            productId={routeInfo.productId}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        ) : routeInfo.name === 'products' ? (
          <Products />
        ) : routeInfo.name === 'compare' ? (
          <Compare
            compareIds={compareIds}
            onRemove={handleRemoveCompare}
            onClear={handleClearCompare}
          />
        ) : (
          <>
            <Hero />
            <CategorySection />
            <FeaturedProducts />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
