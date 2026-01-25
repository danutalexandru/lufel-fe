// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
// Vite requires VITE_ prefix for environment variables exposed to client
// Create a .env file in the root directory with your Firebase config

const firebaseConfig = {
  apiKey: "AIzaSyDi3k3Giq_owteogk7dLl86-T1PSsgooMU",
  authDomain: "lufel-shop-dev.firebaseapp.com",
  projectId: "lufel-shop-dev",
  storageBucket: "lufel-shop-dev.firebasestorage.app",
  messagingSenderId: "717042458376",
  appId: "1:717042458376:web:d696b6d0946fe2eae756bd",
  measurementId: "G-SNC9VW1T3X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

