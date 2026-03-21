import { v4 as uuidv4 } from "uuid";

export interface Message {
  role: "agent" | "user";
  content: string;
}

export interface AgentState {
  step_index: number;
  answers: Record<string, string>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  state: AgentState;
  lastUpdated: number;
  createdAt: number;
}

const STORAGE_KEY = "smartbiz-all-chats";
const CURRENT_CHAT_KEY = "smartbiz-current-chat-id";

export const chatService = {
  getAllChats: (): ChatSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load chats", error);
      return [];
    }
  },

  getChat: (id: string): ChatSession | undefined => {
    const chats = chatService.getAllChats();
    return chats.find((c) => c.id === id);
  },

  saveChat: (session: ChatSession): void => {
    const chats = chatService.getAllChats();
    const index = chats.findIndex((c) => c.id === session.id);

    if (index >= 0) {
      chats[index] = { ...session, lastUpdated: Date.now() };
    } else {
      chats.push({
        ...session,
        lastUpdated: Date.now(),
        createdAt: Date.now(),
      });
    }

    // Sort by last updated desc
    chats.sort((a, b) => b.lastUpdated - a.lastUpdated);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  },

  createNewChat: (): ChatSession => {
    return {
      id: uuidv4(),
      title: "New Conversation",
      messages: [],
      state: { step_index: 0, answers: {} },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    };
  },

  deleteChat: (id: string): void => {
    const chats = chatService.getAllChats().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  },

  renameChat: (id: string, newTitle: string): void => {
    const chats = chatService.getAllChats();
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      chat.title = newTitle;
      chat.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  },

  // Helper to generate a title based on the first user message
  generateTitle: (message: string): string => {
    return message.length > 30 ? message.substring(0, 30) + "..." : message;
  },
};
