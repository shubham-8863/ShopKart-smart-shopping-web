import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import CategorySection from './components/home/CategorySection';
import FeaturedProducts from './components/home/FeaturedProducts';
import Products from './pages/Products';

function App() {
  // Simple hash-based route state (ready to be replaced by full router later)
  const [currentRoute, setCurrentRoute] = useState(
    window.location.hash === '#products' ? 'products' : 'home'
  );

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#products') {
        setCurrentRoute('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222] font-sans antialiased flex flex-col">
      <Navbar />
      <main className="flex-1">
        {currentRoute === 'products' ? (
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
