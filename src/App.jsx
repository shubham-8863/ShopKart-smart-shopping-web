import React, { useState, useEffect, useCallback } from 'react';
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
import Auth from './pages/Auth';
import { 
  getCurrentUser, 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken,
  getWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  clearCart as clearCartApi,
  createOrder as createOrderApi,
  getOrders as getOrdersApi,
  getPriceAlerts as getPriceAlertsApi,
  createPriceAlert as createPriceAlertApi,
  updatePriceAlert as updatePriceAlertApi,
  deletePriceAlert as deletePriceAlertApi,
} from './services/api';

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
  if (hash === '#auth') {
    return { name: 'auth', productId: null };
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

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Comparison list state (holds up to 3 product IDs)
  const [compareIds, setCompareIds] = useState([]);

  // Server-backed Cart State
  const [cartData, setCartData] = useState({
    items: [],
    subtotal: 0,
    delivery: 0,
    total: 0,
    freeDeliveryThreshold: 2000,
  });
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [updatingCartItemId, setUpdatingCartItemId] = useState(null);

  // Server-backed Wishlist product IDs state [1, 5, 8]
  const [wishlistIds, setWishlistIds] = useState([]);

  // Server-backed Price Alerts state
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [priceAlertsLoading, setPriceAlertsLoading] = useState(false);
  const [priceAlertsError, setPriceAlertsError] = useState(null);

  // Server-backed Order history collection
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Latest placed order record for OrderSuccess screen
  const [lastOrder, setLastOrder] = useState(null);

  // Toast feedback notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Initial Authentication Check on app launch
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          removeStoredToken();
          setCurrentUser(null);
        }
      })
      .catch((err) => {
        console.warn('Initial session restore failed:', err.message);
        removeStoredToken();
        setCurrentUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Fetch Cart helper
  const fetchCart = useCallback(() => {
    const token = getStoredToken();
    if (!token || !currentUser) return;

    setCartLoading(true);
    setCartError(null);

    getCart(token)
      .then((data) => {
        setCartData(data);
        setCartLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching cart:', err);
        setCartError(err.message || 'Unable to load cart.');
        setCartLoading(false);
      });
  }, [currentUser]);

  // Fetch Orders helper
  const fetchOrders = useCallback(() => {
    const token = getStoredToken();
    if (!token || !currentUser) return;

    setOrdersLoading(true);
    setOrdersError(null);

    getOrdersApi(token)
      .then((data) => {
        setOrders(data);
        setOrdersLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
        setOrdersError(err.message || 'Unable to load orders.');
        setOrdersLoading(false);
      });
  }, [currentUser]);

  // Fetch Price Alerts helper
  const fetchPriceAlerts = useCallback(() => {
    const token = getStoredToken();
    if (!token || !currentUser) return;

    setPriceAlertsLoading(true);
    setPriceAlertsError(null);

    getPriceAlertsApi(token)
      .then((data) => {
        setPriceAlerts(data);
        setPriceAlertsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching price alerts:', err);
        setPriceAlertsError(err.message || 'Unable to load price alerts.');
        setPriceAlertsLoading(false);
      });
  }, [currentUser]);

  // Fetch server-backed Wishlist, Cart, Orders, and Price Alerts when authenticated user changes
  useEffect(() => {
    const token = getStoredToken();
    if (currentUser && token) {
      // 1. Load Wishlist
      getWishlist(token)
        .then((res) => {
          if (res && res.wishlistIds) {
            setWishlistIds(res.wishlistIds);
          } else if (res && res.data) {
            setWishlistIds(res.data.map((item) => item.id));
          }
        })
        .catch((err) => {
          console.warn('Could not load user wishlist:', err.message);
        });

      // 2. Load Cart
      fetchCart();

      // 3. Load Orders
      fetchOrders();

      // 4. Load Price Alerts
      fetchPriceAlerts();
    } else if (!currentUser) {
      setWishlistIds([]);
      setCartData({
        items: [],
        subtotal: 0,
        delivery: 0,
        total: 0,
        freeDeliveryThreshold: 2000,
      });
      setCartError(null);
      setCartLoading(false);
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError(null);
      setPriceAlerts([]);
      setPriceAlertsLoading(false);
      setPriceAlertsError(null);
      setLastOrder(null);
    }
  }, [currentUser, fetchCart, fetchOrders, fetchPriceAlerts]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Route change listener: refresh price alerts when navigating to #price-alerts
  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = getRouteInfo();
      setRouteInfo(newRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (newRoute.name === 'price-alerts' && currentUser) {
        fetchPriceAlerts();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, fetchPriceAlerts]);

  // Auth Action Handlers
  const handleAuthSuccess = ({ user, token }) => {
    setStoredToken(token);
    setCurrentUser(user);
    window.location.hash = '#account';
    setToastMessage(`Welcome, ${user.fullName.split(' ')[0]}!`);
  };

  const handleLogout = () => {
    removeStoredToken();
    setCurrentUser(null);
    setWishlistIds([]);
    setCartData({
      items: [],
      subtotal: 0,
      delivery: 0,
      total: 0,
      freeDeliveryThreshold: 2000,
    });
    setOrders([]);
    setPriceAlerts([]);
    setLastOrder(null);
    window.location.hash = '#account';
    setToastMessage('Signed out successfully.');
  };

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

  // Server-backed Wishlist toggle handler
  const handleToggleWishlist = async (productId) => {
    const numericId = Number(productId);
    const token = getStoredToken();
    const isCurrentlyWishlisted = wishlistIds.includes(numericId);

    // Optimistic UI state update
    setWishlistIds((prev) => {
      if (isCurrentlyWishlisted) {
        return prev.filter((id) => id !== numericId);
      } else {
        return [...prev, numericId];
      }
    });

    setToastMessage(isCurrentlyWishlisted ? 'Removed from wishlist.' : 'Added to wishlist.');

    // If authenticated, synchronize with MySQL backend
    if (currentUser && token) {
      try {
        if (isCurrentlyWishlisted) {
          await removeFromWishlistApi(numericId, token);
        } else {
          await addToWishlistApi(numericId, token);
        }
      } catch (err) {
        console.error('Failed to sync wishlist with backend:', err);
        setWishlistIds((prev) => {
          if (isCurrentlyWishlisted) {
            return [...prev, numericId];
          } else {
            return prev.filter((id) => id !== numericId);
          }
        });
        setToastMessage('Could not update wishlist. Please try again.');
      }
    }
  };

  // Server-backed Cart Action Handlers
  const handleAddToCart = async (productId, quantity = 1) => {
    if (!currentUser) {
      setToastMessage('Sign in to add products to your cart.');
      window.location.hash = '#auth';
      return false;
    }

    const token = getStoredToken();
    try {
      const updated = await addToCartApi(productId, quantity, token);
      setCartData(updated);
      setToastMessage('Added to cart.');
      return true;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setToastMessage(err.message || 'Unable to add this product to your cart.');
      return false;
    }
  };

  const handleUpdateCartQuantity = async (productId, newQuantity) => {
    if (!currentUser || newQuantity < 1) return;
    const token = getStoredToken();
    setUpdatingCartItemId(productId);

    try {
      const updated = await updateCartItemApi(productId, newQuantity, token);
      setCartData(updated);
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
      setToastMessage(err.message || 'Unable to update quantity.');
    } finally {
      setUpdatingCartItemId(null);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!currentUser) return;
    const token = getStoredToken();
    setUpdatingCartItemId(productId);

    try {
      const updated = await removeCartItemApi(productId, token);
      setCartData(updated);
      setToastMessage('Removed from cart.');
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setToastMessage(err.message || 'Unable to remove item.');
    } finally {
      setUpdatingCartItemId(null);
    }
  };

  // Server-backed Price Alert Handlers
  const handleSetPriceAlert = async (productId, targetPrice) => {
    if (!currentUser) {
      setToastMessage('Sign in to track prices.');
      window.location.hash = '#auth';
      return false;
    }

    const token = getStoredToken();
    try {
      await createPriceAlertApi(productId, targetPrice, token);
      setToastMessage('Price alert set.');
      fetchPriceAlerts();
      return true;
    } catch (err) {
      console.error('Failed to set price alert:', err);
      setToastMessage(err.message || 'Unable to set price alert.');
      throw err;
    }
  };

  const handleRemovePriceAlert = async (productId) => {
    if (!currentUser) return;
    const token = getStoredToken();

    // Optimistically filter out
    setPriceAlerts((prev) => prev.filter((a) => a.productId !== Number(productId)));

    try {
      await deletePriceAlertApi(productId, token);
      setToastMessage('Price tracking stopped.');
      fetchPriceAlerts();
    } catch (err) {
      console.error('Failed to delete price alert:', err);
      setToastMessage(err.message || 'Unable to stop price tracking.');
      fetchPriceAlerts();
    }
  };

  // Server-backed Order Placement Handler
  const handlePlaceOrder = async (checkoutPayload) => {
    if (!currentUser) {
      setToastMessage('Sign in to place an order.');
      window.location.hash = '#auth';
      return;
    }

    const token = getStoredToken();
    const createdOrder = await createOrderApi(checkoutPayload, token);

    // 1. Update orders state
    setOrders((prev) => [createdOrder, ...prev]);
    setLastOrder(createdOrder);

    // 2. Clear local cart cache (database cart was cleared by transaction)
    setCartData({
      items: [],
      subtotal: 0,
      delivery: 0,
      total: 0,
      freeDeliveryThreshold: 2000,
    });

    setToastMessage('Order placed successfully.');
    window.location.hash = '#order-success';
    return createdOrder;
  };

  // Compute active counts for Navbar badges (count only ACTIVE, untriggered alerts)
  const totalCartCount = (cartData?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const activeAlertCount = priceAlerts.filter((a) => a.isActive && !a.isTriggered && !a.targetReached).length;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#222222] font-sans antialiased flex flex-col relative">
      <Navbar
        compareCount={compareIds.length}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        priceAlertCount={activeAlertCount}
        orderCount={orders.length}
        currentUser={currentUser}
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
            currentUser={currentUser}
          />
        ) : routeInfo.name === 'products' ? (
          <Products
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        ) : routeInfo.name === 'auth' ? (
          currentUser ? (
            <Account
              currentUser={currentUser}
              onLogout={handleLogout}
              orders={orders}
              wishlistIds={wishlistIds}
              priceAlerts={priceAlerts}
              onShowToast={setToastMessage}
              onUpdateCurrentUser={setCurrentUser}
            />
          ) : (
            <Auth onAuthSuccess={handleAuthSuccess} />
          )
        ) : routeInfo.name === 'compare' ? (
          <Compare
            compareIds={compareIds}
            onRemove={handleRemoveCompare}
            onClear={handleClearCompare}
          />
        ) : routeInfo.name === 'cart' ? (
          <Cart
            cartData={cartData}
            currentUser={currentUser}
            loading={cartLoading}
            error={cartError}
            onRetry={fetchCart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            updatingItemId={updatingCartItemId}
          />
        ) : routeInfo.name === 'checkout' ? (
          <Checkout
            cartData={cartData}
            currentUser={currentUser}
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
            currentUser={currentUser}
            loading={priceAlertsLoading}
            error={priceAlertsError}
            onRetry={fetchPriceAlerts}
            onSetPriceAlert={handleSetPriceAlert}
            onRemovePriceAlert={handleRemovePriceAlert}
          />
        ) : routeInfo.name === 'orders' ? (
          <Orders
            orders={orders}
            currentUser={currentUser}
            loading={ordersLoading}
            error={ordersError}
            onRetry={fetchOrders}
          />
        ) : routeInfo.name === 'order-details' ? (
          <OrderDetails
            orderId={routeInfo.orderId}
            orders={orders}
            currentUser={currentUser}
          />
        ) : routeInfo.name === 'account' ? (
          <Account
            currentUser={currentUser}
            onLogout={handleLogout}
            orders={orders}
            wishlistIds={wishlistIds}
            priceAlerts={priceAlerts}
            onShowToast={setToastMessage}
            onUpdateCurrentUser={setCurrentUser}
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
