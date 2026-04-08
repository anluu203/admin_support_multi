"use client";

import { useEffect, useState, useCallback } from "react";
import { ref, onChildAdded, onChildChanged, onChildRemoved, off } from "firebase/database";
import { getDb } from "@/app/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FirebaseChatRoomMeta {
  chatId: string;
  userId: string;
  adminId?: string;
  status: "open" | "closed";
  userQuestion: string;
  createdAt: number;
  closedAt?: number;
  unreadCount?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Subscribes to /chats/ in Firebase and returns the list of ALL chat rooms.
 * Uses onChildAdded for initial load + new rooms, onChildChanged for status updates.
 *
 * NOTE: onChildAdded fires once per existing room on mount (full snapshot).
 * onChildChanged fires when metadata changes (status open→closed etc).
 * We intentionally do NOT watch message changes here to avoid sidebar re-renders
 * on every new message — messages are tracked separately per open room.
 */
export function useFirebaseChatList(enabled: boolean) {
  const [rooms, setRooms] = useState<FirebaseChatRoomMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const upsertRoom = useCallback((chatId: string, val: Record<string, unknown>) => {
    const meta = val?.metadata as Record<string, unknown> | undefined;
    if (!meta) return;

    // Count unread user messages
    const messages = (val?.messages ?? {}) as Record<string, { sender: string; read?: boolean }>;
    const unreadCount = Object.values(messages).filter(
      (m) => m.sender === "user" && m.read === false
    ).length;

    const room: FirebaseChatRoomMeta = {
      chatId,
      userId: String(meta.userId ?? ""),
      adminId: meta.adminId ? String(meta.adminId) : undefined,
      status: (meta.status as "open" | "closed") ?? "open",
      userQuestion: String(meta.userQuestion ?? ""),
      createdAt: Number(meta.createdAt ?? Date.now()),
      closedAt: meta.closedAt ? Number(meta.closedAt) : undefined,
      unreadCount,
    };

    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.chatId === chatId);
      if (idx === -1) return [...prev, room];
      const next = [...prev];
      next[idx] = room;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const db = getDb();
    if (!db) {
      setIsLoading(false);
      return;
    }

    const chatsRef = ref(db, "chats");
    let initialLoadDone = false;

    const addedHandler = onChildAdded(chatsRef, (snapshot) => {
      const chatId = snapshot.key;
      if (!chatId) return;
      upsertRoom(chatId, snapshot.val() ?? {});
      if (!initialLoadDone) {
        // Firebase fires all existing children synchronously then stops —
        // we use a micro-task to detect when the initial burst is done.
        Promise.resolve().then(() => {
          initialLoadDone = true;
          setIsLoading(false);
        });
      }
    });

    const changedHandler = onChildChanged(chatsRef, (snapshot) => {
      const chatId = snapshot.key;
      if (!chatId) return;
      upsertRoom(chatId, snapshot.val() ?? {});
    });

    const removedHandler = onChildRemoved(chatsRef, (snapshot) => {
      const chatId = snapshot.key;
      if (chatId) {
        setRooms((prev) => prev.filter((r) => r.chatId !== chatId));
      }
    });

    // Fallback: mark loading done after 4s even if Firebase returns nothing
    const timeout = setTimeout(() => setIsLoading(false), 4000);

    return () => {
      off(chatsRef, "child_added");
      off(chatsRef, "child_changed");
      off(chatsRef, "child_removed");
      clearTimeout(timeout);
    };
  }, [enabled, upsertRoom]);

  const openRooms = rooms
    .filter((r) => r.status === "open")
    .sort((a, b) => b.createdAt - a.createdAt);

  return { rooms: openRooms, allRooms: rooms, isLoading };
}
