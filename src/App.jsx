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
import AdminDashboard from './pages/AdminDashboard';
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
  if (hash === '#admin-orders') {
    return { name: 'admin-orders', productId: null };
  }
  if (hash === '#admin') {
    return { name: 'admin', productId: null };
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

  // Server-backed Wishlist State (Array of product IDs)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Server-backed Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [priceAlertsLoading, setPriceAlertsLoading] = useState(false);
  const [priceAlertsError, setPriceAlertsError] = useState(null);

  // Server-backed Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Checkout and Order Placement State
  const [lastOrder, setLastOrder] = useState(null);

  // Visual notification / toast message state
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Restore authenticated session from stored JWT on initial mount
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
        }
      })
      .catch((err) => {
        console.warn('Session restoration failed:', err.message);
        removeStoredToken();
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
    }
  }, [currentUser, fetchCart, fetchOrders, fetchPriceAlerts]);

  // Synchronize hash routing with state
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

  // Login handler
  const handleAuthSuccess = (dataOrUser, maybeToken) => {
    const user = dataOrUser?.user ? dataOrUser.user : dataOrUser;
    const token = dataOrUser?.token || maybeToken;

    if (token) {
      setStoredToken(token);
    }
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        window.location.hash = '#admin';
      } else {
        window.location.hash = '#account';
      }
      const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User';
      setToastMessage(`Welcome back, ${firstName}!`);
    }
  };

  // Logout handler
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
    setToastMessage('Signed out successfully.');
    window.location.hash = '#';
  };

  // Toggle Compare handler
  const handleToggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        setToastMessage('Comparison limit: You can compare up to 3 products at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleRemoveCompare = (id) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
  };

  // Toggle Wishlist handler
  const handleToggleWishlist = async (id) => {
    const token = getStoredToken();
    if (!currentUser || !token) {
      window.location.hash = '#auth';
      return;
    }

    const isCurrentlyWishlisted = wishlistIds.includes(id);

    try {
      if (isCurrentlyWishlisted) {
        setWishlistIds((prev) => prev.filter((item) => item !== id));
        await removeFromWishlistApi(id, token);
        setToastMessage('Removed from wishlist');
      } else {
        setWishlistIds((prev) => [...prev, id]);
        await addToWishlistApi(id, token);
        setToastMessage('Added to wishlist');
      }
    } catch (err) {
      console.error('Wishlist mutation failed:', err);
      // Revert optimistic update
      if (isCurrentlyWishlisted) {
        setWishlistIds((prev) => [...prev, id]);
      } else {
        setWishlistIds((prev) => prev.filter((item) => item !== id));
      }
      setToastMessage(err.message || 'Unable to update wishlist.');
    }
  };

  // Cart Handlers
  const handleAddToCart = async (productId, quantity = 1) => {
    const token = getStoredToken();
    if (!currentUser || !token) {
      window.location.hash = '#auth';
      return false;
    }

    try {
      const updatedCart = await addToCartApi(productId, quantity, token);
      setCartData(updatedCart);
      setToastMessage('Added to cart');
      return true;
    } catch (err) {
      console.error('Add to cart failed:', err);
      setToastMessage(err.message || 'Unable to add item to cart.');
      return false;
    }
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    const token = getStoredToken();
    if (!currentUser || !token) return;

    setUpdatingCartItemId(productId);
    try {
      let updatedCart;
      if (quantity <= 0) {
        updatedCart = await removeCartItemApi(productId, token);
      } else {
        updatedCart = await updateCartItemApi(productId, quantity, token);
      }
      setCartData(updatedCart);
    } catch (err) {
      console.error('Update cart item failed:', err);
      setToastMessage(err.message || 'Unable to update quantity.');
    } finally {
      setUpdatingCartItemId(null);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const token = getStoredToken();
    if (!currentUser || !token) return;

    setUpdatingCartItemId(productId);
    try {
      const updatedCart = await removeCartItemApi(productId, token);
      setCartData(updatedCart);
      setToastMessage('Item removed from cart');
    } catch (err) {
      console.error('Remove cart item failed:', err);
      setToastMessage(err.message || 'Unable to remove item.');
    } finally {
      setUpdatingCartItemId(null);
    }
  };

  // Price Alert Handlers
  const handleSetPriceAlert = async (productId, targetPrice) => {
    const token = getStoredToken();
    if (!currentUser || !token) {
      window.location.hash = '#auth';
      return false;
    }

    try {
      const result = await createPriceAlertApi(productId, targetPrice, token);
      setPriceAlerts((prev) => {
        const existingIdx = prev.findIndex((a) => a.productId === productId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = result;
          return updated;
        }
        return [result, ...prev];
      });
      setToastMessage('Price alert set successfully.');
      return true;
    } catch (err) {
      console.error('Failed to set price alert:', err);
      setToastMessage(err.message || 'Unable to set price alert.');
      return false;
    }
  };

  const handleRemovePriceAlert = async (productId) => {
    const token = getStoredToken();
    if (!currentUser || !token) return;

    try {
      await deletePriceAlertApi(productId, token);
      setPriceAlerts((prev) => prev.filter((a) => a.productId !== productId));
      setToastMessage('Stopped tracking product.');
    } catch (err) {
      console.error('Failed to remove price alert:', err);
      setToastMessage(err.message || 'Unable to remove price alert.');
    }
  };

  // Order Placement Handler
  const handlePlaceOrder = async (orderPayload) => {
    const token = getStoredToken();
    if (!currentUser || !token) {
      window.location.hash = '#auth';
      return;
    }

    try {
      const createdOrder = await createOrderApi(orderPayload, token);
      setLastOrder(createdOrder);
      // Clear Cart state locally
      setCartData({
        items: [],
        subtotal: 0,
        delivery: 0,
        total: 0,
        freeDeliveryThreshold: 2000,
      });
      // Refresh Orders
      fetchOrders();
      window.location.hash = '#order-success';
    } catch (err) {
      console.error('Order placement failed:', err);
      throw err;
    }
  };

  const totalCartCount = cartData.items
    ? cartData.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const totalWishlistCount = wishlistIds.length;
  const totalPriceAlertCount = priceAlerts.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#222222] font-sans antialiased selection:bg-[#D86F5C]/20 selection:text-[#222222]">
      {/* Global Sticky Navbar */}
      <Navbar
        compareCount={compareIds.length}
        cartCount={totalCartCount}
        wishlistCount={totalWishlistCount}
        priceAlertCount={totalPriceAlertCount}
        orderCount={orders.length}
        currentUser={currentUser}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="bg-[#222222] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#D86F5C]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Dynamic View Content */}
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
        ) : routeInfo.name === 'admin' || routeInfo.name === 'admin-orders' ? (
          currentUser && currentUser.role === 'admin' ? (
            <AdminDashboard
              currentUser={currentUser}
              onShowToast={setToastMessage}
              defaultTab={routeInfo.name === 'admin-orders' ? 'orders' : 'products'}
            />
          ) : !currentUser ? (
            <div className="bg-[#FAF8F4] py-20 min-h-[60vh] flex items-center justify-center text-center">
              <div className="max-w-md mx-auto px-6">
                <h1 className="text-2xl font-semibold text-[#222222]">Admin Sign In Required</h1>
                <p className="text-sm text-[#6B6B6B] mt-2">Please sign in with an administrator account to access this area.</p>
                <a href="#auth" className="mt-6 inline-flex px-6 py-2.5 rounded-full bg-[#222222] text-white text-sm font-medium shadow-xs">Sign in</a>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F4] py-20 min-h-[60vh] flex items-center justify-center text-center">
              <div className="max-w-md mx-auto px-6">
                <h1 className="text-2xl font-semibold text-[#222222]">Access Denied</h1>
                <p className="text-sm text-[#6B6B6B] mt-2">You do not have permission to access the admin order and product management dashboard.</p>
                <a href="#products" className="mt-6 inline-flex px-6 py-2.5 rounded-full bg-[#222222] text-white text-sm font-medium shadow-xs">Explore Products</a>
              </div>
            </div>
          )
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
            currentUser={currentUser}
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
