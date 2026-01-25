# LUFEL Backend - Firebase Cloud Functions

Backend Cloud Functions for LUFEL pottery shop, handling Stripe payment processing.

## Features

- **Payment Intent Creation**: Creates Stripe Payment Intents for orders
- **Webhook Handler**: Processes Stripe payment events (optional but recommended)

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

### 4. Configure Stripe

Set your Stripe secret key and webhook secret (optional) using Firebase Functions config:

```bash
# Set Stripe secret key (get from Stripe Dashboard → Developers → API keys)
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key_here"

# Set webhook secret (optional, get from Stripe Dashboard → Developers → Webhooks)
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret_here"
```

For production, use your live keys (starting with `sk_live_`).

### 5. Deploy Functions

```bash
firebase deploy --only functions
```

After deployment, you'll get URLs like:
- `https://your-region-your-project.cloudfunctions.net/createPaymentIntent`
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
- `http://localhost:5001/your-project/your-region/createPaymentIntent`

Update your frontend `VITE_BACKEND_URL` to point to the emulator URL during development.

## API Endpoints

### POST /createPaymentIntent

Creates a Stripe Payment Intent for an order.

**Request Body:**
```json
{
  "orderId": "order_id_from_firestore",
  "amount": 5000,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

**Error Responses:**
- `400`: Missing required fields or invalid input
- `404`: Order not found
- `500`: Server error

### POST /stripeWebhook

Handles Stripe webhook events (payment succeeded, failed, etc.).

**Note:** Configure this URL in Stripe Dashboard → Developers → Webhooks

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

