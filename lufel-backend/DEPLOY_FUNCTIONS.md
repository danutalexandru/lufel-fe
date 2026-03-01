# Deploy Firebase Functions so they appear in the Dashboard

Functions only show in the Firebase Console **after** you deploy them. Follow these steps from the **backend** project.

## 1. Open the backend folder

```bash
cd C:\work\lufel-backend
```

(Or wherever your `lufel-backend` folder is. You must be in the folder that contains `firebase.json` and `.firebaserc`.)

## 2. Install dependencies in `functions/`

```bash
cd functions
npm install
cd ..
```

## 3. Set Stripe secret (required before first deploy)

The code uses **Secret Manager**. Set the Stripe secret key first:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
```

When prompted, paste your Stripe **secret key** (`sk_test_...` from [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys)).

**Important:** Paste only the key, with no extra spaces or newlines. If you get **"Invalid API Key provided"** later, the secret was likely saved with a newline—re-set it (see below).

(You can set `STRIPE_WEBHOOK_SECRET` later; the deploy will prompt for it or you can skip and set it after.)

## 4. Deploy

```bash
firebase deploy --only functions
```

- If the CLI asks for **STRIPE_WEBHOOK_SECRET**, you can press Enter to skip (or paste `whsec_...` if you already have a webhook).
- Wait for the deploy to finish. You should see URLs like:
  - `createPaymentLink: https://REGION-PROJECT.cloudfunctions.net/createPaymentLink`
  - `stripeWebhook: https://REGION-PROJECT.cloudfunctions.net/stripeWebhook`

## 5. Check the Dashboard

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project **lufel-shop-dev** (or the project in your `.firebaserc`)
3. In the left menu: **Build** → **Functions**

You should see **createPaymentLink** and **stripeWebhook** listed.

---

## If deploy fails

### "Failed to create function createPaymentLink / stripeWebhook in region us-central1"

1. **Get the real error**  
   Run:
   ```bash
   firebase deploy --only functions --debug
   ```
   Scroll to the end of the output and look for the first red **Error:** or the line after "Failed to create function". That message (e.g. permission, billing, API) is what you need to fix.

2. **Billing – 2nd gen requires Blaze**  
   Cloud Functions (2nd gen) need the **Blaze** (pay-as-you-go) plan.  
   - [Firebase Console](https://console.firebase.google.com) → your project → **Upgrade** (or **Usage and billing**).  
   - Upgrade to **Blaze** if you’re on Spark. You only pay for what you use; there is a free tier.

3. **APIs enabled**  
   In [Google Cloud Console](https://console.cloud.google.com) → your project → **APIs & Services** → **Enabled APIs**, ensure these are enabled:
   - **Cloud Functions API**
   - **Cloud Build API**
   - **Secret Manager API**
   - **Artifact Registry API**

4. **Secrets must exist**  
   If you haven’t set the secrets yet:
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   ```
   Enter your Stripe secret key. Then deploy again.

5. **Node version**  
   This project uses **Node 20** in `functions/package.json`. If you changed it to Node 24 and deploy fails, set it back to `"node": "20"` and redeploy.

---

- **"An unexpected error has occurred"**  
  Run `firebase login` and sign in again. Then run `firebase deploy --only functions --debug` and use the detailed error to fix the issue.

- **"Permission denied" / "API not enabled"**  
  Enable **Cloud Functions**, **Cloud Build**, and **Secret Manager** for your project (Console → Project settings, or follow the link in the error).

- **"STRIPE_SECRET_KEY not set"**  
  Run `firebase functions:secrets:set STRIPE_SECRET_KEY` and enter your Stripe secret key, then deploy again.

- **"Invalid API Key provided" (StripeAuthenticationError)**  
  The secret in Firebase was saved with extra characters (often a newline). Re-set it:
  1. Get the key again from [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys) (Secret key, **Reveal** → copy).
  2. Run: `firebase functions:secrets:set STRIPE_SECRET_KEY`
  3. Paste **only** the key (no space or Enter after it). If the CLI adds a newline when you press Enter, use the **file method**: put the key in a one-line file (e.g. `stripe_key.txt` with just `sk_test_...`) and run:  
     `firebase functions:secrets:set STRIPE_SECRET_KEY < stripe_key.txt`  
     (Then delete the file.)
  4. Redeploy: `firebase deploy --only functions`  
  The code now trims the key; redeploy ensures the updated code is live.

- **Wrong project**  
  Check `.firebaserc`: `"default": "lufel-shop-dev"`. To use another project: `firebase use PROJECT_ID`.

- **Deploy from wrong directory**  
  You must run `firebase deploy --only functions` from the folder that contains `firebase.json` (the backend root), not from inside `functions/`.
