// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables (preferred) or fallback for local dev
// Set VITE_FIREBASE_* in .env; see .env.example

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyDi3k3Giq_owteogk7dLl86-T1PSsgooMU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "lufel-shop-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "lufel-shop-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "lufel-shop-dev.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "717042458376",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:717042458376:web:d696b6d0946fe2eae756bd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-SNC9VW1T3X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

