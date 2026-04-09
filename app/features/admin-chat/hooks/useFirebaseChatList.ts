"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ref, onChildAdded, onChildRemoved, onValue } from "firebase/database";
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
 * Subscribes to /chats/ in Firebase and returns the list of open chat rooms.
 *
 * Performance design:
 * - onChildAdded  → fires once per room on mount (initial load) and for new rooms.
 *                   Reads metadata from the initial snapshot for immediate display.
 * - onValue (per-room) → set up on /chats/{chatId}/metadata for each room.
 *                   Fires ONLY when metadata changes (status, unreadCount, etc.),
 *                   NOT when messages are written — avoids downloading full room
 *                   snapshots (metadata + all messages) on every message send.
 * - onChildChanged removed → was firing on every message write and triggering
 *                   a full room download (O(rooms × messages) bandwidth waste).
 */
export function useFirebaseChatList(enabled: boolean) {
  const [rooms, setRooms] = useState<FirebaseChatRoomMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const upsertRoom = useCallback((chatId: string, meta: Record<string, unknown>) => {
    const room: FirebaseChatRoomMeta = {
      chatId,
      userId: String(meta.userId ?? ""),
      adminId: meta.adminId ? String(meta.adminId) : undefined,
      status: (meta.status as "open" | "closed") ?? "open",
      userQuestion: String(meta.userQuestion ?? ""),
      createdAt: Number(meta.createdAt ?? Date.now()),
      closedAt: meta.closedAt ? Number(meta.closedAt) : undefined,
      unreadCount: Number(meta.unreadCount ?? 0),
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
    // Unsubscribe functions keyed by chatId for per-room metadata listeners
    const metaUnsubs = new Map<string, () => void>();
    let initialLoadDone = false;

    const unsubAdded = onChildAdded(chatsRef, (snapshot) => {
      const chatId = snapshot.key;
      if (!chatId) return;

      const val = snapshot.val() ?? {};
      const meta = val.metadata as Record<string, unknown> | undefined;

      // Always add the room immediately — even if the backend hasn't written
      // metadata yet (two-step create: messages first, metadata second).
      // Using status "open" as the safe default since onChildAdded at /chats/
      // fires when a room is first created. The per-room onValue below will
      // overwrite with the real metadata as soon as it's available.
      upsertRoom(chatId, meta ?? {
        status: "open",
        userId: chatId,
        userQuestion: "",
        createdAt: Date.now(),
        unreadCount: 0,
      });

      // Set up a lightweight per-room listener on /chats/{chatId}/metadata.
      // Fires ONLY when metadata changes — never when messages are written.
      if (!metaUnsubs.has(chatId)) {
        const metaRef = ref(db, `chats/${chatId}/metadata`);
        const unsub = onValue(metaRef, (snap) => {
          const m = snap.val() as Record<string, unknown> | null;
          if (m) upsertRoom(chatId, m);
        });
        metaUnsubs.set(chatId, unsub);
      }

      if (!initialLoadDone) {
        // Firebase fires all existing children synchronously then stops —
        // use a micro-task to detect when the initial burst is done.
        Promise.resolve().then(() => {
          initialLoadDone = true;
          setIsLoading(false);
        });
      }
    });

    const unsubRemoved = onChildRemoved(chatsRef, (snapshot) => {
      const chatId = snapshot.key;
      if (chatId) {
        metaUnsubs.get(chatId)?.();
        metaUnsubs.delete(chatId);
        setRooms((prev) => prev.filter((r) => r.chatId !== chatId));
      }
    });

    // Fallback: mark loading done after 4s even if Firebase returns nothing
    const timeout = setTimeout(() => setIsLoading(false), 4000);

    return () => {
      unsubAdded();
      unsubRemoved();
      metaUnsubs.forEach((unsub) => unsub());
      metaUnsubs.clear();
      clearTimeout(timeout);
    };
  }, [enabled, upsertRoom]);

  // useMemo: stabilise the array reference so downstream useMemo/useEffect
  // deps don't trigger on unrelated state updates.
  const openRooms = useMemo(
    () =>
      rooms
        .filter((r) => r.status === "open")
        .sort((a, b) => b.createdAt - a.createdAt),
    [rooms]
  );

  return { rooms: openRooms, allRooms: rooms, isLoading };
}
