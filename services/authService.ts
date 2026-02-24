import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Email domain validation
const ALLOWED_DOMAIN = '@iare.ac.in';

export const validateEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN);
};

// Extract roll number from email
export const extractRollNumber = (email: string): string => {
  const localPart = email.split('@')[0];
  return localPart.toUpperCase();
};

// User data interface
export interface UserData {
  email: string;
  rollNumber: string;
  createdAt: any;
}

// Create user document in Firestore
const createUserDocument = async (user: User): Promise<void> => {
  const rollNumber = extractRollNumber(user.email!);
  
  const userData: UserData = {
    email: user.email!,
    rollNumber,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'users', user.uid), userData);
};

// Sign up with email validation
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  // Validate email domain
  if (!validateEmail(email)) {
    throw new Error('Only @iare.ac.in email addresses are allowed');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    
    // Handle specific Firebase auth errors
    switch (authError.code) {
      case 'auth/email-already-in-use':
        throw new Error('This email is already registered. Please sign in instead.');
      case 'auth/weak-password':
        throw new Error('Password should be at least 6 characters long.');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address.');
      default:
        throw new Error('Failed to create account. Please try again.');
    }
  }
};

// Sign in with email validation
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  // Validate email domain
  if (!validateEmail(email)) {
    throw new Error('Only @iare.ac.in email addresses are allowed');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    
    switch (authError.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email. Please sign up first.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password. Please try again.');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      default:
        throw new Error('Failed to sign in. Please check your credentials.');
    }
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.');
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as UserData : null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};