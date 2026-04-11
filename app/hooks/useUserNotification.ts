"use client";

import { useEffect, useState, useCallback } from "react";
import { chatApi } from "@/app/features/chat/api/chatApi";

export interface UserNotification {
  reply: string;
  repliedAt: string;
  pendingId: string;
  status: "Replied" | "Closed";
}

interface UseUserNotificationOptions {
  sessionId: string | null;
  pollInterval?: number;
}

/**
 * Polls the backend for admin replies to pending offline messages.
 *
 * Only enables polling when sessionId is provided (i.e., not null).
 * Polling stops if no notification is received to reduce server load.
 *
 * Use-case: User sent message while admin was offline → message queued as "Pending"
 * This hook polls until admin replies, then returns the notification object.
 */
export function useUserNotification({
  sessionId,
  pollInterval = 5000,
}: UseUserNotificationOptions) {
  const [notification, setNotification] = useState<UserNotification | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    if (!sessionId) return;

    try {
      setError(null);
      const result = await chatApi.getNotification(sessionId);

      if (result.isSuccess && result.data) {
        setNotification(result.data);
        setIsPolling(false); // Stop polling once we get a response
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch notification";
      setError(msg);
      console.warn("[useUserNotification] ⚠️ Poll failed:", msg);
      // Continue polling on error - retry next interval
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setIsPolling(false);
      setNotification(null);
      return;
    }

    setIsPolling(true);
    console.info(`[useUserNotification] 🔄 Starting to poll for notifications (sessionId: ${sessionId})`);

    // Initial check immediately
    poll();

    // Then poll at regular intervals
    const interval = setInterval(poll, pollInterval);

    return () => {
      clearInterval(interval);
      console.info("[useUserNotification] 🔌 Stopped polling");
    };
  }, [sessionId, pollInterval, poll]);

  return {
    notification,
    isPolling,
    error,
  };
}
