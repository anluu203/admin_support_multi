# Backend API Specification: Chat Notifications Endpoint

## Overview

This document specifies the new backend endpoint required to support persistent chat history and admin reply notifications for the Chat RAG system.

---

## Endpoint: GET /chat/notifications

### Purpose
Return admin reply for a given user session when admin is offline (pending message queue).

### Method
```
GET /api/chat/notifications?sessionId={sessionId}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | Yes | Unique browser session ID (e.g., `sess_1234567890-abcd`) |

### Request Example
```bash
curl -X GET "https://api.dangcapnc.io.vn/api/chat/notifications?sessionId=sess_1713000000000-xyz123"
```

---

## Response

### Success Response (200 OK) - Reply Available
```json
{
  "isSuccess": true,
  "data": {
    "reply": "Cảm ơn anh/chị đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    "repliedAt": "2026-04-10T10:30:45.123Z",
    "pendingId": "pending_msg_12345",
    "status": "Replied"
  }
}
```

### Success Response (200 OK) - No Reply Yet
```json
{
  "isSuccess": true,
  "data": null
}
```

### Error Response (400 Bad Request)
```json
{
  "isSuccess": false,
  "error": "sessionId is required"
}
```

### Error Response (404 Not Found)
```json
{
  "isSuccess": false,
  "error": "No pending message found for this session"
}
```

---

## Response Schema

```typescript
interface NotificationResponse {
  reply: string;              // Admin's reply text
  repliedAt: string;          // ISO 8601 timestamp when admin replied
  pendingId: string;          // Database ID of the pending message
  status: "Replied" | "Closed"; // Message status
}
```

---

## Implementation Requirements

### 1. Database Query
Query the `PendingMessages` table with these conditions:

```sql
SELECT TOP 1
    id AS pendingId,
    adminReply AS reply,
    repliedAt,
    status
FROM PendingMessages
WHERE sessionId = @sessionId
  AND status IN ('Replied', 'Closed')
  AND adminReply IS NOT NULL
ORDER BY repliedAt DESC
```

**Logic:**
- Return the most recent reply for the session
- Only if status is "Replied" or "Closed" (i.e., admin has already responded)
- If no rows found, return `null`
- If multiple replies exist (should not happen, but in case), return the latest one

### 2. Caching Strategy (Recommended)
Implement server-side caching to reduce database load:

```typescript
/**
 * Pseudocode for caching logic
 */
async function getNotification(sessionId: string) {
  const cacheKey = `notification:${sessionId}`;

  // Check Redis for cached result
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Query database
  const result = await queryPendingMessage(sessionId);

  // Cache for 30 seconds (prevents duplicate DB queries from same session)
  if (result) {
    await redis.setex(cacheKey, 30, JSON.stringify(result));
  }

  return result;
}
```

**Rationale:**
- User's browser polls every 5 seconds
- With caching, only 1 DB query per 30 seconds (instead of 6 queries)
- Significant reduction in database load

### 3. Mark as Read (Optional Enhancement)
After returning notification, optionally mark it as read:

```sql
UPDATE PendingMessages
SET readAt = GETUTCDATE()
WHERE sessionId = @sessionId
  AND readAt IS NULL
```

**Benefits:**
- Track notification delivery
- Prevent showing same notification twice
- Monitor admin response engagement

### 4. Rate Limiting
Apply rate limiting to prevent abuse:

```typescript
// Example: Max 10 requests per session per minute
const rateLimiter = new RateLimiter({
  key: `notifications:${sessionId}`,
  max: 10,
  window: 60 * 1000, // 1 minute
});
```

---

## Integration Points

### Frontend
The frontend uses this endpoint via:

```typescript
// app/features/chat/api/chatApi.ts
getNotification: (sessionId: string) =>
  apiClient.get<NotificationResponse | null>(`/chat/notifications`, {
    params: { sessionId },
  })
```

### Frontend Hook Usage
The `useUserNotification` hook will:
1. Accept `sessionId` parameter
2. Poll this endpoint every 5 seconds (configurable)
3. Stop polling once notification is received
4. Return notification object to React component

**Location:** `app/hooks/useUserNotification.ts`

---

## Error Handling

### Client-Side (Frontend)
```typescript
try {
  const result = await chatApi.getNotification(sessionId);
  if (result.isSuccess && result.data) {
    // Display admin reply
  }
} catch (error) {
  // Retry on next poll interval
  // Show error after X failed attempts
}
```

### Server-Side (Backend)
- **400 Bad Request:** Missing or invalid sessionId parameter
- **404 Not Found:** Session doesn't exist in system
- **500 Server Error:** Database/cache failure (be graceful)
- **429 Too Many Requests:** Rate limit exceeded

---

## Testing Checklist

- [ ] Endpoint returns notification when admin reply exists
- [ ] Endpoint returns `null` when no reply yet
- [ ] Endpoint returns 404 for invalid sessionId
- [ ] Query is fast (response < 100ms under normal load)
- [ ] Caching works (2nd request returns cached result, < 10ms)
- [ ] Subsequent requests after first reply still return the same data
- [ ] `readAt` field is updated when notification is returned
- [ ] Rate limiting blocks requests over limit (returns 429)
- [ ] Cross-validation: sessionId in request matches PendingMessages.sessionId

---

## Example Flow

```
1. User on landing page sends message requiring human support
   Request: POST /chat/send-message { message, sessionId }
   Response: { type: "LeftMessage", ... }

2. Frontend displays "Pending - waiting for admin response"
   useUserNotification hook starts polling

3. Backend: GET /chat/notifications?sessionId=sess_123
   Response: { data: null }
   (No reply yet, return null)

4. Admin logs in, views pending messages
   Admin clicks "Reply" and sends message
   Backend: POST /admin/pending-messages/{id}/reply { text: "..." }
   Updates PendingMessages table with adminReply and repliedAt

5. Next poll from frontend
   Backend: GET /chat/notifications?sessionId=sess_123
   Queries: SELECT reply, repliedAt FROM PendingMessages
            WHERE sessionId='sess_123' AND status='Replied'
   Response: {
     data: {
       reply: "Admin's message...",
       repliedAt: "2026-04-10T10:30:00Z",
       pendingId: "msg_123",
       status: "Replied"
     }
   }

6. Frontend receives notification
   useUserNotification hook returns the data
   React component displays admin reply
```

---

## Related Tables

### PendingMessages Table
```sql
CREATE TABLE PendingMessages (
    id NVARCHAR(50) PRIMARY KEY,
    sessionId NVARCHAR(100) NOT NULL,
    userId NVARCHAR(100),
    userName NVARCHAR(255),
    userMessage NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(50), -- 'Pending', 'Replied', 'Closed'
    adminReply NVARCHAR(MAX),
    adminId INT,
    repliedAt DATETIME2,
    readAt DATETIME2,
    createdAt DATETIME2 NOT NULL,
    updatedAt DATETIME2
);

CREATE INDEX idx_sessionId ON PendingMessages(sessionId);
CREATE INDEX idx_status ON PendingMessages(status);
CREATE INDEX idx_repliedAt ON PendingMessages(repliedAt DESC);
```

---

## Performance Considerations

| Scenario | Load | Query Time | With Cache |
|----------|------|-----------|----------|
| 1,000 users polling | 200 req/sec | 50-100ms | 5-10ms |
| 10,000 users polling | 2,000 req/sec | 200ms+ | 5-10ms |
| DB under load | - | 500ms+ | Still 5-10ms |

**Recommendation:** Implement caching. Without it, system will struggle at scale.

---

## Security Considerations

1. **sessionId Validation**
   - Ensure sessionId format matches expected pattern
   - Reject obviously malformed IDs before querying DB

2. **Rate Limiting**
   - Prevent hammering the endpoint with invalid sessionIds
   - Could be used for enumeration attacks

3. **Data Privacy**
   - Only return data if sessionId matches
   - No exposure of other users' messages

4. **SQL Injection**
   - Use parameterized queries (recommended already: `@sessionId`)
   - Validate sessionId is alphanumeric + underscores + dashes

---

## Backward Compatibility

This is a **new endpoint**, so no backward compatibility concerns. However:

- Ensure existing chat flows continue to work
- `/admin/pending-messages/{id}/reply` endpoint should continue to work
- No changes to existing API contracts

---

## Future Enhancements

1. **WebSocket Alternative**
   - Replace polling with persistent WebSocket connection for lower latency
   - Useful if more real-time notification features added

2. **Delivery Confirmations**
   - Track when user actually sees the notification
   - Useful for analytics/engagement metrics

3. **Multiple Replies**
   - Support multiple admin replies to same pending message
   - Currently: only `adminReply` field stored (single reply)

---

## Contact

For questions or clarifications about this specification, contact the chat system team.
