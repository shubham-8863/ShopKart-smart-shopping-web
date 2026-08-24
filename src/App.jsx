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
import Wishlist from './pages/Wishlist';
import PriceAlerts from './pages/PriceAlerts';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Account from './pages/Account';

// Helper to parse hash route information
function getRouteInfo() {
  const hash = window.location.hash;
  if (hash.startsWith('#product/')) {
    const id = hash.replace('#product/', '');
    return { name: 'product-details', productId: id };
  }
  if (hash.startsWith('#order/')) {
    const id = hash.replace('#order/', '');
    return { name: 'order-details', orderId: id };
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
  if (hash === '#wishlist') {
    return { name: 'wishlist', productId: null };
  }
  if (hash === '#price-alerts') {
    return { name: 'price-alerts', productId: null };
  }
  if (hash === '#orders') {
    return { name: 'orders', productId: null };
  }
  if (hash === '#account') {
    return { name: 'account', productId: null };
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

  // Wishlist product IDs state [1, 5, 8]
  const [wishlistIds, setWishlistIds] = useState([]);

  // Price tracking alerts state [{ productId: 1, targetPrice: 27000, isActive: true }]
  const [priceAlerts, setPriceAlerts] = useState([]);

  // Normalized order history collection
  const [orders, setOrders] = useState([]);

  // Latest placed order record for OrderSuccess screen
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

  // Wishlist toggle handler
  const handleToggleWishlist = (productId) => {
    const numericId = Number(productId);
    setWishlistIds((prev) => {
      if (prev.includes(numericId)) {
        setToastMessage('Removed from wishlist.');
        return prev.filter((id) => id !== numericId);
      } else {
        setToastMessage('Added to wishlist.');
        return [...prev, numericId];
      }
    });
  };

  // Price Alert handlers
  const handleSetPriceAlert = (productId, targetPrice) => {
    const numericId = Number(productId);
    const numericTarget = Number(targetPrice);
    setPriceAlerts((prev) => {
      const existing = prev.find((a) => a.productId === numericId);
      if (existing) {
        setToastMessage('Price alert updated.');
        return prev.map((a) =>
          a.productId === numericId
            ? { ...a, targetPrice: numericTarget, isActive: true }
            : a
        );
      } else {
        setToastMessage('Price alert set.');
        return [
          ...prev,
          { productId: numericId, targetPrice: numericTarget, isActive: true },
        ];
      }
    });
  };

  const handleRemovePriceAlert = (productId) => {
    const numericId = Number(productId);
    setPriceAlerts((prev) => prev.filter((a) => a.productId !== numericId));
    setToastMessage('Price tracking stopped.');
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

  // Order placement handler: Creates persistent order record and clears cart
  const handlePlaceOrder = (orderDetails) => {
    const orderId = `SK${1001 + orders.length}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items: orderDetails.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product?.price || 0,
      })),
      customer: orderDetails.customer,
      shippingAddress: orderDetails.shippingAddress,
      paymentMethod: orderDetails.paymentMethod,
      status: 'Placed',
      subtotal: orderDetails.subtotal,
      deliveryCost: orderDetails.deliveryCost,
      delivery: orderDetails.deliveryCost,
      total: orderDetails.total,
      itemCount: orderDetails.itemCount,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    setCartItems([]);
    setToastMessage('Order placed successfully.');
  };

  // Compute active counts for Navbar badges
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const activeAlertCount = priceAlerts.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222] font-sans antialiased flex flex-col relative">
      <Navbar
        compareCount={compareIds.length}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        priceAlertCount={activeAlertCount}
        orderCount={orders.length}
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
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            priceAlerts={priceAlerts}
            onSetPriceAlert={handleSetPriceAlert}
            onRemovePriceAlert={handleRemovePriceAlert}
          />
        ) : routeInfo.name === 'products' ? (
          <Products
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
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
        ) : routeInfo.name === 'wishlist' ? (
          <Wishlist
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        ) : routeInfo.name === 'price-alerts' ? (
          <PriceAlerts
            priceAlerts={priceAlerts}
            onSetPriceAlert={handleSetPriceAlert}
            onRemovePriceAlert={handleRemovePriceAlert}
          />
        ) : routeInfo.name === 'orders' ? (
          <Orders orders={orders} />
        ) : routeInfo.name === 'order-details' ? (
          <OrderDetails orderId={routeInfo.orderId} orders={orders} />
        ) : routeInfo.name === 'account' ? (
          <Account
            orders={orders}
            wishlistIds={wishlistIds}
            priceAlerts={priceAlerts}
            onShowToast={setToastMessage}
          />
        ) : (
          <>
            <Hero />
            <CategorySection />
            <FeaturedProducts
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
