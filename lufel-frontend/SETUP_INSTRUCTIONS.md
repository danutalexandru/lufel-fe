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

- If you get Firebase errors: Make sure you've updated `src/services/firebase.js` with your actual config
- If authentication doesn't work: Check that Email/Password is enabled in Firebase Authentication
- If you can't access admin: Make sure you created an admin user in Firebase Authentication console

