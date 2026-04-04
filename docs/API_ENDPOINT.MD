
## 6. API Endpoints

### 6.1 Chat Management

#### `POST /api/chat/create-room`
Tạo phòng chat mới

**Request Body:**
```json
{
  "userId": "user_anonymous_xyz",
  "userName": "Nguyễn Văn A",
  "userEmail": "nguyenvana@example.com",
  "userPhone": "+84912345678",
  "sessionId": "session_abc123",
  "source": "Landing page",
  "deviceType": "Mobile",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "room_4721",
    "firebaseRoomPath": "/rooms/room_4721",
    "currentMode": "AI",
    "status": "active",
    "createdAt": "2026-04-04T10:00:00Z"
  }
}
```

---

#### `POST /api/chat/send-message`
Gửi tin nhắn (từ user hoặc admin)

**Request Body:**
```json
{
  "roomId": "room_4721",
  "senderType": "User",            // User | Admin
  "senderId": "user_anonymous_xyz",
  "messageText": "Học phí tháng 7 là bao nhiêu?",
  "messageType": "text",           // text | note | image
  "isInternalNote": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "-NXk5mNvL2aQ1",
    "firebaseMessagePath": "/messages/room_4721/-NXk5mNvL2aQ1",
    "createdAt": "2026-04-04T10:03:00Z",
    "aiResponse": {                // Nếu senderType = User thì AI auto reply
      "messageId": "-NXk6pOqM3bR2",
      "messageText": "Học phí tháng 7/2025: Lớp cơ bản 350.000đ...",
      "confidence": 96,
      "intent": "Hỏi học phí",
      "sentiment": "Neutral",
      "latencyMs": 312
    }
  }
}
```

---

#### `GET /api/chat/rooms`
Lấy danh sách rooms (cho admin dashboard)

**Query Params:**
- `status` (optional): `active`, `closed`, `archived`
- `mode` (optional): `AI`, `Human`, `Waiting`, `Offline`
- `assignedAdminId` (optional): Filter theo admin
- `page` (default: 1)
- `pageSize` (default: 20)
- `sortBy` (default: `updatedAt`): `createdAt`, `updatedAt`, `lastMessageAt`
- `sortOrder` (default: `desc`): `asc`, `desc`

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "roomId": "room_4721",
        "userId": "user_anonymous_xyz",
        "userName": "Nguyễn Văn A",
        "userEmail": null,
        "currentMode": "AI",
        "status": "active",
        "assignedAdminId": null,
        "assignedAdminName": null,
        "lastMessage": {
          "messageText": "Lịch tập tuần này thế nào?",
          "senderType": "User",
          "createdAt": "2026-04-04T10:03:00Z"
        },
        "unreadCount": 2,
        "totalMessages": 5,
        "metadata": {
          "intent": "Hỏi lịch tập",
          "sentiment": "Positive",
          "sentimentScore": 0.8
        },
        "createdAt": "2026-04-04T10:00:00Z",
        "updatedAt": "2026-04-04T10:03:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 47,
      "totalPages": 3
    }
  }
}
```

---

#### `GET /api/chat/rooms/:roomId`
Lấy chi tiết room

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "room_4721",
    "userId": "user_anonymous_xyz",
    "userName": "Nguyễn Văn A",
    "userEmail": null,
    "userPhone": null,
    "sessionId": "session_abc123",
    "source": "Landing page",
    "deviceType": "Mobile",
    "userAgent": "Mozilla/5.0...",
    "currentMode": "AI",
    "status": "active",
    "assignedAdminId": null,
    "assignedAdminName": null,
    "totalMessages": 5,
    "unreadCount": 2,
    "metadata": {
      "intent": "Hỏi lịch tập",
      "sentiment": "Positive",
      "sentimentScore": 0.8,
      "aiConfidence": 94
    },
    "createdAt": "2026-04-04T10:00:00Z",
    "updatedAt": "2026-04-04T10:03:00Z",
    "closedAt": null,
    "firstResponseTime": 2,       // seconds
    "avgResponseTime": 3.5
  }
}
```

---

#### `GET /api/chat/rooms/:roomId/messages`
Lấy lịch sử tin nhắn (pagination)

**Query Params:**
- `page` (default: 1)
- `pageSize` (default: 20)
- `before` (optional): Timestamp để load tin cũ hơn (lazy loading)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "-NXk3s8fK0xP9",
        "senderType": "AI",
        "senderId": "gemini-flash-2.0",
        "messageText": "Xin chào! Tôi là trợ lý AI...",
        "messageType": "text",
        "isInternalNote": false,
        "metadata": {
          "confidence": 96,
          "intent": "Greeting",
          "model": "gemini-flash-2.0"
        },
        "createdAt": "2026-04-04T10:00:00Z",
        "readByAdmin": false
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "hasMore": true,
      "oldestTimestamp": 1712217600000
    }
  }
}
```

---

#### `PUT /api/chat/rooms/:roomId/takeover`
Admin tiếp nhận phòng chat (Human mode)

**Request Body:**
```json
{
  "adminId": 1,
  "adminName": "Trần Admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "room_4721",
    "currentMode": "Human",
    "assignedAdminId": 1,
    "assignedAdminName": "Trần Admin",
    "systemMessage": {
      "messageId": "-NXk7qRsN4cS3",
      "messageText": "Admin Trần đã tiếp nhận cuộc hội thoại này.",
      "createdAt": "2026-04-04T10:05:00Z"
    }
  }
}
```

---

#### `PUT /api/chat/rooms/:roomId/handback-to-ai`
Admin trả lại cho AI

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "room_4721",
    "currentMode": "AI",
    "assignedAdminId": null,
    "systemMessage": {
      "messageId": "-NXk8rTuO5dT4",
      "messageText": "Đã chuyển về AI Mode. AI sẽ tiếp tục trả lời.",
      "createdAt": "2026-04-04T10:10:00Z"
    }
  }
}
```

---

#### `PUT /api/chat/rooms/:roomId/close`
Kết thúc phòng chat

**Request Body:**
```json
{
  "closedBy": 1,                   // Admin ID hoặc "system"
  "reason": "Resolved",            // Resolved | UserLeft | Timeout
  "satisfactionRating": 5          // Optional: 1-5 stars
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roomId": "room_4721",
    "status": "closed",
    "closedAt": "2026-04-04T10:15:00Z",
    "totalMessages": 12,
    "avgResponseTime": 3.2,
    "satisfactionRating": 5
  }
}
```

---

### 6.2 Presence Management

#### `GET /api/presence/admins`
Lấy danh sách admin online (real-time từ Firebase)

**Response:**
```json
{
  "success": true,
  "data": {
    "onlineAdmins": [
      {
        "adminId": 1,
        "firebaseUid": "admin_001",
        "displayName": "Trần Admin",
        "avatarInitials": "TA",
        "currentChatCount": 2,
        "maxConcurrentChats": 5,
        "status": "online",          // online | away | busy
        "lastActiveAt": "2026-04-04T10:00:00Z"
      },
      {
        "adminId": 2,
        "firebaseUid": "admin_002",
        "displayName": "Lê Minh",
        "currentChatCount": 0,
        "maxConcurrentChats": 5,
        "status": "online"
      }
    ],
    "offlineAdmins": [
      {
        "adminId": 3,
        "displayName": "Nguyễn Hùng",
        "lastOnline": "2026-04-04T08:30:00Z"
      }
    ],
    "totalOnline": 2,
    "totalOffline": 1
  }
}
```

---

#### `POST /api/presence/connect`
Admin kết nối (set presence)

**Request Body:**
```json
{
  "adminId": 1,
  "firebaseUid": "admin_001",
  "connectionId": "-NXk3s8fK0xP9",  // Firebase session ID
  "deviceInfo": "Chrome 120 / Windows"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "adminId": 1,
    "status": "online",
    "firebasePresencePath": "/presence/admin_001"
  }
}
```

---

#### `POST /api/presence/disconnect`
Admin ngắt kết nối (manual logout hoặc fallback nếu onDisconnect fail)

**Request Body:**
```json
{
  "adminId": 1,
  "connectionId": "-NXk3s8fK0xP9"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "adminId": 1,
    "status": "offline"
  }
}
```

---

### 6.3 AI Integration

#### `POST /api/ai/process-message`
Xử lý tin nhắn bằng AI (internal API, gọi từ backend)

**Request Body:**
```json
{
  "roomId": "room_4721",
  "messageId": "-NXk5mNvL2aQ1",
  "messageText": "Học phí tháng 7 là bao nhiêu?",
  "userId": "user_anonymous_xyz",
  "conversationHistory": [        // Optional: context
    {
      "role": "user",
      "content": "Chào bạn"
    },
    {
      "role": "assistant",
      "content": "Xin chào! Tôi có thể giúp gì?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "responseText": "Học phí tháng 7/2025:\n• Lớp cơ bản: 350.000đ/tháng\n• Lớp nâng cao: 500.000đ/tháng",
    "confidence": 96,
    "intent": "Hỏi học phí",
    "sentiment": "Neutral",
    "model": "gemini-flash-2.0",
    "ragUsed": true,
    "ragSources": [
      {
        "documentId": 12,
        "category": "Học phí",
        "relevanceScore": 0.95
      }
    ],
    "latencyMs": 312,
    "fallbackToHuman": false,      // true nếu confidence < threshold
    "metadata": {
      "promptTokens": 245,
      "completionTokens": 89
    }
  }
}
```

---

#### `GET /api/ai/health`
Kiểm tra trạng thái AI (Circuit Breaker)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",           // healthy | degraded | down
    "provider": "Gemini",
    "model": "gemini-flash-2.0",
    "metrics": {
      "p95LatencyMs": 312,
      "errorRate": 0.0,            // 0.0 - 1.0
      "totalRequests24h": 1247,
      "failedRequests24h": 0
    },
    "circuitBreaker": {
      "state": "closed",           // closed | open | half-open
      "failureCount": 0,
      "threshold": 5,
      "lastFailure": null
    }
  }
}
```

---

### 6.4 Knowledge Base

#### `GET /api/knowledge-base/documents`
Lấy danh sách documents

**Query Params:**
- `category` (optional)
- `isActive` (default: true)
- `page`, `pageSize`

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "documentId": 12,
        "category": "Học phí",
        "question": "Học phí tháng 7 là bao nhiêu?",
        "answer": "Học phí tháng 7/2025: Lớp cơ bản 350.000đ...",
        "keywords": "học phí, giá, tháng 7, 2025",
        "priority": 10,
        "isActive": true,
        "usageCount": 47,
        "createdAt": "2026-03-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 85
    }
  }
}
```

---

#### `POST /api/knowledge-base/documents`
Tạo document mới

**Request Body:**
```json
{
  "category": "Lịch tập",
  "question": "Lịch tập tuần này như thế nào?",
  "answer": "Lịch tập tuần này: Thứ 3, 5, 7 từ 18:30-20:00 tại Nhà VH Hà Đông.",
  "keywords": "lịch tập, tuần, thứ",
  "priority": 5,
  "createdBy": 1
}
```

---

#### `PUT /api/knowledge-base/documents/:documentId`
Cập nhật document

---

#### `DELETE /api/knowledge-base/documents/:documentId`
Xóa (soft delete: set `isActive = false`)

---

### 6.5 Admin Management

#### `GET /api/admins`
Lấy danh sách admin

**Response:**
```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "adminId": 1,
        "firebaseUid": "admin_001",
        "email": "tranadmin@example.com",
        "fullName": "Trần Admin",
        "role": "Superadmin",
        "avatarUrl": null,
        "isActive": true,
        "currentChatCount": 2,
        "maxConcurrentChats": 5,
        "totalChatsHandled": 342,
        "avgResponseTime": 15.3,
        "avgSatisfactionScore": 4.7,
        "lastActiveAt": "2026-04-04T10:00:00Z"
      }
    ]
  }
}
```

---

#### `POST /api/admins/fcm-token`
Đăng ký FCM token cho admin device

**Request Body:**
```json
{
  "adminId": 1,
  "deviceToken": "fK3s8fK0xP9dL2aQ1...",
  "deviceType": "Web",
  "deviceName": "Chrome 120 / Windows"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": 42,
    "deviceToken": "fK3s8fK0xP9dL2aQ1...",
    "isActive": true
  }
}
```

---

### 6.6 Push Notifications

#### `POST /api/push/send-notification`
Gửi push notification (internal, trigger từ backend)

**Request Body:**
```json
{
  "type": "new_message",           // new_message | urgent | offline | ai_fail
  "roomId": "room_4721",
  "title": "Tin nhắn mới từ Nguyễn Văn A",
  "body": "Lịch tập tuần này thế nào ạ?",
  "data": {
    "roomId": "room_4721",
    "userId": "user_anonymous_xyz",
    "userName": "Nguyễn Văn A"
  },
  "targetAdminIds": [1, 2],        // Gửi cho admin cụ thể, hoặc null = all
  "topic": "all_admins"            // FCM topic (nếu không specify adminIds)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "fcm_msg_xyz",
    "sentTo": 2,                    // Số device nhận được
    "failedTo": 0
  }
}
```

---

### 6.7 Analytics

#### `GET /api/analytics/overview`
Tổng quan dashboard

**Query Params:**
- `startDate`, `endDate` (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRooms": 1247,
    "activeRooms": 23,
    "closedRooms": 1224,
    "aiHandledPercentage": 78.5,
    "humanHandledPercentage": 21.5,
    "avgFirstResponseTime": 2.3,    // seconds
    "avgResolutionTime": 180,       // seconds
    "avgSatisfactionScore": 4.6,
    "totalMessages": 15823,
    "aiMessages": 12405,
    "humanMessages": 3418,
    "topIntents": [
      {
        "intent": "Hỏi học phí",
        "count": 342,
        "percentage": 27.4
      },
      {
        "intent": "Hỏi lịch tập",
        "count": 289,
        "percentage": 23.2
      }
    ]
  }
}
```
