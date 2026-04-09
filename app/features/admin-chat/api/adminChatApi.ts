import { apiClient } from "@/app/lib/api/client";
import type { PendingMessage } from "../types/adminChat";

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface ApiMessage {
  messageId: string;
  senderType: "AI" | "User" | "Admin" | "System";
  senderId?: string;
  messageText: string;
  messageType: "text" | "note" | "system" | "image";
  isInternalNote: boolean;
  metadata?: { confidence?: number; intent?: string; model?: string };
  createdAt: string;
  readByAdmin?: boolean;
}

// ─── Admin chat API ───────────────────────────────────────────────────────────
// Endpoints follow the system flows document (not API_ENDPOINT.MD which is
// the user-facing API). Firebase is the source of truth for room list.

export const adminChatApi = {
  // ── Firebase realtime rooms ──────────────────────────────────────────────
  // Room list comes from Firebase /chats/ — no REST endpoint for this.

  /** Send admin message to a Firebase chat room (persists to PostgreSQL too) */
  sendFirebaseMessage: (chatId: string, text: string) =>
    apiClient.post(`/admin/chats/${chatId}/message`, { text }),

  /** Close a Firebase chat room */
  closeFirebaseRoom: (chatId: string) =>
    apiClient.post(`/admin/chats/${chatId}/close`),

  // ── Pending messages (offline queue) ─────────────────────────────────────

  /** Response: data is the array directly — not wrapped in { messages: [] } */
  getPendingMessages: (params?: { status?: string; page?: number; pageSize?: number }) =>
    apiClient.get<PendingMessage[]>("/admin/pending-messages", { params }),

  getPendingCount: () =>
    apiClient.get<{ count: number }>("/admin/pending-count"),

  replyPending: (id: string, text: string) =>
    apiClient.post(`/admin/pending-messages/${id}/reply`, { text }),

  closePending: (id: string) =>
    apiClient.post(`/admin/pending-messages/${id}/close`),

  // ── FCM token (for offline push) ─────────────────────────────────────────

  saveFcmToken: (token: string) =>
    apiClient.post("/admin/fcm-token", { token }),
};
