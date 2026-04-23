// =============================================
// Community Types
// =============================================

export type ChallengeLevel = 'beginner' | 'intermediate' | 'advanced';
export type ChallengeIntensity = 'low' | 'moderate' | 'high';

export interface ForumTopic {
  _id: string;
  title: string;
  description: string;
  category: string;
  postCount: number;
  lastActivity: string;
  createdAt: string;
}

export interface Challenge {
  _id: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  durationMinutes: number;
  calories: number;
  level: ChallengeLevel;
  intensity: ChallengeIntensity;
  participantCount: number;
  rounds?: {
    round: number;
    exercises: {
      name: string;
      duration?: number;
      reps?: number;
    }[];
  }[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;       // userId hoặc 'admin'
  senderRole: 'user' | 'admin';
  message: string;
  createdAt: string;
}
