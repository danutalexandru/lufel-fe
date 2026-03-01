/**
 * LUFEL Backend - Stripe Payment Link + Webhook
 * Uses Firebase params (defineString, defineSecret) instead of deprecated functions.config()
 * See: https://firebase.google.com/docs/functions/config-env
 */
const { onRequest } = require('firebase-functions/v2/https');
const { defineString, defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();

// Parameters (set via Firebase CLI or .env; secrets via Secret Manager)
const appAllowedOrigin = defineString('APP_ALLOWED_ORIGIN', { default: '' });
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

/**
 * Create a Stripe Payment Link for an order.
 * POST /createPaymentLink  Body: { orderId, successUrl }
 */
exports.createPaymentLink = onRequest(
  { secrets: [stripeSecretKey] },
  async (req, res) => {
    const corsOrigin = appAllowedOrigin.value() || '*';
    res.set('Access-Control-Allow-Origin', corsOrigin);
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { orderId, successUrl } = req.body;
      if (!orderId || !successUrl || typeof successUrl !== 'string') {
        res.status(400).json({ error: 'Missing required fields: orderId, successUrl' });
        return;
      }

      // Prevent open redirect: successUrl must be same-origin as the app (set APP_ALLOWED_ORIGIN in config).
      const allowedOrigin = (appAllowedOrigin.value() || '').trim();
      if (allowedOrigin) {
        try {
          const redirectOrigin = new URL(successUrl).origin;
          const allowedOriginNormalized = new URL(allowedOrigin.startsWith('http') ? allowedOrigin : `https://${allowedOrigin}`).origin;
          if (redirectOrigin !== allowedOriginNormalized) {
            res.status(400).json({ error: 'Invalid successUrl origin' });
            return;
          }
        } catch (e) {
          res.status(400).json({ error: 'Invalid successUrl' });
          return;
        }
      }

      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      if (!orderDoc.exists) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const orderData = orderDoc.data();
      if (orderData.paymentStatus === 'succeeded') {
        res.status(400).json({ error: 'Order is already paid' });
        return;
      }

      // If order has an owner (userId), require Firebase Auth and that the caller is the order owner.
      const orderUserId = orderData.userId != null ? String(orderData.userId) : null;
      if (orderUserId) {
        const authHeader = req.headers.authorization;
        const idToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!idToken) {
          res.status(401).json({ error: 'Unauthorized: sign in required to pay for this order' });
          return;
        }
        let decoded;
        try {
          decoded = await admin.auth().verifyIdToken(idToken);
        } catch (e) {
          res.status(401).json({ error: 'Invalid or expired token' });
          return;
        }
        if (decoded.uid !== orderUserId) {
          res.status(403).json({ error: 'Forbidden: you can only create payment links for your own orders' });
          return;
        }
      }

      const orderTotal = orderData.total;
      if (typeof orderTotal !== 'number' || orderTotal <= 0) {
        res.status(400).json({ error: 'Invalid order total' });
        return;
      }
      const amountInCents = Math.round(orderTotal * 100);

      const secretKey = (stripeSecretKey.value() || '').trim();
      if (!secretKey || !secretKey.startsWith('sk_')) {
        console.error('STRIPE_SECRET_KEY is missing or invalid (must start with sk_)');
        res.status(500).json({ error: 'Failed to create payment link' });
        return;
      }
      const stripeClient = stripe(secretKey);
      const paymentLink = await stripeClient.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: 'ron',
              unit_amount: amountInCents,
              product_data: {
                name: `Order ${orderId} - LUFEL Pottery`,
                description: `Total comandă: ${orderTotal.toFixed(2)} RON`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { orderId },
        after_completion: { type: 'redirect', redirect: { url: successUrl } },
      });

      await orderRef.update({
        paymentLinkId: paymentLink.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ url: paymentLink.url });
    } catch (error) {
      console.error('Error creating payment link:', error);
      res.status(500).json({ error: 'Failed to create payment link' });
    }
  }
);

/**
 * Stripe Webhook - order confirmation uses checkout.session.completed only (Payment Link flow).
 * payment_intent.succeeded is not used: Payment Link metadata does not flow to the Payment Intent.
 */
exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecretVal = (stripeWebhookSecret.value() || '').trim();

    if (!webhookSecretVal) {
      console.error('Webhook secret not configured');
      res.status(503).send('Webhook not configured');
      return;
    }

    // Stripe requires the exact raw request body for signature verification (not parsed/stringified JSON).
    let rawBody;
    if (req.rawBody != null) {
      rawBody = typeof req.rawBody === 'string' ? req.rawBody : req.rawBody.toString();
    } else {
      console.error('Webhook raw body missing: request.rawBody is undefined. Ensure the endpoint receives the raw body (e.g. use Firebase Hosting to forward to this function, or deploy with Express and express.raw() for this route).');
      res.status(400).send('Webhook signature verification requires the raw request body. This deployment may have parsed the body; see logs.');
      return;
    }

    let event;
    try {
      const secretKey = (stripeSecretKey.value() || '').trim();
      const stripeClient = stripe(secretKey);
      event = stripeClient.webhooks.constructEvent(rawBody, sig, webhookSecretVal);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        // Payment Links: Stripe sends checkout.session.completed when the customer pays.
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (session.payment_status !== 'paid') break;
          let orderId = session.metadata && session.metadata.orderId;
          if (!orderId && session.payment_link) {
            const snap = await db.collection('orders').where('paymentLinkId', '==', session.payment_link).limit(1).get();
            if (!snap.empty) orderId = snap.docs[0].id;
          }
          if (orderId) {
            const orderRef = db.collection('orders').doc(orderId);
            const orderSnap = await orderRef.get();
            const orderData = orderSnap.exists ? orderSnap.data() : null;

            await orderRef.update({
              paymentStatus: 'succeeded',
              status: 'processing',
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Payment Link payment succeeded for order ${orderId}`);

            // Decrement product stock for each order line (products become out of stock when stock hits 0).
            const items = orderData?.items || [];
            for (const item of items) {
              const productId = item.productId;
              const qty = Math.max(0, parseInt(item.quantity, 10) || 0);
              if (!productId || qty === 0) continue;
              const productRef = db.collection('products').doc(productId);
              try {
                await db.runTransaction(async (t) => {
                  const productSnap = await t.get(productRef);
                  if (!productSnap.exists) return;
                  const currentStock = productSnap.data().stock ?? 0;
                  const newStock = Math.max(0, Number(currentStock) - qty);
                  t.update(productRef, { stock: newStock });
                });
                console.log(`Stock updated for product ${productId}`);
              } catch (err) {
                console.error(`Failed to update stock for product ${productId}:`, err.message);
              }
            }
          }
          break;
        }

        // payment_intent.succeeded not used for Payment Links (metadata does not flow to PI).

        // Only matches when Payment Intents are created with metadata.orderId (e.g. future Stripe Elements flow).
        case 'payment_intent.payment_failed': {
          const failedPayment = event.data.object;
          const failedOrderId = failedPayment.metadata && failedPayment.metadata.orderId;
          if (failedOrderId) {
            const failedOrderRef = db.collection('orders').doc(failedOrderId);
            await failedOrderRef.update({
              paymentStatus: 'failed',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Payment failed for order ${failedOrderId}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);
