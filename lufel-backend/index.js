const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Create a Stripe Payment Intent
 * This endpoint is called from the frontend to create a payment intent for an order
 * 
 * POST /create-payment-intent
 * Body: {
 *   orderId: string,
 *   amount: number (in cents),
 *   currency: string (default: 'usd')
 * }
 */
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { orderId, amount, currency = 'usd' } = req.body;

    // Validate input
    if (!orderId || !amount) {
      res.status(400).json({ error: 'Missing required fields: orderId and amount' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    // Verify order exists in Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const orderData = orderDoc.data();

    // Check if order is already paid
    if (orderData.paymentStatus === 'succeeded') {
      res.status(400).json({ error: 'Order is already paid' });
      return;
    }

    // Create Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer (cents)
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId,
        orderTotal: orderData.total?.toString() || amount.toString(),
      },
      description: `Order ${orderId} - LUFEL Pottery`,
    });

    // Update order with payment intent ID (optional, for tracking)
    await orderRef.update({
      paymentIntentId: paymentIntent.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Return client secret to frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message,
    });
  }
});

/**
 * Stripe Webhook Handler (Optional but recommended)
 * This handles payment events from Stripe (e.g., payment succeeded, failed)
 * 
 * To use this, configure the webhook in Stripe Dashboard:
 * - URL: https://your-region-your-project.cloudfunctions.net/stripeWebhook
 * - Events: payment_intent.succeeded, payment_intent.payment_failed
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const orderRef = db.collection('orders').doc(orderId);
          await orderRef.update({
            paymentStatus: 'succeeded',
            status: 'processing',
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Payment succeeded for order ${orderId}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.orderId;

        if (failedOrderId) {
          const failedOrderRef = db.collection('orders').doc(failedOrderId);
          await failedOrderRef.update({
            paymentStatus: 'failed',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Payment failed for order ${failedOrderId}`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

