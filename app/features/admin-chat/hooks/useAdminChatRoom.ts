"use client";

import { useEffect, useRef, useCallback } from "react";
import { ref, onChildAdded, off, push, serverTimestamp, update } from "firebase/database";
import { getDb } from "@/app/lib/firebase";
import type { FirebaseChatMessage } from "../types/adminChat";

interface UseAdminChatRoomOptions {
  chatRoomId: string | null;
  onMessage: (message: FirebaseChatMessage) => void;
}

export function useAdminChatRoom({ chatRoomId, onMessage }: UseAdminChatRoomOptions) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const seenRef = useRef(new Set<string>());

  useEffect(() => {
    if (!chatRoomId) return;
    const db = getDb();
    if (!db) return;

    seenRef.current = new Set(); // reset on room change
    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);

    const handler = onChildAdded(messagesRef, (snapshot) => {
      const key = snapshot.key ?? "";
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);

      const data = snapshot.val();
      if (!data) return;

      const message: FirebaseChatMessage = {
        id: key,
        sender: data.sender,
        text: data.text,
        timestamp: data.timestamp ?? Date.now(),
        read: data.read ?? false,
      };
      onMessageRef.current(message);
    });

    return () => {
      off(messagesRef, "child_added");
    };
  }, [chatRoomId]);

  /** Admin sends a message directly to Firebase */
  const sendMessage = useCallback(
    async (text: string, adminId: string) => {
      if (!chatRoomId) return;
      const db = getDb();
      if (!db) return;
      const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
      await push(messagesRef, {
        sender: "admin",
        senderId: adminId,
        text,
        timestamp: serverTimestamp(),
        read: false,
      });
    },
    [chatRoomId]
  );

  /** Mark all messages in room as read */
  const markRead = useCallback(
    async (messageIds: string[]) => {
      if (!chatRoomId || messageIds.length === 0) return;
      const db = getDb();
      if (!db) return;
      const updates: Record<string, boolean> = {};
      messageIds.forEach((id) => {
        updates[`chats/${chatRoomId}/messages/${id}/read`] = true;
      });
      await update(ref(db), updates).catch(console.error);
    },
    [chatRoomId]
  );

  return { sendMessage, markRead };
}
