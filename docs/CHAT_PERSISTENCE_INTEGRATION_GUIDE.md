# Chat History Persistence - Integration Guide

## Overview

This guide explains how to use the newly created hooks to fix chat history persistence and admin reply notifications issues.

**Problem:** When admin replies to pending messages, conversation history is lost instead of persisting.

**Solution:** Use two new React hooks:
1. `useUserNotification` - Poll for admin replies to pending messages
2. `useChatRoom` - Subscribe to Firebase realtime messages

---

## Files Created

| File | Purpose |
|------|---------|
| `app/hooks/useUserNotification.ts` | Poll for admin offline message replies |
| `app/hooks/useChatRoom.ts` | Subscribe to Firebase realtime chat messages |
| `app/features/chat/api/chatApi.ts` | Updated with `getNotification()` endpoint |
| `docs/BACKEND_API_SPEC_NOTIFICATIONS.md` | Backend implementation spec |

---

## Hook 1: useUserNotification

### Purpose
Polls the backend for admin replies when user message is in "Pending" status (admin was offline).

### Import
```typescript
import { useUserNotification } from "@/app/hooks/useUserNotification";
```

### Usage
```typescript
const { notification, isPolling, error } = useUserNotification({
  sessionId: chatMode === "LeftMessage" ? sessionId : null,
  pollInterval: 5000, // Optional, default 5 seconds
});
```

### Parameters
- **sessionId** (string | null): Unique browser session ID. Pass `null` to disable polling.
- **pollInterval** (number, optional): Milliseconds between polls. Default: 5000ms (5 seconds)

### Returns
```typescript
{
  notification: UserNotification | null,  // Admin reply data
  isPolling: boolean,                      // Currently polling?
  error: string | null,                    // Last error message
}
```

### Returned Notification Object
```typescript
interface UserNotification {
  reply: string;           // Admin's message
  repliedAt: string;       // ISO timestamp
  pendingId: string;       // Message ID
  status: "Replied" | "Closed";
}
```

### Example: Listening for Admin Reply
```typescript
"use client";

import { useEffect, useState } from "react";
import { useUserNotification } from "@/app/hooks/useUserNotification";

function ChatComponent() {
  const [sessionId] = useState("sess_1234567890-abc");
  const [chatMode, setChatMode] = useState<"LeftMessage" | "AI">("LeftMessage");
  const [messages, setMessages] = useState([]);

  // Poll for admin reply when message is pending
  const { notification } = useUserNotification({
    sessionId: chatMode === "LeftMessage" ? sessionId : null,
  });

  // When admin replies, add message to conversation
  useEffect(() => {
    if (!notification) return;

    const adminMsg = {
      id: `admin_${notification.repliedAt}`,
      role: "assistant",
      content: notification.reply,
      timestamp: new Date(notification.repliedAt),
    };

    setMessages((prev) => [...prev, adminMsg]);
    setChatMode("AI"); // Or stay in LeftMessage - your choice
  }, [notification]);

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {notification && <p>✅ Admin replied!</p>}
    </div>
  );
}
```

---

## Hook 2: useChatRoom

### Purpose
Subscribes to Firebase realtime messages when admin takes over chat ("HumanOnline" mode).

### Import
```typescript
import { useChatRoom } from "@/app/hooks/useChatRoom";
```

### Usage
```typescript
const { messages, status, sendMessage } = useChatRoom({
  chatRoomId: chatMode === "HumanOnline" ? chatRoomId : null,
});
```

### Parameters
- **chatRoomId** (string | null): Firebase chat room ID. Pass `null` to disable listener.

### Returns
```typescript
{
  messages: ChatRoomMessage[],           // All messages in order
  status: "open" | "closed",              // Room status
  sendMessage: (text, senderId) => void,  // Send message function
}
```

### Returned Message Object
```typescript
interface ChatRoomMessage {
  key: string;              // Firebase key (unique)
  sender: "user" | "admin" | "system";
  text: string;
  timestamp: number;        // Milliseconds since epoch
  read?: boolean;
}
```

### Example: Realtime Chat with Admin
```typescript
"use client";

import { useEffect, useState } from "react";
import { useChatRoom } from "@/app/hooks/useChatRoom";

function LiveChatComponent() {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"HumanOnline" | "AI">("HumanOnline");
  const [messages, setMessages] = useState([]);

  // Subscribe to Firebase when admin accepts chat
  const { messages: firebaseMessages, sendMessage } = useChatRoom({
    chatRoomId: chatMode === "HumanOnline" ? chatRoomId : null,
  });

  // Sync Firebase messages to local state
  useEffect(() => {
    setMessages((prev) => {
      const newMessages = firebaseMessages.filter(
        (fm) => !prev.some((m) => m.id === fm.key)
      );
      return [...prev, ...newMessages.map((fm) => ({
        id: fm.key,
        role: fm.sender === "admin" ? "assistant" : "user",
        content: fm.text,
        timestamp: new Date(fm.timestamp),
      }))];
    });
  }, [firebaseMessages]);

  const handleSendMessage = async (text: string, userId: string) => {
    // Send to Firebase
    await sendMessage(text, userId);
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => handleSendMessage("Hello!", "user_123")}>
        Send Message
      </button>
    </div>
  );
}
```

---

## Integration into BubbleChat Component

### Step 1: Import Hooks
```typescript
"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, MessageCircle, UserCheck, Clock } from "lucide-react";
import { isAxiosError } from "axios";
import type { Message, ChatHistoryItem, ChatResponseType } from "./types";
import { chatApi, type ChatHistoryResponse } from "@/app/lib/api/chat";
import { useChatRoom } from "@/app/hooks/useChatRoom";           // ← NEW
import { useUserNotification } from "@/app/hooks/useUserNotification"; // ← NEW

// ... rest of component
```

### Step 2: Use Hooks in Main Component
```typescript
export default function BubbleChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatResponseType | null>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [sessionId] = useState(getOrCreateSessionId);

  const isMobile = useIsMobile();
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  const processedFirebaseKeys = useRef<Set<string>>(new Set());

  // ─── NEW: Firebase subscriptions ────────────────────────────────

  // Hook 1: Listen to realtime Firebase when admin takes over
  const { messages: firebaseMessages } = useChatRoom({
    chatRoomId: chatMode === "HumanOnline" ? chatRoomId : null,
  });

  // Hook 2: Poll for admin replies when message is in pending queue
  const { notification: adminReply } = useUserNotification({
    sessionId: chatMode === "LeftMessage" ? sessionId : null,
  });

  // ─── Sync Firebase messages into local state ────────────────────

  useEffect(() => {
    if (chatMode !== "HumanOnline" || firebaseMessages.length === 0) return;

    const newMsgs: Message[] = [];
    for (const fm of firebaseMessages) {
      if (processedFirebaseKeys.current.has(fm.key)) continue;
      processedFirebaseKeys.current.add(fm.key);

      // Skip user's own messages — already added to local state on send
      if (fm.sender === "user") continue;

      newMsgs.push({
        id: fm.key,
        role: "assistant",
        content: fm.text,
        timestamp: new Date(fm.timestamp),
      });
    }

    if (newMsgs.length > 0) {
      setMessages((prev) => [...prev, ...newMsgs]);
    }
  }, [firebaseMessages, chatMode]);

  // ─── Handle admin reply to pending message ──────────────────────

  useEffect(() => {
    if (!adminReply) return;

    const replyMsg: Message = {
      id: `admin_${adminReply.repliedAt}`,
      role: "assistant",
      content: adminReply.reply,
      timestamp: new Date(adminReply.repliedAt),
    };

    setMessages((prev) => {
      if (prev.some((m) => m.id === replyMsg.id)) return prev;
      return [...prev, replyMsg];
    });

    setHasUnread(true);
    // Optional: Don't reset chatMode here - let user see the reply came
  }, [adminReply]);

  // ─── Rest of component remains the same ────────────────────────

  // ... handleToggle, handleSend, etc.
}
```

### Step 3: Update handleSend for HumanOnline Mode
```typescript
const handleSend = useCallback(
  async (content: string) => {
    if (isLoading) return;

    // HumanOnline: send directly to Firebase
    if (chatMode === "HumanOnline" && chatRoomId) {
      const userMsg: Message = {
        id: genId(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Use sendMessage from useChatRoom hook
      await sendFirebaseMessage(content);
      return;
    }

    // ... rest of handleSend logic (AI mode, LeftMessage mode, etc.)
  },
  [isLoading, sessionId, chatMode, chatRoomId, sendFirebaseMessage],
);
```

---

## Data Flow Diagram

### Scenario 1: AI Response (Normal)
```
User sends message
  ↓
API call: POST /chat/send-message
  ↓
Backend: AI processes → generates response
  ↓
Response: { type: "AI", answer: "..." }
  ↓
Display AI message in chat
```

### Scenario 2: Admin Takeover (Realtime)
```
User sends message
  ↓
API call: POST /chat/send-message
  ↓
Backend: AI insufficient confidence → assign admin
  ↓
Response: { type: "HumanOnline", chatRoomId: "..." }
  ↓
Set chatMode = "HumanOnline"
  ↓
useChatRoom hook attaches Firebase listener
  ↓
Admin sends reply
  ↓
Firebase onChildAdded → message added to hook state
  ↓
useEffect syncs to local messages
  ↓
Display admin message in real-time
```

### Scenario 3: Admin Offline (Pending Queue)
```
User sends message
  ↓
API call: POST /chat/send-message
  ↓
Backend: Admin offline → queue message as Pending
  ↓
Response: { type: "LeftMessage" }
  ↓
Set chatMode = "LeftMessage"
  ↓
useUserNotification hook starts polling every 5 seconds
  ↓
Admin comes online, replies to pending message
  ↓
API: POST /admin/pending-messages/{id}/reply
  ↓
Backend updates PendingMessage.adminReply
  ↓
useUserNotification next poll returns notification
  ↓
useEffect adds admin reply to messages
  ↓
Display admin message in chat
  ↓
Chat history persists in localStorage
```

---

## Testing Guide

### Test 1: Message Persistence Across Refresh
```
1. Open chat
2. Send 3 messages (get AI responses)
3. Close browser tab
4. Reopen chat on same browser
5. ✅ Verify: All 3 messages + responses appear
6. Check localStorage: `cnk_chat_session_id` exists
```

### Test 2: Real-time Admin Takeover
```
1. Trigger admin takeover (send message AI can't handle)
2. Verify: useChatRoom creates Firebase listener
3. In admin dashboard: Send reply
4. ✅ Verify: Reply appears instantly in user chat
5. Send message from user
6. ✅ Verify: Admin instantly sees user message
```

### Test 3: Pending Message with Admin Reply
```
1. Take chat system offline (simulate admin unavailable)
2. Send message requiring human support
3. Verify: chatMode = "LeftMessage"
4. Verify: useUserNotification polling starts (check console logs)
5. Bring system back online, admin replies
6. Verify: Polling detects reply (< 5 seconds delay)
7. ✅ Verify: Reply appears in chat
8. Refresh page
9. ✅ Verify: Both user message + admin reply persist
```

### Test 4: Cross-Device (Negative Test)
```
1. Open chat on Device A
2. Send message, get LeftMessage status
3. Switch to Device B
4. Open same landing page
5. ✅ Verify: New chat session (different sessionId)
6. Admin replies to Device A message
7. ✅ Verify: Device B doesn't show the reply (expected)
   // Because Device B has different sessionId
```

---

## Troubleshooting

### Issue: Polling Never Returns Notification
**Cause:** Backend `/chat/notifications` endpoint not implemented

**Solution:**
1. Implement endpoint per `BACKEND_API_SPEC_NOTIFICATIONS.md`
2. Verify endpoint returns `{ data: { reply, repliedAt, ... } }`
3. Check backend logs for queries

### Issue: Firebase Messages Not Appearing
**Cause:** Firebase listener not attaching

**Solution:**
1. Verify Firebase is initialized (`app/lib/firebase.ts`)
2. Check browser console for Firebase connection errors
3. Verify `chatRoomId` is passed correctly to `useChatRoom`
4. Ensure Firebase security rules allow read access

### Issue: useUserNotification Not Polling
**Cause:** sessionId is null

**Solution:**
1. Verify sessionId is generated: `localStorage.getItem("cnk_chat_session_id")`
2. Pass sessionId to hook: `sessionId: chatMode === "LeftMessage" ? sessionId : null`
3. Check React hook logs: `[useUserNotification] 🔄 Starting to poll...`

### Issue: Messages Lost on Refresh
**Cause:** Chat restore endpoint returns empty history

**Solution:**
1. Verify backend stores chat history
2. Check session persistence in database
3. Verify `getHistory()` API call works: `POST /chat/history?sessionId=xxx`

---

## Performance Notes

### Polling Load
- Each user polls `/chat/notifications` every 5 seconds
- With caching (recommended), only 1 DB query per 30 seconds per user
- 10,000 users = ~333 req/sec (acceptable)

### Firebase Realtime
- WebSocket connection, very low latency
- Binary protocol, efficient scaling
- Scales to millions of messages

### localStorage
- Stores chat history per browser
- Persists across tab refresh
- Limited to ~10MB per domain

---

## Migration Checklist

For existing projects using BubbleChat:

- [ ] Copy `app/hooks/useUserNotification.ts` to your project
- [ ] Copy `app/hooks/useChatRoom.ts` to your project
- [ ] Update `chatApi.ts` to add `getNotification()` method
- [ ] Update BubbleChat imports (add new hooks)
- [ ] Add hook calls in BubbleChat main component
- [ ] Add useEffect for Firebase message sync
- [ ] Add useEffect for admin reply handling
- [ ] Test all 4 scenarios above
- [ ] Inform backend team to implement `/chat/notifications` endpoint
- [ ] Deploy backend endpoint
- [ ] Deploy frontend changes
- [ ] Monitor logs for polling/sync issues

---

## Support

For issues or questions:
1. Check browser console for hook logs (prefixed with `[useUserNotification]` or `[useChatRoom]`)
2. Check backend logs for endpoint calls
3. Verify Firebase connection status
4. Review test cases above

