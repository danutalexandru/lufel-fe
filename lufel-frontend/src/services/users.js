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

// Update user document. Role is never accepted from client (set only on create / server).
export const updateUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const currentDoc = await getDoc(userRef);
    const currentData = currentDoc.exists() ? currentDoc.data() : {};

    const { role: _ignoredRole, ...safeData } = userData;
    const role = currentData.role || 'CUSTOMER';

    await setDoc(userRef, {
      ...safeData,
      role,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

