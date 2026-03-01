import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserDocument } from '../services/users';
import { getOrdersByUserId } from '../services/orders';

const STATUS_LABELS = {
  pending: 'În așteptare',
  processing: 'În procesare',
  completed: 'Finalizată',
  cancelled: 'Anulată'
};

const formatOrderDate = (createdAt) => {
  if (!createdAt) return '—';
  const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  return d.toLocaleDateString('ro-RO', { dateStyle: 'medium' });
};

const Profile = () => {
  const { currentUser, userData } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        address: userData.address || '',
        phone: userData.phone || ''
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setOrdersLoading(false);
      return;
    }
    setOrdersError('');
    const fetchOrders = async () => {
      try {
        const list = await getOrdersByUserId(currentUser.uid);
        setOrders(list);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrdersError('Nu s-au putut încărca comenzile. Te rugăm să reîncerci.');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser?.uid]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.name) {
        throw new Error('Numele este obligatoriu');
      }

      await updateUserDocument(currentUser.uid, {
        name: formData.name,
        address: formData.address,
        phone: formData.phone
      });

      setSuccess('Profil actualizat cu succes!');
      
      // Refresh page to update userData in context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Nu s-a putut salva modificările. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-ceramic-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Te rugăm să te conectezi pentru a-ți vedea profilul.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceramic-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Profilul Meu</h1>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={currentUser.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Emailul nu poate fi schimbat</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nume Complet *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Introdu numele tău complet"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Introdu numărul tău de telefon"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Adresă
              </label>
              <textarea
                id="address"
                name="address"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Introdu adresa ta"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Se salvează...' : 'Salvează Modificările'}
              </button>
            </div>
          </form>
        </div>

        {/* My Orders */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comenzile mele</h2>
          {ordersLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto"></div>
              <p className="mt-3 text-gray-600">Se încarcă comenzile...</p>
            </div>
          ) : ordersError ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-red-600 mb-2">{ordersError}</p>
              <p className="text-sm text-gray-500">Verifică consola pentru detalii.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
              <p>Nu ai comenzi înregistrate. Comenzile plasate în timp ce ești conectat vor apărea aici.</p>
              <Link to="/shop" className="mt-4 inline-block text-gray-800 font-medium hover:underline">Mergi la Magazin</Link>
            </div>
          ) : (
            <div className="space-y-8">
              {['pending', 'processing'].some(s => orders.some(o => o.status === s)) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">În curs</h3>
                  <ul className="space-y-2">
                    {orders
                      .filter(o => o.status === 'pending' || o.status === 'processing')
                      .map(order => (
                        <li key={order.id}>
                          <OrderRow order={order} />
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Trecute</h3>
                <ul className="space-y-2">
                  {orders
                    .filter(o => o.status !== 'pending' && o.status !== 'processing')
                    .length === 0 ? (
                    <p className="text-gray-500 text-sm">Nicio comandă trecută.</p>
                  ) : (
                    orders
                      .filter(o => o.status !== 'pending' && o.status !== 'processing')
                      .map(order => (
                        <li key={order.id}>
                          <OrderRow order={order} />
                        </li>
                      ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function OrderRow({ order }) {
  const statusLabel = STATUS_LABELS[order.status] || order.status;
  const isPaid = order.paymentStatus === 'succeeded';
  const isPendingPayment = order.status === 'pending' && !isPaid;
  return (
    <Link
      to={`/order-confirmation/${order.id}`}
      className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg shadow border border-gray-200 p-4 hover:border-gray-400 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm text-gray-500">{formatOrderDate(order.createdAt)}</span>
        <span className="px-2 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-800">
          {statusLabel}
        </span>
        {isPaid && (
          <span className="px-2 py-0.5 rounded text-sm font-medium bg-green-100 text-green-800">
            Plătit
          </span>
        )}
        {isPendingPayment && (
          <span className="text-amber-600 text-sm font-medium">Plată neconfirmată</span>
        )}
      </div>
      <span className="font-semibold text-gray-900">
        {typeof order.total === 'number' ? order.total.toFixed(2) : order.total} lei
      </span>
    </Link>
  );
}

export default Profile;


