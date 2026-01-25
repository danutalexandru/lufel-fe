import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, confirmPayment } from '../services/stripe';
import { getOrderById, updateOrderPaymentStatus } from '../services/orders';

const PaymentForm = ({ order, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment
      const paymentIntent = await confirmPayment(stripe, elements, clientSecret);

      if (paymentIntent.status === 'succeeded') {
        // Update order status to processing
        await updateOrderPaymentStatus(order.id, {
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'succeeded',
        });

        // Redirect to confirmation page
        navigate(`/order-confirmation/${order.id}`);
      } else {
        setError('Plata nu a fost finalizată. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Plata a eșuat. Te rugăm să verifici datele cardului și să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Se procesează plata...' : `Plătește $${order.total.toFixed(2)}`}
      </button>
    </form>
  );
};

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Fetch order details
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        // Check if order is already paid
        if (orderData.paymentStatus === 'succeeded') {
          navigate(`/order-confirmation/${orderId}`);
          return;
        }

        // Create payment intent
        const secret = await createPaymentIntent(orderId, orderData.total);
        setClientSecret(secret);
      } catch (err) {
        console.error('Error initializing payment:', err);
        setError(err.message || 'Nu s-a putut inițializa plata. Te rugăm să încerci din nou.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      initializePayment();
    }
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ceramic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-ceramic-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Comanda nu a fost găsită'}</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Înapoi la Magazin
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-ceramic-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Nu s-a putut inițializa plata. Te rugăm să contactezi suportul.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Înapoi la Magazin
          </button>
        </div>
      </div>
    );
  }

  const stripePromise = getStripe();

  return (
    <div className="min-h-screen bg-ceramic-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Plată</h1>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Detalii Card</h2>
              
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <PaymentForm order={order} clientSecret={clientSecret} />
              </Elements>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:sticky md:top-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Rezumat Comandă</h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-sm text-gray-600">Număr Comandă</p>
                  <p className="text-base font-semibold text-gray-900">{order.id.substring(0, 8)}</p>
                </div>
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

