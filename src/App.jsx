import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import CategorySection from './components/home/CategorySection';
import FeaturedProducts from './components/home/FeaturedProducts';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';

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
  return { name: 'home', productId: null };
}

function App() {
  // Hash-based route state (seamlessly upgradable to full client router later)
  const [routeInfo, setRouteInfo] = useState(getRouteInfo());

  useEffect(() => {
    const handleHashChange = () => {
      setRouteInfo(getRouteInfo());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222] font-sans antialiased flex flex-col">
      <Navbar />
      <main className="flex-1">
        {routeInfo.name === 'product-details' ? (
          <ProductDetails productId={routeInfo.productId} />
        ) : routeInfo.name === 'products' ? (
          <Products />
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
