# LUFEL Backend - Firebase Cloud Functions

Backend Cloud Functions for LUFEL pottery shop, handling Stripe payment processing.

## Features

- **Payment Link Creation**: Creates Stripe Payment Links for orders (hosted checkout); amount from Firestore.
- **Webhook Handler**: Processes Stripe events (`checkout.session.completed`, `payment_intent.succeeded` / `payment_intent.payment_failed`).

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Firebase CLI

If you haven't already:

```bash
npm install -g firebase-tools
```

### 3. Initialize Firebase (if not already done)

```bash
firebase login
firebase init functions
```

When prompted:
- Select your Firebase project
- Choose JavaScript
- Install dependencies: Yes

### 4. Configure Stripe (params / Secret Manager)

The backend uses **Firebase params** (no deprecated `functions.config()`). Stripe keys are stored in **Secret Manager**.

| What | Where to get it |
|------|-----------------|
| **Secret key** (`sk_test_...`) | [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API keys** |
| **Webhook signing secret** (`whsec_...`) | Create a Webhook in Stripe (see below); then **Reveal** signing secret |

**Step 1 – Set Stripe secret key (required):**

From the **backend** directory (or `functions/` if you run from there):

```bash
cd functions
firebase functions:secrets:set STRIPE_SECRET_KEY
```

When prompted, paste your Stripe **secret key** (`sk_test_...` or `sk_live_...`).

**Step 2 – Set webhook secret (optional; needed so orders are marked “paid” automatically):**

1. Deploy once: `firebase deploy --only functions`
2. In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
3. **Endpoint URL:** `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
4. **Events:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
5. After creating the webhook, click **Reveal** under **Signing secret** and copy `whsec_...`
6. Set it:

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Paste the `whsec_...` value when prompted, then **redeploy**: `firebase deploy --only functions`.

**Optional – CORS (allowed origin):**  
To restrict CORS to your frontend URL, create `functions/.env` or `functions/.env.<project_id>` with:

```
APP_ALLOWED_ORIGIN=https://yourdomain.com
```

If not set, the backend allows `*`. For production, use live Stripe keys and a live webhook to get a live `whsec_...`.

### 5. Deploy Functions

```bash
firebase deploy --only functions
```

After deployment, you'll get URLs like:
- `https://your-region-your-project.cloudfunctions.net/createPaymentLink`
- `https://your-region-your-project.cloudfunctions.net/stripeWebhook`

### 6. Update Frontend Configuration

In your frontend `.env` file, set:

```
VITE_BACKEND_URL=https://your-region-your-project.cloudfunctions.net
```

## Local Development

To test functions locally:

```bash
npm run serve
```

This starts the Firebase emulator. The functions will be available at:
- `http://localhost:5001/your-project/your-region/createPaymentLink`

Update your frontend `VITE_BACKEND_URL` to point to the emulator URL during development.

## API Endpoints

### POST /createPaymentLink

Creates a Stripe Payment Link for an order. The customer is redirected to Stripe's hosted checkout; after payment they are redirected to `successUrl`. Amount is taken from the order in Firestore.

**Request Body:**
```json
{
  "orderId": "order_id_from_firestore",
  "successUrl": "https://yoursite.com/order-confirmation/ORDER_ID"
}
```

**Response:**
```json
{
  "url": "https://buy.stripe.com/..."
}
```

**Error Responses:**
- `400`: Missing required fields or invalid input
- `404`: Order not found
- `500`: Server error

### POST /stripeWebhook

Handles Stripe webhook events: `checkout.session.completed` (Payment Link payments), `payment_intent.succeeded`, `payment_intent.payment_failed`.

**Note:** In Stripe Dashboard → Developers → Webhooks, add endpoint with URL above and subscribe to: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`.

## Security

- Never expose your Stripe secret key in frontend code
- Always use Firebase Functions config for sensitive keys
- Enable CORS only for your frontend domain in production
- Validate all input data
- Verify webhook signatures

## Testing

Use Stripe test mode with test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC will work in test mode.

## Project Structure

```
lufel-backend/
├── index.js          # Cloud Functions code
├── package.json      # Dependencies and scripts
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

