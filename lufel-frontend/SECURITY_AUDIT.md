# LUFEL Security Audit Report

**Date:** 2025-02-01  
**Scope:** lufel-frontend, lufel-backend (and shared Firebase config/rules)

---

## Executive Summary

Several **critical** and **high** severity issues were found that could lead to payment fraud, privilege escalation, and data tampering. Recommended fixes are listed below; critical items should be addressed immediately.

---

## Critical

### 1. Payment amount taken from client (backend) — **Price manipulation**

**Location:** `lufel-backend/index.js` — `createPaymentIntent`

**Issue:** The Stripe Payment Intent is created using the `amount` sent in the request body from the client. An attacker can create a real order (e.g. $100), then call the backend with `orderId` and `amount: 1` (1 cent). The backend creates a 1-cent Payment Intent; after payment the webhook marks the order as paid. Result: order fulfilled for 1 cent.

**Evidence:**
```javascript
const { orderId, amount, currency = 'usd' } = req.body;
// ...
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount),  // ← uses client value
  // ...
});
```

**Fix:** Ignore client-supplied amount. Compute amount from the order in Firestore (e.g. `orderData.total` in dollars → cents) and use that for `stripe.paymentIntents.create({ amount: ... })`. Optionally accept `orderId` only and derive currency from order if needed.

---

### 2. Any authenticated user can modify products (Firestore)

**Location:** `lufel-frontend/firestore.rules` — `match /products/{productId}`

**Issue:** Rule is `allow write: if request.auth != null`. Any signed-in user (including CUSTOMER) can create, update, or delete any product.

**Fix:** Restrict product writes to admins only, e.g.:
```text
allow write: if request.auth != null &&
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
```

---

### 3. Users can promote themselves to ADMIN (Firestore + app)

**Location:**  
- `lufel-frontend/firestore.rules` — `match /users/{userId}`  
- `lufel-frontend/src/services/users.js` — `updateUserDocument` accepts `userData.role`

**Issue:** A user can update their own Firestore document (rule: `request.auth.uid == userId`). The app’s `updateUserDocument` merges `userData.role` into the document. So a user can set their own `role` to `ADMIN` (e.g. via DevTools or a modified client) and gain admin access.

**Fix:**  
1. **Firestore:** Allow profile updates but forbid changing `role`: e.g. require `request.resource.data.role == resource.data.role` (or equivalent) so role cannot be changed by the client.  
2. **App:** In `updateUserDocument`, never send or merge `role` from client input; set role only on the server (e.g. Cloud Function) or at first creation (e.g. signup as CUSTOMER).

---

## High

### 4. Firebase config hardcoded in frontend

**Location:** `lufel-frontend/src/services/firebase.js`

**Issue:** API key, projectId, and other Firebase config are hardcoded. Comments say to use env vars, but the code uses literals. This bakes project identifiers (and possibly keys) into the repo and build.

**Fix:** Use environment variables (e.g. `import.meta.env.VITE_FIREBASE_*`) and load config from them. Add `.env.example` with placeholder keys; keep real values in `.env` (and ensure `.env` is gitignored).

---

## Medium

### 5. CORS set to `*` on backend

**Location:** `lufel-backend/index.js` — `createPaymentIntent`

**Issue:** `res.set('Access-Control-Allow-Origin', '*')` allows any origin to call the payment endpoint. This increases risk of abuse from arbitrary sites (e.g. CSRF-style flows or scripting against your backend).

**Fix:** Set `Access-Control-Allow-Origin` to your frontend origin(s) only (e.g. from env: `VITE_APP_URL` or a dedicated backend env like `ALLOWED_ORIGIN`). Use a single origin in production.

---

### 6. Server error details returned to client

**Location:** `lufel-backend/index.js` — catch block in `createPaymentIntent`

**Issue:** On 500, the response includes `message: error.message`. Stripe or Node errors can expose internal or sensitive information.

**Fix:** Log the full error server-side; return a generic message to the client (e.g. “Failed to create payment intent”) and avoid sending `error.message` or stack traces.

---

## Low / Informational

### 7. Guest checkout and order read access

**Location:** `lufel-frontend/firestore.rules` — `match /orders/{orderId}`

**Issue:** Orders allow `read: if request.auth != null`. Guest users are not authenticated, so after creating an order they cannot read it. The Payment page calls `getOrderById(orderId)`; for a guest this will fail with permission denied, so the payment flow may break for guests.

**Recommendation:** If guest checkout is required, add a rule that allows reading an order by ID only in a constrained way (e.g. by a stable token in the URL or a short-lived token stored on the order), or serve order details via a backend that validates the token. If guest checkout is not needed, document that and optionally redirect guests to register before payment.

---

### 8. Webhook secret not configured

**Location:** `lufel-backend/index.js` — `stripeWebhook`

**Issue:** If `stripe.webhook_secret` is not set, `stripe.webhooks.constructEvent(..., webhookSecret)` receives `undefined` and can throw, leading to 400/500. Behavior is “fail closed” but unclear for operators.

**Recommendation:** At the start of the handler, if `!webhookSecret`, return 503 with a clear body (e.g. “Webhook not configured”) and do not process the event.

---

### 9. No Content-Security-Policy (CSP)

**Location:** `lufel-frontend/index.html` (and any hosting config)

**Issue:** No CSP headers are set. Defense-in-depth against XSS and other content injection is reduced.

**Recommendation:** Add a CSP meta tag or server headers (e.g. on Firebase Hosting) with a strict policy, and allow only required origins for scripts, styles, and Stripe.

---

## Summary Table

| # | Severity  | Area           | Issue                                      |
|---|-----------|----------------|--------------------------------------------|
| 1 | Critical  | Backend        | Payment amount from client → price fraud   |
| 2 | Critical  | Firestore      | Any auth user can write products           |
| 3 | Critical  | Firestore / App| User can set own role to ADMIN             |
| 4 | High      | Frontend       | Firebase config hardcoded                  |
| 5 | Medium    | Backend        | CORS `*`                                   |
| 6 | Medium    | Backend        | Error message leakage in 500               |
| 7 | Low       | Firestore      | Guest cannot read order (flow break)        |
| 8 | Low       | Backend        | Webhook secret handling when unset         |
| 9 | Info      | Frontend       | No CSP                                     |

---

## Fixes Applied (2025-02-01)

- **#1 (Payment amount):** Backend now uses only the order total from Firestore for the Payment Intent amount; client-supplied amount is ignored. Frontend `createPaymentIntent` now sends only `orderId`.
- **#2 (Products write):** Firestore rules restrict product writes to users with `role == 'ADMIN'` (via `get(users/$(request.auth.uid)).data.role`).
- **#3 (Role escalation):** Firestore rules forbid changing `role` on user update; `updateUserDocument` strips `role` from client input and keeps existing role.
- **#4 (Firebase config):** Firebase config is read from `VITE_FIREBASE_*` env vars with fallbacks; `.env.example` added.
- **#5 (CORS):** Backend uses `app.allowed_origin` from Firebase config when set; otherwise `*`. Set with `firebase functions:config:set app.allowed_origin="https://yourdomain.com"`.
- **#6 (Error leakage):** Backend 500 response no longer includes `error.message`.

---

## Next Steps

1. Deploy Firestore rules and backend, then re-test payment and admin flows.  
2. Deploy backend and Firestore rules, then frontend.  
3. Re-test payment flow (including attempted amount manipulation) and admin/product flows.  
4. Optionally add rate limiting or abuse detection on `createPaymentIntent` and enforce CSP.
