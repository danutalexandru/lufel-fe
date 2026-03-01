import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orders';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Comanda nu a fost găsită</p>
          <Link
            to="/shop"
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Înapoi la Magazin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceramic-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Comandă Confirmată!</h1>
            <p className="text-gray-600">Îți mulțumim pentru comandă</p>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="text-left space-y-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{order.status === 'pending' ? 'În așteptare' : order.status === 'processing' ? 'În procesare' : order.status === 'completed' ? 'Finalizată' : order.status === 'cancelled' ? 'Anulată' : order.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Plată</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.paymentStatus === 'succeeded' ? (
                    <span className="text-green-600">Plătit</span>
                  ) : order.paymentStatus ? (
                    <span className="text-yellow-600">{order.paymentStatus}</span>
                  ) : (
                    <>
                      <span className="text-gray-600">Neconfirmată</span>
                      <p className="text-sm text-gray-500 font-normal mt-1">Stripe va confirma plata după ce finalizezi achitarea; dacă ai plătit deja, statusul se actualizează în câteva secunde.</p>
                    </>
                  )}
                </p>
              </div>
              {order.paidAt && (
                <div>
                  <p className="text-sm text-gray-600">Data Plății</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.paidAt.toDate ? order.paidAt.toDate().toLocaleDateString('ro-RO') : new Date(order.paidAt).toLocaleDateString('ro-RO')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">{order.total.toFixed(2)} lei</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">Produse Comandate</h2>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900">{(item.price * item.quantity).toFixed(2)} lei</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/shop"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Continuă Cumpărăturile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

