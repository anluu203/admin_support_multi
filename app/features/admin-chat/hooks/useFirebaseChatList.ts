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
      console.warn("[useFirebaseChatList] ❌ db null — không thể lắng nghe danh sách phòng.");
      setIsLoading(false);
      return;
    }

    console.info("[useFirebaseChatList] 🔗 Đăng ký listener tại /chats");
    const chatsRef = ref(db, "chats");
    const metaUnsubs = new Map<string, () => void>();
    let initialLoadDone = false;

    const unsubAdded = onChildAdded(chatsRef, (snapshot) => {
      const chatId = snapshot.key;
      if (!chatId) return;

      const val = snapshot.val() ?? {};
      const meta = val.metadata as Record<string, unknown> | undefined;

      console.info(`[useFirebaseChatList] 🆕 Phòng mới/load: ${chatId}`, meta ?? "(chưa có metadata)");

      upsertRoom(chatId, meta ?? {
        status: "open",
        userId: chatId,
        userQuestion: "",
        createdAt: Date.now(),
        unreadCount: 0,
      });

      if (!metaUnsubs.has(chatId)) {
        const metaRef = ref(db, `chats/${chatId}/metadata`);
        const unsub = onValue(metaRef, (snap) => {
          const m = snap.val() as Record<string, unknown> | null;
          if (m) {
            console.info(`[useFirebaseChatList] 🔄 Metadata cập nhật: ${chatId}`, m);
            upsertRoom(chatId, m);
          }
        });
        metaUnsubs.set(chatId, unsub);
      }

      if (!initialLoadDone) {
        Promise.resolve().then(() => {
          initialLoadDone = true;
          console.info("[useFirebaseChatList] ✅ Load xong danh sách phòng ban đầu.");
          setIsLoading(false);
        });
      }
    });

    const unsubRemoved = onChildRemoved(chatsRef, (snapshot) => {
      const chatId = snapshot.key;
      if (chatId) {
        console.info(`[useFirebaseChatList] 🗑️ Phòng bị xóa: ${chatId}`);
        metaUnsubs.get(chatId)?.();
        metaUnsubs.delete(chatId);
        setRooms((prev) => prev.filter((r) => r.chatId !== chatId));
      }
    });

    const timeout = setTimeout(() => {
      if (!initialLoadDone) {
        console.warn("[useFirebaseChatList] ⏱️ Timeout 4s — không nhận được dữ liệu từ Firebase.");
      }
      setIsLoading(false);
    }, 4000);

    return () => {
      console.info("[useFirebaseChatList] 🔌 Hủy tất cả listeners.");
      unsubAdded();
      unsubRemoved();
      metaUnsubs.forEach((unsub) => unsub());
      metaUnsubs.clear();
      clearTimeout(timeout);
    };
  }, [enabled, upsertRoom]);

  // useMemo: stabilise the array reference so downstream useMemo/useEffect
  // deps don't trigger on unrelated state updates.
  const openRooms = useMemo(() => {
    const filtered = rooms
      .filter((r) => r.status === "open")
      .sort((a, b) => b.createdAt - a.createdAt);

    // Deduplicate by userId: if the same user triggered multiple HumanOnline
    // sessions (e.g. reconnect, multiple fallbacks), keep only the most recent room.
    const seen = new Set<string>();
    return filtered.filter((r) => {
      const key = r.userId || r.chatId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rooms]);

  return { rooms: openRooms, allRooms: rooms, isLoading };
}
