import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.warn('Stripe publishable key not found. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.');
}
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Get Stripe instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    throw new Error('Stripe not initialized. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.');
  }
  return stripePromise;
};

/**
 * Create a payment intent
 * Note: This should call a backend endpoint/Cloud Function that creates the Payment Intent
 * For now, this is a placeholder that expects a backend endpoint
 * 
 * @param {string} orderId - The order ID
 * @param {number} amount - The amount in dollars (will be converted to cents)
 * @returns {Promise<string>} - The client secret for the payment intent
 */
export const createPaymentIntent = async (orderId, amount) => {
  try {
    // Convert amount to cents (Stripe uses cents)
    const amountInCents = Math.round(amount * 100);

    // Call backend endpoint to create payment intent
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('Backend URL not configured. Please set VITE_BACKEND_URL in your .env file.');
    }

    const response = await fetch(`${backendUrl}/createPaymentIntent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        amount: amountInCents,
        currency: 'usd',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm payment with Stripe
 * @param {Object} stripe - Stripe instance
 * @param {Object} elements - Stripe Elements instance
 * @param {string} clientSecret - Payment intent client secret
 * @returns {Promise<Object>} - Payment result
 */
export const confirmPayment = async (stripe, elements, clientSecret) => {
  try {
    if (!stripe || !elements) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: 'if_required',
    });

    if (error) {
      throw error;
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

