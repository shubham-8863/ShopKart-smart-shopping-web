import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye,
  ExternalLink
} from 'lucide-react';
import { 
  getAdminOrders, 
  getAdminOrderById, 
  updateAdminOrderStatus, 
  getStoredToken 
} from '../services/api';
import { formatPrice } from '../utils/pricing';
import AdminOrderDetails from './AdminOrderDetails';

function formatOrderDate(dateString) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export default function AdminOrders({ onShowToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch admin orders
  const fetchOrders = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getAdminOrders(token);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError(err.message || 'Unable to load customer orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open Order Details
  const handleOpenOrder = async (orderItem) => {
    const token = getStoredToken();
    if (!token) return;

    setLoadingDetails(true);
    setSelectedOrder(orderItem);
    setIsDetailsOpen(true);

    try {
      const fullOrder = await getAdminOrderById(orderItem.orderCode || orderItem.id, token);
      setSelectedOrder(fullOrder);
    } catch (err) {
      console.error('Error loading full order details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Update Status Handler
  const handleUpdateStatus = async (orderId, targetStatus) => {
    const token = getStoredToken();
    if (!token) return;

    try {
      await updateAdminOrderStatus(orderId, targetStatus, token);
      if (onShowToast) {
        onShowToast(`Order #${orderId} status updated to ${targetStatus}.`);
      }
      // Refresh selected order and full orders list
      const updatedOrder = await getAdminOrderById(orderId, token);
      setSelectedOrder(updatedOrder);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      throw err;
    }
  };

  // Metrics
  const totalCount = orders.length;
  const placedCount = orders.filter((o) => o.status === 'Placed').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderCode.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      o.customer?.fullName?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(searchQuery.trim().toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ==========================================================================
     1. Error State
     ========================================================================== */
  if (error && !loading) {
    return (
      <div className="bg-[#FAF8F4] py-20 sm:py-28 min-h-[65vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-6">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200/60 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222]">
            Unable to load orders.
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchOrders}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-95 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F4] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 text-left">
          <div>
            <p className="text-xs sm:text-[13px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-2">
              Order Fulfillment
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#222222] tracking-tight leading-[1.1]">
              Order Management
            </h1>
            <p className="text-[#6B6B6B] text-base sm:text-[17px] leading-relaxed mt-2">
              Manage customer orders, advance fulfillment status, and track delivery progress.
            </p>
          </div>

          <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] shrink-0">
            <span>{totalCount} total customer {totalCount === 1 ? 'order' : 'orders'}</span>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'All Orders', count: totalCount, color: 'text-[#222222]' },
            { label: 'Placed', count: placedCount, color: 'text-amber-800' },
            { label: 'Processing', count: processingCount, color: 'text-amber-900' },
            { label: 'Shipped', count: shippedCount, color: 'text-indigo-700' },
            { label: 'Delivered', count: deliveredCount, color: 'text-emerald-700' },
            { label: 'Cancelled', count: cancelledCount, color: 'text-rose-700' },
          ].map((card, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs text-left">
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${card.color}`}>
                {card.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[#222222] mt-1">
                {loading ? '—' : card.count}
              </p>
            </div>
          ))}
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
              placeholder="Search by order code, customer name, or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-black/10 text-xs sm:text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'Placed', label: `Placed (${placedCount})` },
              { id: 'Processing', label: `Processing (${processingCount})` },
              { id: 'Shipped', label: `Shipped (${shippedCount})` },
              { id: 'Delivered', label: `Delivered (${deliveredCount})` },
              { id: 'Cancelled', label: `Cancelled (${cancelledCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
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

        {/* Orders Table */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-black/5 p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-stone-100/80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/5 p-12 text-center">
            <Package className="w-12 h-12 text-[#6B6B6B] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#222222]">
              {searchQuery.trim() || statusFilter !== 'all'
                ? 'No orders match your filter'
                : 'No customer orders yet'}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1 max-w-sm mx-auto">
              {searchQuery.trim() || statusFilter !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'Customer orders will appear here once placed at checkout.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#FAF8F4] text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                    <th className="py-4 pl-6 pr-4">Order Code</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Items</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {filteredOrders.map((order) => {
                    return (
                      <tr key={order.orderCode || order.id} className="hover:bg-[#FAF8F4]/50 transition-colors group">
                        
                        {/* Order Code */}
                        <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                          <span className="font-bold text-[#222222] group-hover:text-[#D86F5C] transition-colors">
                            #{order.orderCode || order.id}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#222222] truncate max-w-[150px]">
                              {order.customer?.fullName || 'Anonymous'}
                            </p>
                            <p className="text-[11px] text-[#6B6B6B] truncate max-w-[150px]">
                              {order.customer?.email}
                            </p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-[#6B6B6B] whitespace-nowrap">
                          {formatOrderDate(order.createdAt)}
                        </td>

                        {/* Items count */}
                        <td className="py-4 px-4 text-[#222222] font-medium whitespace-nowrap">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-4 font-bold text-[#222222] whitespace-nowrap">
                          {formatPrice(order.total || order.totalAmount)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            order.status === 'Delivered'
                              ? 'text-emerald-700 bg-emerald-50'
                              : order.status === 'Cancelled'
                              ? 'text-rose-700 bg-rose-50'
                              : order.status === 'Shipped'
                              ? 'text-indigo-700 bg-indigo-50'
                              : 'text-amber-800 bg-amber-50'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{order.status}</span>
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenOrder(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium transition shadow-xs active:scale-95"
                          >
                            <Eye className="w-3 h-3 text-[#D86F5C]" />
                            <span>Manage</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details & Status Transition Modal */}
        <AdminOrderDetails
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={handleUpdateStatus}
        />

      </div>
    </div>
  );
}
