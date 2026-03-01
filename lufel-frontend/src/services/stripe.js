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
 * Create a Stripe Payment Link for an order. Amount is derived server-side (secure).
 * Returns the URL to redirect the customer to Stripe's hosted checkout.
 * Pass idToken when the user is logged in so the backend can verify order ownership.
 *
 * @param {string} orderId - The order ID
 * @param {string} successUrl - Full URL to redirect after successful payment (e.g. order confirmation)
 * @param {string} [idToken] - Optional Firebase ID token (required for orders that have an owner)
 * @returns {Promise<string>} - The Payment Link URL to redirect to
 */
export const createPaymentLink = async (orderId, successUrl, idToken = null) => {
  try {
    const fullUrl = (import.meta.env.VITE_CREATE_PAYMENT_LINK_URL || '').trim();
    const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
    const url = fullUrl
      ? fullUrl.replace(/\/+$/, '')
      : baseUrl
        ? `${baseUrl.replace(/\/+$/, '')}/createPaymentLink`
        : '';
    if (!url) {
      throw new Error(
        'Backend URL not configured. In .env set VITE_CREATE_PAYMENT_LINK_URL (full URL) or VITE_BACKEND_URL (base URL). Restart dev server after changing .env.'
      );
    }

    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        orderId,
        successUrl,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Nu s-a putut pregăti plata.');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
};

