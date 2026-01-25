import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

// Create a user document with role
export const createUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      role: 'CUSTOMER', // All accounts created from the page are customers
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Get user document with role
export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Update user document (preserves role field)
export const updateUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    // Get current user data to preserve role if not provided
    const currentDoc = await getDoc(userRef);
    const currentData = currentDoc.exists() ? currentDoc.data() : {};
    
    await setDoc(userRef, {
      ...userData,
      role: userData.role || currentData.role || 'CUSTOMER', // Preserve role, default to CUSTOMER
      updatedAt: new Date()
    }, { merge: true }); // merge: true to update only provided fields
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

