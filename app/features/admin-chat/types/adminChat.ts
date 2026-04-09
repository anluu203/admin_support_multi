import type { FirebaseChatRoomMeta } from "../hooks/useFirebaseChatList";

// ─── Derived UI type from Firebase chat room ──────────────────────────────────

export interface AdminChatSession {
  /** chatId used in Firebase /chats/{chatId}/ */
  chatId: string;
  userId: string;
  adminId?: string;
  /** Display name — derived from userId, no full name available until user provides it */
  displayName: string;
  /** First message the user sent (shown in sidebar) */
  userQuestion: string;
  status: "open" | "closed";
  createdAt: number;
  unreadCount: number;
}

export function mapFirebaseRoom(r: FirebaseChatRoomMeta): AdminChatSession {
  // Firebase only stores userId — show shortened ID as display name
  const displayName = r.userId.startsWith("user_anon_")
    ? `Khách #${r.userId.slice(-6)}`
    : r.userId.length > 12
    ? `Khách ${r.userId.slice(-6)}`
    : r.userId;

  return {
    chatId: r.chatId,
    userId: r.userId,
    adminId: r.adminId,
    displayName,
    userQuestion: r.userQuestion,
    status: r.status,
    createdAt: r.createdAt,
    unreadCount: r.unreadCount ?? 0,
  };
}

// ─── Firebase message shape ───────────────────────────────────────────────────

export interface FirebaseChatMessage {
  id: string;
  sender: "user" | "admin" | "system";
  text: string;
  timestamp: number;
  read?: boolean;
}

// ─── Pending message ──────────────────────────────────────────────────────────

export type PendingStatus = "Pending" | "Replied" | "Closed";

export interface PendingMessage {
  id: string;
  sessionId: string;
  userMessage: string;
  userId?: string;
  userName?: string;
  status: PendingStatus;
  adminReply?: string;
  adminId?: number;
  createdAt: string;
  repliedAt?: string;
}

// ─── Active conversation (union) ─────────────────────────────────────────────

export type ActiveConv =
  | { kind: "room"; session: AdminChatSession }
  | { kind: "pending"; pending: PendingMessage }
  | null;
