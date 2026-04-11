"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ref, onChildAdded, off, push, serverTimestamp } from "firebase/database";
import { getDb } from "@/app/lib/firebase";

export interface ChatRoomMessage {
  key: string;
  sender: "user" | "admin" | "system";
  text: string;
  timestamp: number;
  read?: boolean;
}

interface UseChatRoomOptions {
  chatRoomId: string | null;
}

/**
 * Subscribes to realtime Firebase messages for a chat room.
 *
 * When chatRoomId is provided, sets up a listener on chats/{chatRoomId}/messages
 * and returns all new messages as they arrive. Automatically deduplicates messages
 * using Firebase message keys.
 *
 * Use-case: Admin takes over a chat → user sees realtime updates from admin
 */
export function useChatRoom({ chatRoomId }: UseChatRoomOptions) {
  const [messages, setMessages] = useState<ChatRoomMessage[]>([]);
  const [status, setStatus] = useState<"open" | "closed">("open");
  const seenKeysRef = useRef(new Set<string>());

  useEffect(() => {
    if (!chatRoomId) {
      console.info("[useChatRoom] 🔕 No chatRoomId provided — listener disabled");
      return;
    }

    const db = getDb();
    if (!db) {
      console.warn("[useChatRoom] ❌ db null — listener cannot be set up");
      return;
    }

    console.info(`[useChatRoom] 🔗 Setting up listener for chatRoomId: ${chatRoomId}`);
    seenKeysRef.current.clear();

    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const key = snapshot.key;
      if (!key) return;

      // Deduplicate: skip if already seen
      if (seenKeysRef.current.has(key)) {
        console.info(`[useChatRoom] ⏭️  Skipping duplicate message: ${key}`);
        return;
      }

      seenKeysRef.current.add(key);
      const data = snapshot.val();

      if (!data) return;

      const msg: ChatRoomMessage = {
        key,
        sender: data.sender ?? "system",
        text: data.text ?? "",
        timestamp: data.timestamp ?? Date.now(),
        read: data.read ?? false,
      };

      console.info(`[useChatRoom] 📨 New message from ${msg.sender}:`, msg.text.slice(0, 50));
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      console.info(`[useChatRoom] 🔌 Unsubscribing from chatRoomId: ${chatRoomId}`);
      off(messagesRef, "child_added", unsubscribe);
    };
  }, [chatRoomId]);

  const sendMessage = useCallback(
    async (text: string, senderId: string) => {
      if (!chatRoomId) {
        console.warn("[useChatRoom] ❌ sendMessage called with no chatRoomId");
        return;
      }

      const db = getDb();
      if (!db) {
        console.warn("[useChatRoom] ❌ db null — cannot send message");
        return;
      }

      try {
        const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
        await push(messagesRef, {
          sender: "user",
          senderId,
          text,
          timestamp: serverTimestamp(),
          read: false,
        });
        console.info(`[useChatRoom] ✅ Message sent to Firebase`);
      } catch (error) {
        console.error("[useChatRoom] ❌ Error sending message:", error);
        throw error;
      }
    },
    [chatRoomId]
  );

  return {
    messages,
    status,
    sendMessage,
  };
}
