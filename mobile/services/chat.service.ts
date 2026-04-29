import axiosInstance from '../utils/axios';
import { ENDPOINTS } from '../constants/endpoints';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: string;
  updatedAt: string;
}

export const chatService = {
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await axiosInstance.get(ENDPOINTS.CHAT.MESSAGES(conversationId));
    return data.data;
  },

  initConversation: async (userId: string): Promise<Conversation | null> => {
    const { data } = await axiosInstance.get(ENDPOINTS.CHAT.INIT(userId));
    return data.data;
  },
};
