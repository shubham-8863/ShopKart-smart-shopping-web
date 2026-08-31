import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  AlertCircle, 
  RefreshCw, 
  Package, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  LayoutDashboard,
  Truck
} from 'lucide-react';
import { 
  getAdminProducts, 
  createAdminProduct, 
  updateAdminProduct, 
  deactivateAdminProduct,
  getCategories,
  getStoredToken 
} from '../services/api';
import { formatPrice } from '../utils/pricing';
import AdminProductForm from './AdminProductForm';
import AdminOrders from './AdminOrders';

export default function AdminDashboard({ currentUser, onShowToast, defaultTab = 'products' }) {
  const [activeAdminTab, setActiveAdminTab] = useState(defaultTab); // 'products' | 'orders'

  // Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'out_of_stock'

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Deactivation Confirmation Modal State
  const [deactivatingProduct, setDeactivatingProduct] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Synchronize tab if defaultTab changes (e.g. from hash route #admin-orders)
  useEffect(() => {
    if (defaultTab) {
      setActiveAdminTab(defaultTab);
    }
  }, [defaultTab]);

  // Fetch admin products
  const fetchProducts = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [prodData, catData] = await Promise.all([
        getAdminProducts(token),
        getCategories(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError(err.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeAdminTab === 'products') {
      fetchProducts();
    }
  }, [activeAdminTab, fetchProducts]);

  // Handle Create / Update Save
  const handleSaveProduct = async (payload) => {
    const token = getStoredToken();
    if (!token) return false;

    try {
      if (productToEdit) {
        await updateAdminProduct(productToEdit.id, payload, token);
        if (onShowToast) onShowToast('Product updated successfully.');
      } else {
        await createAdminProduct(payload, token);
        if (onShowToast) onShowToast('Product created successfully.');
      }
      fetchProducts();
      return true;
    } catch (err) {
      console.error('Failed to save product:', err);
      throw err;
    }
  };

  // Handle Deactivate Confirm
  const handleConfirmDeactivate = async () => {
    if (!deactivatingProduct) return;
    const token = getStoredToken();
    if (!token) return;

    setIsDeactivating(true);
    try {
      await deactivateAdminProduct(deactivatingProduct.id, token);
      if (onShowToast) onShowToast('Product deactivated successfully.');
      setDeactivatingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to deactivate product:', err);
      if (onShowToast) onShowToast(err.message || 'Unable to deactivate product.');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Quick Reactivate
  const handleQuickReactivate = async (product) => {
    const token = getStoredToken();
    if (!token) return;

    try {
      await updateAdminProduct(
        product.id,
        {
          name: product.name,
          categoryId: product.categoryId,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.image,
          specifications: product.specifications,
          isActive: true,
        },
        token
      );
      if (onShowToast) onShowToast('Product reactivated successfully.');
      fetchProducts();
    } catch (err) {
      console.error('Failed to reactivate product:', err);
      if (onShowToast) onShowToast(err.message || 'Unable to reactivate product.');
    }
  };

  // Metrics Calculation
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Filtered Products for UI
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.trim().toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = p.isActive;
    if (statusFilter === 'inactive') matchesStatus = !p.isActive;
    if (statusFilter === 'out_of_stock') matchesStatus = p.stock === 0;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#FAF8F4] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Top Admin Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-5 mb-8">
          <div className="flex items-center gap-2 rounded-full bg-stone-200/60 p-1 border border-black/5">
            <button
              type="button"
              onClick={() => {
                setActiveAdminTab('products');
                window.location.hash = '#admin';
              }}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeAdminTab === 'products'
                  ? 'bg-white text-[#222222] shadow-xs'
                  : 'text-[#6B6B6B] hover:text-[#222222]'
              }`}
            >
              <Package className="w-4 h-4 text-[#D86F5C]" />
              <span>Products Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveAdminTab('orders');
                window.location.hash = '#admin-orders';
              }}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                activeAdminTab === 'orders'
                  ? 'bg-white text-[#222222] shadow-xs'
                  : 'text-[#6B6B6B] hover:text-[#222222]'
              }`}
            >
              <Truck className="w-4 h-4 text-[#D86F5C]" />
              <span>Orders Management</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab View */}
        {activeAdminTab === 'orders' ? (
          <AdminOrders onShowToast={onShowToast} />
        ) : (
          /* Products Tab View */
          <div>
            {/* Products Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 text-left">
              <div className="max-w-2xl">
                <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
                  Catalog Management
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
                  Product Catalog
                </h1>
                <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2">
                  Create, update, and manage products, live pricing, stock, and catalog visibility.
                </p>
              </div>

              {/* Add Product CTA */}
              <button
                type="button"
                onClick={() => {
                  setProductToEdit(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4 text-[#D86F5C]" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Catalog Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-[#6B6B6B]">
                  Total Products
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#222222] mt-1.5">
                  {loading ? '—' : totalCount}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                  Active in Store
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#222222] mt-1.5">
                  {loading ? '—' : activeCount}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Inactive / Hidden
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#222222] mt-1.5">
                  {loading ? '—' : inactiveCount}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-700">
                  Out of Stock
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#222222] mt-1.5">
                  {loading ? '—' : outOfStockCount}
                </p>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-black/5 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, category, or description..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-black/10 text-xs sm:text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: `All (${totalCount})` },
                  { id: 'active', label: `Active (${activeCount})` },
                  { id: 'inactive', label: `Inactive (${inactiveCount})` },
                  { id: 'out_of_stock', label: `Out of Stock (${outOfStockCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                      statusFilter === tab.id
                        ? 'bg-[#222222] text-white shadow-2xs'
                        : 'bg-[#FAF8F4] text-[#6B6B6B] hover:text-[#222222] hover:bg-stone-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading / Error / Products Table */}
            {error && !loading ? (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#222222]">Unable to load products</h3>
                <p className="text-xs text-[#6B6B6B] mt-1">{error}</p>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="mt-4 px-5 py-2 rounded-full bg-[#222222] text-white text-xs font-medium"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-3xl border border-black/5 p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-stone-100/80 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-black/5 p-12 text-center">
                <Package className="w-12 h-12 text-[#6B6B6B] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#222222]">
                  {searchQuery.trim() || statusFilter !== 'all'
                    ? 'No products match your filter'
                    : 'No products in the catalog yet'}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1 max-w-sm mx-auto">
                  {searchQuery.trim() || statusFilter !== 'all'
                    ? 'Try adjusting your search terms or filter selection.'
                    : 'Click "Add Product" above to create the first catalog item.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-black/[0.06] bg-[#FAF8F4] text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                        <th className="py-4 pl-6 pr-4">Product</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Price</th>
                        <th className="py-4 px-4">Stock</th>
                        <th className="py-4 px-4">Rating</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {filteredProducts.map((p) => {
                        const isLowStock = p.stock > 0 && p.stock <= 5;
                        const isOutOfStock = p.stock === 0;

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F4]/50 transition-colors group">
                            
                            <td className="py-3.5 pl-6 pr-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-black/5 shrink-0">
                                  <img
                                    src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#222222] truncate max-w-[200px] sm:max-w-xs group-hover:text-[#D86F5C] transition-colors">
                                    {p.name}
                                  </p>
                                  <span className="text-[11px] text-[#6B6B6B]">
                                    ID: #{p.id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-[#6B6B6B] font-medium whitespace-nowrap">
                              {p.category}
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-[#222222] whitespace-nowrap">
                              {formatPrice(p.price)}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#222222]">{p.stock}</span>
                                {isOutOfStock ? (
                                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                    Out of Stock
                                  </span>
                                ) : isLowStock ? (
                                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                                    Low Stock
                                  </span>
                                ) : null}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {p.rating !== null && p.rating !== undefined && p.rating > 0 ? (
                                <div className="flex items-center gap-1 text-amber-500 font-medium">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-xs text-[#222222]">{Number(p.rating).toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#6B6B6B]">Unrated</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {p.isActive ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                                  <EyeOff className="w-3 h-3 text-stone-500" />
                                  Inactive
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <a
                                  href={`#product/${p.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View customer product page"
                                  className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#222222] hover:bg-stone-100 transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductToEdit(p);
                                    setIsFormOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-[#222222] text-xs font-medium transition"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                {p.isActive ? (
                                  <button
                                    type="button"
                                    onClick={() => setDeactivatingProduct(p)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 hover:border-rose-300 hover:bg-rose-50 text-[#6B6B6B] hover:text-rose-700 text-xs font-medium transition"
                                  >
                                    <EyeOff className="w-3 h-3" />
                                    <span>Deactivate</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickReactivate(p)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Activate</span>
                                  </button>
                                )}
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add / Edit Product Modal Form */}
            <AdminProductForm
              isOpen={isFormOpen}
              onClose={() => {
                setIsFormOpen(false);
                setProductToEdit(null);
              }}
              productToEdit={productToEdit}
              categories={categories}
              onSave={handleSaveProduct}
            />

            {/* Deactivation Confirmation Modal */}
            {deactivatingProduct && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-7 max-w-md w-full text-left space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#222222]">
                      Deactivate "{deactivatingProduct.name}"?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1.5 leading-relaxed">
                      This product will be hidden from the customer-facing catalog. Historical orders and data will remain preserved.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/[0.06] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDeactivatingProduct(null)}
                      disabled={isDeactivating}
                      className="px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-stone-50 text-[#222222] text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeactivate}
                      disabled={isDeactivating}
                      className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition shadow-xs disabled:opacity-60"
                    >
                      {isDeactivating ? 'Deactivating...' : 'Deactivate Product'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
