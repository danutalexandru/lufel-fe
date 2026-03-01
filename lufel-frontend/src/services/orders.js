import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'orders';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'pending'
    };
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get all orders (admin only)
export const getOrders = async () => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

// Get orders by status
// Note: We get all orders and filter in JavaScript to avoid Firestore composite index requirements
export const getOrdersByStatus = async (status) => {
  try {
    // Get all orders first
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const allOrders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter by status in JavaScript
    const filteredOrders = allOrders.filter(order => order.status === status);
    return filteredOrders;
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw error;
  }
};

// Get orders for a specific user (for client "My orders" page).
// Query by userId only (no composite index required); sort by createdAt in memory.
export const getOrdersByUserId = async (userId) => {
  try {
    if (!userId) return [];
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => {
      const tA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt ? new Date(a.createdAt) : new Date(0));
      const tB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt ? new Date(b.createdAt) : new Date(0));
      return tB - tA;
    });
    return orders;
  } catch (error) {
    console.error('Error getting orders by user:', error);
    throw error;
  }
};

// Get a single order by ID
export const getOrderById = async (id) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update order payment status
export const updateOrderPaymentStatus = async (id, paymentData) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(orderRef, {
      ...paymentData,
      status: 'processing', // Change status to processing when payment succeeds
      paidAt: serverTimestamp(), // Add payment timestamp
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order payment status:', error);
    throw error;
  }
};

