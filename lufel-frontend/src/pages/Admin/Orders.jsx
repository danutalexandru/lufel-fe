import { useState, useEffect } from 'react';
import { getOrders, getOrdersByStatus, updateOrderStatus } from '../../services/orders';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = statusFilter === 'all' 
        ? await getOrders()
        : await getOrdersByStatus(statusFilter);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array instead of showing alert
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Error is logged but no alert shown - user can see the order didn't update
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă comenzile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceramic-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Gestionează Comenzi</h1>

        {/* Status Filter */}
        <div className="mb-6">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrează după Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          >
            <option value="all">Toate Comenzile</option>
            <option value="pending">În Așteptare</option>
            <option value="processing">În Procesare</option>
            <option value="completed">Finalizate</option>
            <option value="cancelled">Anulate</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Comandă #{order.id.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status === 'pending' ? 'În Așteptare' : order.status === 'processing' ? 'În Procesare' : order.status === 'completed' ? 'Finalizată' : order.status === 'cancelled' ? 'Anulată' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.paymentStatus === 'succeeded' ? (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Plătit
                    </span>
                  ) : order.paymentStatus === 'failed' ? (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Plată eșuată
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      Plată în așteptare
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {selectedOrder?.id === order.id ? 'Ascunde Detalii' : 'Vezi Detalii'}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Client</p>
                  <p className="text-gray-900">{order.customerInfo?.name}</p>
                  <p className="text-sm text-gray-600">{order.customerInfo?.email}</p>
                  <p className="text-sm text-gray-600">{order.customerInfo?.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Total</p>
                  <p className="text-xl font-bold text-gray-900">{order.total?.toFixed(2)} lei</p>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Adresă de Livrare</h4>
                    <p className="text-gray-600 whitespace-pre-line">{order.customerInfo?.address}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Produse Comandate</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} lei
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Buttons */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Actualizează Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'completed', 'cancelled'].map((status) => {
                    const statusLabels = {
                      pending: 'În Așteptare',
                      processing: 'În Procesare',
                      completed: 'Finalizată',
                      cancelled: 'Anulată'
                    };
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(order.id, status)}
                        disabled={order.status === status}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          order.status === status
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                      >
                        {statusLabels[status]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">
              {statusFilter === 'all' 
                ? 'Nu s-au găsit comenzi.' 
                : `Nu s-au găsit comenzi cu statusul "${statusFilter === 'pending' ? 'În Așteptare' : statusFilter === 'processing' ? 'În Procesare' : statusFilter === 'completed' ? 'Finalizate' : 'Anulate'}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

