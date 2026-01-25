# LUFEL Website

A modern website for LUFEL pottery featuring a presentation page, product shop, and admin dashboard.

## Features

- **Presentation Page**: Showcase the artist's work and story
- **Shop**: Browse and add pottery products to cart
- **Admin Dashboard**: Manage products and orders (authentication required)
- **Guest Checkout**: Customers can order without creating an account
- **Optional Accounts**: Customers can optionally create accounts
- **Payment Processing**: Stripe integration for secure card payments

## Tech Stack

- React 18
- React Router
- Firebase (Firestore & Authentication)
- Tailwind CSS
- Vite

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database (start in test mode, then update rules)
   - Enable Authentication → Sign-in method → Email/Password (enable it)
   - Go to Project Settings → General → Your apps → Web app (create if needed)
   - Copy your Firebase config values
   - Create a `.env` file in the root directory (copy from `.env.example`)
   - Fill in your Firebase config values in the `.env` file

3. Set up Stripe (for payment processing):
   - Create a Stripe account at https://stripe.com
   - Go to Developers → API keys
   - Copy your **Publishable key** (starts with `pk_test_` for test mode)
   - Add it to your `.env` file as `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Important**: You'll need a backend endpoint to create Payment Intents (see Backend Setup below)

4. Configure Firebase Security Rules:
   - **Firestore Rules**: Go to Firestore Database → Rules
     - Copy the contents from `firestore.rules` file in this project
     - Paste and publish the rules
     - Rules allow: Products (read: all, write: authenticated), Orders (create: all, read/update: authenticated)
   - **Storage Rules**: Go to Storage → Rules
     - Copy the contents from `storage.rules` file in this project
     - Paste and publish the rules
     - Rules allow: Authenticated users can upload product images, everyone can read them

5. Create an admin user:
   - Go to Authentication → Users
   - Click "Add user" and create an account with email/password
   - Use this account to log into the admin dashboard

6. Run the development server:
```bash
npm run dev
```

## Backend Setup (Required for Payments)

Stripe requires a backend to securely create Payment Intents. You have several options:

### Option 1: Firebase Cloud Functions (Recommended)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Functions: `firebase init functions`
3. Install Stripe: `cd functions && npm install stripe`
4. Create a Cloud Function that:
   - Accepts POST requests with `orderId` and `amount`
   - Validates the order exists in Firestore
   - Creates a Stripe Payment Intent using your Stripe secret key
   - Returns the `clientSecret`
5. Deploy: `firebase deploy --only functions`
6. Update `VITE_BACKEND_URL` in `.env` to your Cloud Function URL

### Option 2: Separate Node.js Backend

Create a simple Express server with an endpoint that creates Payment Intents. See Stripe documentation for examples.

### Option 3: Development Only - Stripe CLI

For local development, you can use Stripe CLI to create test payment intents, but this is not recommended for production.

**Important**: Never expose your Stripe secret key in frontend code. Always use a backend.

## Project Structure

- `src/pages/` - Page components (Home, Shop, Admin, Payment, etc.)
- `src/components/` - Reusable UI components
- `src/context/` - React Context providers (Auth, Cart)
- `src/services/` - Firebase and Stripe service functions
- `src/utils/` - Utility functions

