import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserDocument, getUserDocument } from '../services/users';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up (for customers) - creates user with CUSTOMER role
  const signup = useCallback(async (email, password, additionalData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore with CUSTOMER role
    await createUserDocument(user.uid, {
      email: user.email,
      ...additionalData
    });
    
    return userCredential;
  }, []);

  // Login (for admin and customers)
  const login = useCallback(async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setUserRole(null);
    return await signOut(auth);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Set loading to false immediately so page can render
        setLoading(false);
        // Fetch user data from Firestore in background (non-blocking)
        getUserDocument(user.uid)
          .then((userDoc) => {
            // Default to CUSTOMER role if not set
            const role = userDoc?.role || 'CUSTOMER';
            setUserRole(role);
            setUserData(userDoc ? { ...userDoc, role } : null);
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
            // Default to CUSTOMER if there's an error fetching
            setUserRole('CUSTOMER');
            setUserData(null);
          });
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    currentUser,
    userRole,
    userData,
    signup,
    login,
    logout,
    isAdmin: userRole === 'ADMIN'
  }), [currentUser, userRole, userData, signup, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-ceramic-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Se încarcă...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

