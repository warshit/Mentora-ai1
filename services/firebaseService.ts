import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp, where, limit } from "firebase/firestore";
import { auth, db } from './firebase';

// Types
export interface UserData {
  email: string;
  rollNumber: string;
  createdAt: any;
}

export interface AIHistoryEntry {
  prompt: string;
  normalizedPrompt: string;
  response: string;
  createdAt: any;
}

export interface CachedAIResponse {
  response: string;
  createdAt: any;
}

// Extract roll number from IARE email
const extractRollNumber = (email: string): string => {
  const match = email.match(/^(\d{8}[a-zA-Z]\d{2}[a-zA-Z]\d{2})@iare\.ac\.in$/);
  return match ? match[1].toUpperCase() : '';
};

// Validate IARE email format
const isValidIAREEmail = (email: string): boolean => {
  return /^\d{8}[a-zA-Z]\d{2}[a-zA-Z]\d{2}@iare\.ac\.in$/.test(email);
};

// Authentication functions
export const signUpWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isValidIAREEmail(email)) {
      return { success: false, error: "Only @iare.ac.in emails are allowed" };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    const rollNumber = extractRollNumber(email);
    const userData: UserData = {
      email,
      rollNumber,
      createdAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isValidIAREEmail(email)) {
      return { success: false, error: "Only @iare.ac.in emails are allowed" };
    }

    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Get current user data from Firestore
export const getCurrentUserData = async (): Promise<UserData | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return userDoc.exists() ? userDoc.data() as UserData : null;
};

// Utility function to normalize prompts for caching
const normalizePrompt = (prompt: string): string => {
  return prompt.trim().toLowerCase();
};

// AI Response Caching functions
export const getCachedAIResponse = async (prompt: string): Promise<CachedAIResponse | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const normalizedPrompt = normalizePrompt(prompt);
  
  try {
    // Simplified query without orderBy to avoid composite index requirement
    // We'll just get all matches and sort in memory (should be 1 or very few results)
    const q = query(
      collection(db, 'users', user.uid, 'aiHistory'),
      where('normalizedPrompt', '==', normalizedPrompt),
      limit(5) // Get up to 5 matches, we'll use the most recent
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Sort by createdAt in memory and get the most recent
      const docs = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as AIHistoryEntry & { id: string }))
        .sort((a, b) => b.createdAt - a.createdAt);
      
      const mostRecent = docs[0];
      console.log('✅ Cache hit! Found cached response from', new Date(mostRecent.createdAt).toLocaleString());
      
      return {
        response: mostRecent.response,
        createdAt: mostRecent.createdAt
      };
    }
    
    console.log('❌ Cache miss - no cached response found');
    return null;
  } catch (error) {
    console.error('Error fetching cached AI response:', error);
    // Don't throw - just return null and let the API call proceed
    return null;
  }
};

export const saveAIResponseWithCache = async (prompt: string, response: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const normalizedPrompt = normalizePrompt(prompt);
  
  const aiHistoryEntry: AIHistoryEntry = {
    prompt,
    normalizedPrompt,
    response,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'users', user.uid, 'aiHistory'), aiHistoryEntry);
  } catch (error) {
    console.error('Error saving AI response to cache:', error);
    throw error;
  }
};

// Legacy AI History functions (updated to include normalizedPrompt)
export const saveAIResponse = async (prompt: string, response: string): Promise<void> => {
  // Use the new caching function for backward compatibility
  await saveAIResponseWithCache(prompt, response);
};

export const getAIHistory = async (): Promise<AIHistoryEntry[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, 'users', user.uid, 'aiHistory'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AIHistoryEntry);
  } catch (error) {
    console.error('Error fetching AI history:', error);
    return [];
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};