import { apiClient } from "@/app/lib/api/client";
import type {
  CreateRoomResponse,
  SendMessageResponse,
} from "../types/chat";

const BASE = "/chat";

export interface NotificationResponse {
  reply: string;
  repliedAt: string;
  pendingId: string;
  status: "Replied" | "Closed";
}

export const chatApi = {
  createRoom: (payload: {
    userId: string;
    userName: string;
    sessionId: string;
    source: string;
    deviceType: string;
    userAgent: string;
  }) =>
    apiClient.post<CreateRoomResponse>(`${BASE}/create-room`, payload),

  sendMessage: (payload: {
    roomId: string;
    senderType: "User" | "Admin";
    senderId: string;
    messageText: string;
    messageType?: string;
    isInternalNote?: boolean;
  }) =>
    apiClient.post<SendMessageResponse>(`${BASE}/send-message`, payload),

  takeover: (roomId: string, adminId: number, adminName: string) =>
    apiClient.put(`${BASE}/rooms/${roomId}/takeover`, { adminId, adminName }),

  handbackToAI: (roomId: string) =>
    apiClient.put(`${BASE}/rooms/${roomId}/handback-to-ai`),

  closeRoom: (roomId: string, closedBy: number | "system", reason: string) =>
    apiClient.put(`${BASE}/rooms/${roomId}/close`, { closedBy, reason }),

  /** Poll for admin replies to pending offline messages */
  getNotification: (sessionId: string) =>
    apiClient.get<NotificationResponse | null>(`${BASE}/notifications`, {
      params: { sessionId },
    }),
};
