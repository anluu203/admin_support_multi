"use client";

import { useEffect, useRef } from "react";
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { getDb } from "@/app/lib/firebase";

interface UseAdminPresenceOptions {
  adminId: string;
  displayName: string;
  enabled: boolean;
}

/**
 * Writes /presence/admins/{adminId} = { online: true, ... } on mount,
 * and registers onDisconnect to set online: false.
 */
export function useAdminPresence({ adminId, displayName, enabled }: UseAdminPresenceOptions) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !adminId) return;
    const db = getDb();
    if (!db) return; // Firebase not configured

    const presenceRef = ref(db, `presence/admins/${adminId}`);

    const presenceData = {
      online: true,
      displayName,
      lastSeen: serverTimestamp(),
    };

    // Mark online
    set(presenceRef, presenceData).catch(console.error);

    // Auto-mark offline when disconnected
    const disconnectRef = onDisconnect(presenceRef);
    disconnectRef.update({ online: false, lastSeen: serverTimestamp() }).catch(console.error);

    cleanupRef.current = () => {
      set(presenceRef, { online: false, displayName, lastSeen: serverTimestamp() }).catch(console.error);
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [adminId, displayName, enabled]);
}
