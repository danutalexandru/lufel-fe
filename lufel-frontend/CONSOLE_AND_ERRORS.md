# Console logs not showing / project full of errors

If you don’t see your `console.log` messages or the app shows a blank screen or “full of errors”, use this checklist.

---

## 1. Make sure console shows all levels

In the browser **Developer Tools** (F12) → **Console** tab:

- Set the log level to **All levels** or **Verbose** (not only “Errors” or “Warnings”).  
  `console.log` is “Info”; if the filter is “Errors” only, you won’t see it.
- Enable **Preserve log** if you’re testing pages that redirect (e.g. payment), so the console isn’t cleared on navigation.

---

## 2. Confirm the app is running

After opening the site you should see:

- **`[LUFEL] App booting…`** in the console (added in `main.jsx`).

If you don’t see it:

- The script may not be loading (check for red errors in the Console).
- You might be on a different tab/iframe; make sure the Console is for the tab where your app is open.

---

## 3. Errors crashing the app

If there are **red errors** in the Console, they can stop React before your page (and your `console.log`) runs.

- Read the **first** error and the file/line it points to.
- An **Error Boundary** is now wrapping the app: if a component throws, you’ll see “Ceva nu a mers bine” and the real error is logged as **`[LUFEL] Error boundary caught:`** in the console.

Fix those errors first; then your logs should appear when the relevant code runs.

---

## 4. Build vs dev

- Use **`npm run dev`** for local development. Logs are visible and source maps make errors easier to read.
- If you run **`npm run build`** and open `dist/` (e.g. with `npm run preview`), the code is minified; logs still run but stack traces are harder to read.

---

## 5. Payment page specifically

On `/payment/:orderId`, logs like `successUrl`, `createPaymentLink`, `fullUrl` run when the Payment component mounts. If you never see them:

- The Payment route might not be mounting (e.g. stuck on auth loading, or an error in a parent component).
- Check for any error **before** “Se încarcă…” or “Se deschide pagina de plată…”.

See **PAYMENT_TROUBLESHOOTING.md** for payment/backend issues (e.g. 403, wrong URL).
