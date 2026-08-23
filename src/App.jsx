import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/home/Hero';
import CategorySection from './components/home/CategorySection';
import FeaturedProducts from './components/home/FeaturedProducts';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Compare from './pages/Compare';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

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
  if (hash === '#cart') {
    return { name: 'cart', productId: null };
  }
  if (hash === '#checkout') {
    return { name: 'checkout', productId: null };
  }
  if (hash === '#order-success') {
    return { name: 'order-success', productId: null };
  }
  return { name: 'home', productId: null };
}

function App() {
  // Hash-based route state
  const [routeInfo, setRouteInfo] = useState(getRouteInfo());

  // Comparison list state (holds up to 3 product IDs)
  const [compareIds, setCompareIds] = useState([]);

  // Cart items state [{ productId: 1, quantity: 1 }]
  const [cartItems, setCartItems] = useState([]);

  // Prototype placed order state for OrderSuccess screen
  const [lastOrder, setLastOrder] = useState(null);

  // Toast feedback notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
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

  // Cart management handlers
  const handleAddToCart = (productId) => {
    const numericId = Number(productId);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === numericId);
      if (existing) {
        return prev.map((item) =>
          item.productId === numericId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: numericId, quantity: 1 }];
    });
    setToastMessage('Added to cart.');
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    const numericId = Number(productId);
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === numericId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    const numericId = Number(productId);
    setCartItems((prev) => prev.filter((item) => item.productId !== numericId));
    setToastMessage('Removed from cart.');
  };

  // Order placement handler
  const handlePlaceOrder = (orderDetails) => {
    setLastOrder(orderDetails);
    setCartItems([]);
    setToastMessage('Order placed successfully.');
  };

  // Compute total quantity of items in cart for the Navbar badge
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222] font-sans antialiased flex flex-col relative">
      <Navbar
        compareCount={compareIds.length}
        cartCount={totalCartCount}
      />

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
            onAddToCart={handleAddToCart}
          />
        ) : routeInfo.name === 'products' ? (
          <Products />
        ) : routeInfo.name === 'compare' ? (
          <Compare
            compareIds={compareIds}
            onRemove={handleRemoveCompare}
            onClear={handleClearCompare}
          />
        ) : routeInfo.name === 'cart' ? (
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
          />
        ) : routeInfo.name === 'checkout' ? (
          <Checkout
            cartItems={cartItems}
            onPlaceOrder={handlePlaceOrder}
          />
        ) : routeInfo.name === 'order-success' ? (
          <OrderSuccess lastOrder={lastOrder} />
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
