# Payment page error – troubleshooting

If you set `VITE_CREATE_PAYMENT_LINK_URL` (e.g. `https://createpaymentlink-42gclscyoq-uc.a.run.app`) and still get an error when opening the payment page, check the following.

---

## 1. .env format and restart

In the **frontend** project root, in `.env`:

- Variable name must be **exactly**: `VITE_CREATE_PAYMENT_LINK_URL`
- No spaces around `=`
- No quotes (unless your URL has spaces, which it shouldn’t)

Example:

```env
VITE_CREATE_PAYMENT_LINK_URL=https://createpaymentlink-42gclscyoq-uc.a.run.app
```

After changing `.env`, **restart the dev server** (stop and run `npm run dev` again). Vite only reads env at startup.

---

## 2. 403 Forbidden (most common with Cloud Run)

Your URL is a **Cloud Run** URL (2nd gen function). By default, Cloud Run can require authentication, so the browser request from your site gets **403 Forbidden** and you see “error” or “failed to load”.

**Fix: allow unauthenticated access for the createPaymentLink service**

1. Open [Google Cloud Console](https://console.cloud.google.com) and select the same project as your Firebase project (e.g. **lufel-shop-dev**).
2. Go to **Cloud Run** (search “Cloud Run” in the top bar or use the menu).
3. In the list of services, click **createpaymentlink** (or the name that matches your URL).
4. Open the **Permissions** or **Security** tab.
5. Click **Add principal** (or **Manage access**).
6. In **New principals**, enter: `allUsers`
7. In **Role**, choose **Cloud Run Invoker**.
8. Save.

Alternatively, in the Cloud Run service details, look for **“Allow unauthenticated invocations”** and turn it **on**.

Then try the payment flow again from your site.

---

## 3. See the real error in the browser

1. Open your site and go to the payment page (so the error happens).
2. Press **F12** → **Network** tab.
3. Find the request to `createpaymentlink` (or your Cloud Run URL).
4. Click it and check:
   - **Status**: 403 → do step 2 above; 404 → wrong URL; 500 → backend error (check function logs).
   - **Response** (or **Preview**) for the error message.

In the **Console** tab you might see a CORS message; often the underlying cause is **403** (no CORS headers are sent when Cloud Run blocks the request).

---

## 4. CORS

If the backend returns a proper response but the browser still reports CORS:

- The function sets `Access-Control-Allow-Origin: *` when `APP_ALLOWED_ORIGIN` is not set.
- If you set `APP_ALLOWED_ORIGIN` in the backend (e.g. in `functions/.env`), it must match your frontend origin exactly (e.g. `http://localhost:5173` or `https://yourdomain.com`).

For local testing you can leave `APP_ALLOWED_ORIGIN` unset so the backend uses `*`.
