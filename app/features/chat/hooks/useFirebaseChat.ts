"use client";

import { useEffect, useRef, useCallback } from "react";
import { ref, onChildAdded, off, push, serverTimestamp } from "firebase/database";
import { getDb } from "@/app/lib/firebase";
import type { ChatMessage, SenderType } from "../types/chat";

interface UseFirebaseChatOptions {
  roomId: string | null;
  enabled: boolean;
  onMessage: (message: ChatMessage) => void;
}

export function useFirebaseChat({ roomId, enabled, onMessage }: UseFirebaseChatOptions) {
  const listenerRef = useRef<ReturnType<typeof onChildAdded> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!roomId || !enabled) return;
    const db = getDb();
    if (!db) {
      console.warn("[useFirebaseChat] ❌ db null — listener không được đăng ký.");
      return;
    }

    console.info(`[useFirebaseChat] 🔗 Đăng ký listener tại messages/${roomId}`);
    const messagesRef = ref(db, `messages/${roomId}`);

    listenerRef.current = onChildAdded(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const message: ChatMessage = {
        id: snapshot.key ?? Date.now().toString(),
        senderType: data.senderType as SenderType,
        senderId: data.senderId,
        messageText: data.messageText,
        messageType: data.messageType ?? "text",
        isInternalNote: data.isInternalNote ?? false,
        metadata: data.metadata,
        createdAt: data.createdAt ?? Date.now(),
      };

      if (message.isInternalNote) return;

      console.info(`[useFirebaseChat] 📨 Nhận tin nhắn từ ${message.senderType}:`, message.messageText);
      onMessageRef.current(message);
    });

    return () => {
      console.info(`[useFirebaseChat] 🔌 Hủy listener tại messages/${roomId}`);
      off(messagesRef, "child_added");
    };
  }, [roomId, enabled]);

  const pushMessage = useCallback(
    async (text: string, senderId: string, senderType: SenderType) => {
      if (!roomId) return;
      const db = getDb();
      if (!db) {
        console.warn("[useFirebaseChat] ❌ push thất bại — db null.");
        return;
      }
      console.info(`[useFirebaseChat] 📤 Push tin nhắn lên messages/${roomId}:`, text);
      const messagesRef = ref(db, `messages/${roomId}`);
      await push(messagesRef, {
        senderType,
        senderId,
        messageText: text,
        messageType: "text",
        isInternalNote: false,
        createdAt: serverTimestamp(),
      });
      console.info("[useFirebaseChat] ✅ Push thành công.");
    },
    [roomId]
  );

  return { pushMessage };
}
