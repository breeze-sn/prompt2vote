import type { Persona } from './steps';
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, type Firestore } from 'firebase/firestore';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  preview: string;
  icon: string;
  persona: Persona | null;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export const createChatSession = (persona: Persona | null): ChatSession => {
  const createdAt = Date.now();

  return {
    id: `chat_${createdAt}_${Math.random().toString(36).slice(2, 8)}`,
    title: 'New chat',
    preview: 'Start a new election question',
    icon: 'chat_bubble',
    persona,
    messages: [],
    createdAt,
    updatedAt: createdAt,
  };
};

export const summarizeChat = (messages: ChatMessage[]): Pick<ChatSession, 'title' | 'preview' | 'icon'> => {
  const firstUser = messages.find(message => message.role === 'user')?.content ?? '';
  const lastMessage = messages[messages.length - 1]?.content ?? 'Start a new election question';
  const title = firstUser.trim() ? firstUser.trim().slice(0, 36) : 'New chat';
  const preview = lastMessage.trim().slice(0, 72) || 'Start a new election question';
  const lower = firstUser.toLowerCase();

  const icon = lower.includes('register') ? 'app_registration'
    : lower.includes('vote') || lower.includes('voter') ? 'campaign'
    : lower.includes('id') || lower.includes('epic') ? 'badge'
    : lower.includes('hello') || lower.includes('hi') ? 'chat_bubble'
    : 'chat_bubble';

  return { title, preview, icon };
};

// Firestore-based session management (per-user)
export const loadChatSessionsFromFirestore = async (firestore: Firestore, userId: string): Promise<ChatSession[]> => {
  try {
    const q = query(collection(firestore, 'chat_sessions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const sessions: ChatSession[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      sessions.push({
        id: docSnap.id,
        title: data.title || 'New chat',
        preview: data.preview || 'Start a new election question',
        icon: data.icon || 'chat_bubble',
        persona: data.persona || null,
        messages: data.messages || [],
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      });
    });

    // Sort by most recent first
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Failed to load chat sessions from Firestore:', error);
    return [];
  }
};

export const saveChatSessionToFirestore = async (firestore: Firestore, userId: string, session: ChatSession): Promise<void> => {
  try {
    await setDoc(doc(firestore, 'chat_sessions', session.id), {
      userId,
      title: session.title,
      preview: session.preview,
      icon: session.icon,
      persona: session.persona,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save chat session to Firestore:', error);
  }
};

export const deleteChatSessionFromFirestore = async (firestore: Firestore, sessionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, 'chat_sessions', sessionId));
  } catch (error) {
    console.error('Failed to delete chat session from Firestore:', error);
  }
};
