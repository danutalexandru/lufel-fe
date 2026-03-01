import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPaymentLink } from '../services/stripe';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const initializePayment = async () => {
      if (!orderId) {
        setLoading(false);
        setError('Link invalid.');
        return;
      }
      try {
        const successUrl = `${window.location.origin}/order-confirmation/${orderId}`;
        const idToken = currentUser ? await currentUser.getIdToken() : null;
        const paymentUrl = await createPaymentLink(orderId, successUrl, idToken);
        setRedirecting(true);
        window.location.href = paymentUrl;
      } catch (err) {
        console.error('Error initializing payment:', err);
        const message = err?.message || '';
        if (message.includes('already paid') || message.includes('Order is already paid')) {
          setRedirecting(true);
          navigate(`/order-confirmation/${orderId}`, { replace: true });
          return;
        }
        if (message.includes('Order not found') || message.includes('not found')) {
          setError('Comanda nu a fost găsită. Te rugăm să verifici linkul.');
        } else if (message.includes('Unauthorized') || message.includes('sign in required')) {
          setError('Trebuie să fii conectat pentru a plăti această comandă.');
        } else if (message.includes('Forbidden') || message.includes('your own orders')) {
          setError('Poți plăti doar comenzile tale.');
        } else if (message.includes('Backend URL') || message.includes('VITE_') || message.includes('.env')) {
          setError('Plata nu este configurată. Verifică în .env: VITE_CREATE_PAYMENT_LINK_URL (URL complet). Repornește serverul după ce modifici .env.');
        } else {
          setError('Nu s-a putut încărca pagina de plată. Te rugăm să încerci din nou în câteva momente.');
        }
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [orderId, navigate, currentUser]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-ceramic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {redirecting ? 'Se deschide pagina de plată...' : 'Se încarcă...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ceramic-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  return null;
};

export default Payment;
