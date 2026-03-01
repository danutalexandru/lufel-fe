# Testing Stripe Payments

Use this guide to verify that Stripe is working end-to-end in LUFEL.

---

## 1. Prerequisites

Before testing, ensure:

| Item | Where to get it |
|------|------------------|
| **Stripe test keys** | [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys. Use **Test mode** (toggle in the top right). |
| **Publishable key** | `pk_test_...` → set as `VITE_STRIPE_PUBLISHABLE_KEY` in `.env` |
| **Secret key** | `sk_test_...` → set in backend: `firebase functions:config:set stripe.secret_key="sk_test_..."` |
| **Backend URL** | Your Cloud Function URL (e.g. `https://us-central1-YOUR_PROJECT.cloudfunctions.net`) → set as `VITE_BACKEND_URL` in `.env` |

**For local testing:**  
- Frontend: `npm run dev` (e.g. http://localhost:5173)  
- Backend: either deploy functions and use the live URL, or run the [Firebase emulator](https://firebase.google.com/docs/emulator-suite) and set `VITE_BACKEND_URL` to the emulator URL (e.g. `http://localhost:5001/YOUR_PROJECT/us-central1`).

Restart the frontend dev server after changing `.env`.

---

## 2. End-to-end test (happy path)

1. **Open the shop**  
   Go to `/shop`, add at least one product to the cart.

2. **Checkout**  
   Go to `/cart` → "Checkout" (or go to `/checkout`).  
   Fill in name, email, phone, address and place the order.

3. **Payment page**  
   You should be redirected to `/payment/{orderId}`; the app then redirects you to **Stripe's hosted checkout** (Payment Link).

4. **Use a Stripe test card** on Stripe's page:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** any future date (e.g. 12/34)
   - **CVC:** any 3 digits (e.g. 123)
   - **ZIP:** any (e.g. 12345)

5. **Complete payment**  
   Submit on Stripe's page. After success you are redirected to `/order-confirmation/{orderId}`.

6. **Verify in Stripe**  
   In [Stripe Dashboard → Payments](https://dashboard.stripe.com/test/payments), you should see the test payment.

---

## 3. Stripe test cards (test mode only)

| Scenario | Card number |
|----------|-------------|
| **Success** | `4242 4242 4242 4242` |
| **Decline** | `4000 0000 0000 0002` |
| **Requires authentication (3D Secure)** | `4000 0025 0000 3155` |

Use any future expiry and any 3-digit CVC. More: [Stripe test cards](https://docs.stripe.com/testing#cards).

---

## 4. If something fails

| Symptom | What to check |
|---------|----------------|
| "Backend URL not configured" | `VITE_BACKEND_URL` in `.env` (no trailing slash) |
| "Order not found" or 404 from backend | Order exists in Firestore; `orderId` in URL matches; Firestore rules allow read for your user (or guest if applicable) |
| "Failed to create payment link" | Backend deployed and `stripe.secret_key` set; check Cloud Function logs in Firebase Console |
| CORS error in browser | Backend CORS: set `app.allowed_origin` to your frontend origin, or leave unset for `*` in dev |
| Redirect doesn't happen or Stripe page errors | Check browser console; confirm backend returns `{ url: "https://buy.stripe.com/..." }`; use **Test mode** in Stripe Dashboard |

---

## 5. Testing the webhook (optional)

The backend has a `stripeWebhook` function that updates order status when Stripe sends `checkout.session.completed` (Payment Link payments) or `payment_intent.succeeded` / `payment_intent.payment_failed`.

**Live:** In Stripe Dashboard → Developers → Webhooks, add endpoint:  
`https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`  
Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`.  
Set the signing secret in the backend:  
`firebase functions:config:set stripe.webhook_secret="whsec_..."`

**Local:** Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events to your emulator:  
`stripe listen --forward-to http://localhost:5001/YOUR_PROJECT/us-central1/stripeWebhook`  
Use the CLI’s `whsec_...` as `stripe.webhook_secret` for the emulator.

After a successful test payment, the order in Firestore should have `paymentStatus: 'succeeded'` (from the webhook when Stripe sends `checkout.session.completed`).
