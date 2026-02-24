import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// AI interaction interface
export interface AIInteraction {
  id?: string;
  prompt: string;
  response: string;
  createdAt: any;
}

// Save AI interaction to Firestore
export const saveAIInteraction = async (
  userId: string, 
  prompt: string, 
  response: string
): Promise<void> => {
  try {
    const aiHistoryRef = collection(db, 'users', userId, 'aiHistory');
    
    await addDoc(aiHistoryRef, {
      prompt,
      response,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving AI interaction:', error);
    throw new Error('Failed to save conversation history');
  }
};

// Load user's AI history from Firestore
export const loadAIHistory = async (
  userId: string, 
  maxResults: number = 50
): Promise<AIInteraction[]> => {
  try {
    const aiHistoryRef = collection(db, 'users', userId, 'aiHistory');
    const q = query(
      aiHistoryRef, 
      orderBy('createdAt', 'desc'), 
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    const history: AIInteraction[] = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      } as AIInteraction);
    });
    
    // Return in chronological order (oldest first)
    return history.reverse();
  } catch (error) {
    console.error('Error loading AI history:', error);
    return [];
  }
};

// Get recent conversations for quick access
export const getRecentConversations = async (
  userId: string, 
  count: number = 10
): Promise<AIInteraction[]> => {
  try {
    const aiHistoryRef = collection(db, 'users', userId, 'aiHistory');
    const q = query(
      aiHistoryRef, 
      orderBy('createdAt', 'desc'), 
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: AIInteraction[] = [];
    
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      } as AIInteraction);
    });
    
    return conversations;
  } catch (error) {
    console.error('Error loading recent conversations:', error);
    return [];
  }
};