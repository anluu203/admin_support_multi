export type ChatMode = "AI" | "Human" | "Waiting" | "Offline";
export type SenderType = "User" | "AI" | "Admin" | "System";
export type MessageType = "text" | "note" | "system" | "image";

export interface ChatMessage {
  id: string;
  senderType: SenderType;
  senderId?: string;
  messageText: string;
  messageType: MessageType;
  isInternalNote?: boolean;
  metadata?: {
    confidence?: number;
    intent?: string;
    model?: string;
    ragUsed?: boolean;
    latencyMs?: number;
  };
  createdAt: number;
}

export interface CreateRoomResponse {
  roomId: string;
  firebaseRoomPath: string;
  currentMode: ChatMode;
  status: string;
  createdAt: string;
}

export interface SendMessageResponse {
  messageId: string;
  firebaseMessagePath: string;
  createdAt: string;
  aiResponse?: {
    messageId: string;
    messageText: string;
    confidence: number;
    intent: string;
    sentiment: string;
    latencyMs: number;
    fallbackToHuman: boolean;
  };
}

export interface ChatWidgetConfig {
  source?: string;
  userId?: string;
  userName?: string;
}
