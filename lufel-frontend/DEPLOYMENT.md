# Deploying the LUFEL Frontend

The app is a Vite + React SPA. You can host it on **Firebase Hosting** (same project as your backend) or **Vercel** (easiest).

---

## Deploy dev version (current setup)

Use your existing `.env` (lufel-shop-dev, current backend URL). No separate production config.

### Firebase Hosting (recommended for dev)

```bash
cd C:\work\lufel-frontend
firebase login
firebase use lufel-shop-dev
npm run build
firebase deploy --only hosting
```

Site will be at **https://lufel-shop-dev.web.app**.

**Important:** Always run `npm run build` **before** `firebase deploy`. The deploy uploads whatever is in `dist/`. If you changed code (e.g. Home video) but didn’t rebuild, the old build is what gets deployed.

### If the deployed site still shows old content

1. **Rebuild and redeploy:** From `lufel-frontend` run `npm run build` then `firebase deploy --only hosting`.
2. **Browser cache:** Do a hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac) or open the site in an incognito/private window.
3. **Check the build:** Before deploying, confirm `dist/index.html` and `dist/videos/hero-mobile.mp4` (and `hero-desktop.mp4`) exist. If you added videos to `public/videos/` after the last build, run `npm run build` again so they are copied into `dist/`.

`firebase.json` is set so `index.html` is not cached; after a new deploy, a normal refresh should load the new version.

### After first deploy

1. **Firebase Auth**  
   [Console](https://console.firebase.google.com) → your project → **Authentication** → **Settings** → **Authorized domains** → add `lufel-shop-dev.web.app` (and your Vercel domain if you use Vercel).

2. **Backend (createPaymentLink)**  
   Set `APP_ALLOWED_ORIGIN` to your deployed URL so payment redirects work, e.g. `https://lufel-shop-dev.web.app`. (If you leave it unset, redirect validation is skipped; setting it is recommended for security.)

---

## Option A: Firebase Hosting (same project as your backend)

Good if you want everything under one Firebase project.

### 1. One-time setup in the frontend folder

A `firebase.json` for Hosting is already in this folder. Link the app to your Firebase project:

```bash
cd C:\work\lufel-frontend
npm install -g firebase-tools   # if not already
firebase login
firebase use lufel-shop-dev     # or your Firebase project ID
```

No need to run `firebase init hosting`—the config is already set (public: `dist`, SPA rewrites).

### 2. Build with production env

Create a production env file (do **not** commit real secrets to Git; use a `.env.production.local` and add it to `.gitignore` if it contains secrets):

- Either copy `.env` to `.env.production` and adjust values for production (e.g. production backend URL),  
- Or keep using `.env` and ensure it has the correct `VITE_*` variables for production.

Then build:

```bash
npm run build
```

### 3. Deploy

```bash
firebase deploy --only hosting
```

Your site will be at: `https://<project-id>.web.app` and `https://<project-id>.firebaseapp.com`.

### 4. (Optional) Custom domain

In [Firebase Console](https://console.firebase.google.com) → your project → **Hosting** → **Add custom domain**, follow the steps.

---

## Option B: Vercel (easiest, great for React/Vite)

### 1. Push your code to GitHub (if not already)

### 2. Import project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** → Import your repo.
3. **Root Directory:** set to the frontend folder (e.g. `lufel-frontend` if the repo root is above it, or `.` if the repo is the frontend).
4. **Framework Preset:** Vite (auto-detected).
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`

### 3. Environment variables

In the Vercel project → **Settings** → **Environment Variables**, add each variable from your `.env` that the app needs at build time (all `VITE_*` ones), e.g.:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_CREATE_PAYMENT_LINK_URL` (your backend URL, e.g. Cloud Run)

Save and redeploy so the build uses them.

### 4. Deploy

Vercel will build and deploy. You get a URL like `https://your-project.vercel.app`. Each Git push can trigger a new deploy if you enabled that.

### 5. (Optional) Custom domain

In the Vercel project → **Settings** → **Domains**, add your domain.

---

## After deploying: backend and security

1. **Allowed origin (createPaymentLink)**  
   Set your **production frontend URL** as the allowed origin so payment links only redirect back to your site:
   - Firebase / Cloud Run: set `APP_ALLOWED_ORIGIN` to your deployed URL, e.g. `https://lufel-shop-dev.web.app` or `https://your-app.vercel.app`.

2. **Firebase Auth authorized domains**  
   In [Firebase Console](https://console.firebase.google.com) → **Authentication** → **Settings** → **Authorized domains**, add your deployed domain (e.g. `your-app.vercel.app` or your custom domain).

3. **Stripe**  
   If you use Stripe redirect or success URLs, point them to your production frontend URL (e.g. `https://your-site.com/order-confirmation/...`).

---

## Quick reference

| Step              | Firebase Hosting           | Vercel                          |
|-------------------|----------------------------|----------------------------------|
| Build             | `npm run build` (local)    | Automatic on push / deploy      |
| Env vars          | In `.env.production` / build | Project → Settings → Env vars |
| Deploy command    | `firebase deploy --only hosting` | Push to Git or “Deploy” in dashboard |
| Default URL       | `https://<project>.web.app` | `https://<project>.vercel.app`   |
