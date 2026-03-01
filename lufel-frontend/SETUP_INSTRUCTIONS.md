# Setup Instructions

## Prerequisites

1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - Install the LTS version (recommended)
   - This will also install npm (Node Package Manager)

2. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```

## Running the Project

Once Node.js is installed, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (Required)
Before running the app, you need to set up Firebase:

1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in test mode (we'll update rules)
4. Enable **Authentication**:
   - Go to Authentication → Get started
   - Enable "Email/Password" sign-in method
5. Get your Firebase config:
   - Go to Project Settings (gear icon) → General
   - Scroll to "Your apps" → Web app (create if needed)
   - Copy the `firebaseConfig` object
6. Update `src/services/firebase.js`:
   - Replace the placeholder values with your actual Firebase config
7. Set up Security Rules:
   - Go to Firestore Database → Rules
   - Copy and paste the contents from `firestore.rules` file in this project
   - Click "Publish"
8. Create an admin user:
   - Go to Authentication → Users → Add user
   - Create an account (this will be your admin login)

### 3. Run Development Server
```bash
npm run dev
```

The app will start on `http://localhost:5173` (or another port if 5173 is busy)

## Important Notes

- **Firebase configuration is required** - The app won't work without it
- You need at least one admin user in Firebase Authentication to access the admin dashboard
- The app uses Firebase Storage for product images, so make sure Storage is enabled in your Firebase project (it's usually enabled automatically with Firestore)

## Troubleshooting

- **Firebase errors:** Make sure you've updated `src/services/firebase.js` (or `.env` with `VITE_FIREBASE_*`) with your actual config.
- **Authentication doesn't work:** Check that Email/Password is enabled in Firebase Authentication.
- **Can't access admin:** Make sure you created an admin user in Firebase Authentication and set their `role` to `ADMIN` in the `users` collection (see README).

### Products don't load

1. **Firestore database created**
   - In [Firebase Console](https://console.firebase.google.com) → your project → **Firestore Database**.
   - If you see "Create database", create it (choose a region, then start in test mode or production and add rules).

2. **Rules deployed**
   - Firestore Database → **Rules**.
   - Paste the contents of this project's `firestore.rules` and click **Publish**.
   - Products need `allow read: if true` so the shop can load without login.

3. **Check the browser console**
   - Open DevTools (F12) → Console. When you open the Shop page, look for errors:
     - **permission-denied:** Rules are blocking read, or Firestore isn’t created. Deploy `firestore.rules` and ensure the database exists.
     - **unavailable:** Network or wrong project. Check `.env` / Firebase config and that the project has Firestore enabled.
   - The exact error code and message are logged when loading fails.

4. **Empty list vs error**
   - If the Shop page loads but shows "Momentan nu sunt produse disponibile.", the database connection works and the `products` collection is empty. Add products from the admin dashboard (Admin → Products).

