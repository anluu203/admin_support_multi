# SYSTEM FLOWS - Hệ thống AI-First Human-Fallback Chat Support

> **Tài liệu kỹ thuật phiên bản:** 1.0  
> **Ngày cập nhật:** 04/04/2026  
> **Mục đích:** Tài liệu chi tiết về luồng hoạt động, API endpoints, và database schema cho hệ thống chat hỗ trợ kết hợp AI và Human  
> **Dự án:** CLB Côn Nhị Khúc Hà Đông - Multi Support Chat

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Tech Stack](#2-tech-stack)
4. [Firebase Data Structure](#4-firebase-data-structure)
5. [Các thành phần UI](#5-các-thành-phần-ui)
6. [API Endpoints](#6-api-endpoints)
7. [Luồng chi tiết (Flows)](#7-luồng-chi-tiết-flows)
8. [Push Notification System](#8-push-notification-system)
9. [Security & Optimization](#9-security--optimization)
10. [Error Handling](#10-error-handling)

---

## 1. Tổng quan kiến trúc

### 1.1 Sơ đồ Actors

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   User      │────────▶│   AI Bot     │────────▶│   Admin      │
│ (Customer)  │         │ (Gemini/LLM) │         │ (Human CSR)  │
└─────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Firebase Realtime Database                 │
│        (Message Broker + Presence + Realtime Sync)          │
└─────────────────────────────────────────────────────────────┘
       │                        │                        │
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   .NET 8 Backend API                        │
│   (Business Logic + AI Integration + SQL Server)            │
└─────────────────────────────────────────────────────────────┘
       │                                                  │
       ▼                                                  ▼
┌──────────────┐                                  ┌──────────────┐
│ SQL Server   │                                  │   FCM Push   │
│  (History)   │                                  │ Notification │
└──────────────┘                                  └──────────────┘
```

### 1.2 Luồng dữ liệu tổng quát

**AI-First Flow:**
1. User gửi message → Firebase RTDB
2. Backend listener nhận event → Gọi AI API
3. AI trả lời → Lưu Firebase + SQL Server
4. Admin Dashboard nhận realtime update qua Firebase

**Human-Fallback Flow:**
1. AI không trả lời được (low confidence / timeout)
2. Backend trigger fallback → Check presence
3. **Có admin online:** Tạo room → Push event Firebase
4. **Tất cả offline:** Lưu SQL → Trigger FCM push

---

## 2. Tech Stack

### Frontend (NextJS)
- **Framework:** Next.js 16.2.2 (React 19.2.4)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript 5
- **Realtime:** Firebase SDK (Web v10+)
- **State:** React Context API + Firebase listeners

### Backend (.NET)
- **Runtime:** .NET 8
- **Database:** SQL Server (Persistent storage)
- **Realtime:** Firebase Admin SDK
- **AI:** Gemini Flash API / Claude API
- **Push:** Firebase Cloud Messaging (FCM)

### Infrastructure
- **Message Broker:** Firebase Realtime Database
- **Presence:** Firebase `.info/connected` + `onDisconnect`
- **File Storage:** Firebase Storage (nếu có attachment)
- **Cache:** Redis (optional cho rate limiting)


---

## 4. Firebase Data Structure

### 4.1 Presence System

#### `/presence/{adminId}`
```json
{
  "presence": {
    "admin_001": {
      "connections": {
        "-NXk3s8fK0xP9": true,           // Session ID (auto-generated push key)
        "-NXk5mNvL2aQ1": true            // Có thể nhiều tab/device
      },
      "lastOnline": 1712217600000,       // Server timestamp
      "displayName": "Trần Admin",
      "avatarInitials": "TA",
      "currentChatCount": 2,
      "maxConcurrentChats": 5,
      "status": "online"                 // online/away/busy
    },
    "admin_002": {
      "connections": {},                 // Empty = offline
      "lastOnline": 1712210400000,
      "displayName": "Lê Minh",
      "status": "offline"
    }
  }
}
```

**Firebase Rules:**
```javascript
{
  "rules": {
    "presence": {
      "$adminId": {
        ".read": true,                    // Tất cả đọc được để check online
        ".write": "$adminId === auth.uid" // Chỉ admin đó write được
      }
    }
  }
}
```

---

### 4.2 Chat Rooms

#### `/rooms/{roomId}`
```json
{
  "rooms": {
    "room_4721": {
      "userId": "user_anonymous_xyz",
      "userName": "Nguyễn Văn A",
      "userEmail": null,
      "userPhone": null,
      "sessionId": "session_abc123",
      "source": "Landing page",
      "deviceType": "Mobile",
      "currentMode": "AI",              // AI | Human | Waiting | Offline
      "assignedAdminId": null,
      "status": "active",               // active | closed | archived
      "createdAt": 1712217600000,
      "updatedAt": 1712218200000,
      "lastMessageAt": 1712218200000,
      "unreadCount": 2,                 // Số tin chưa đọc (admin)
      "typing": {
        "ai": false,
        "admin_001": false,
        "user": false
      },
      "metadata": {
        "intent": "Hỏi lịch tập",
        "sentiment": "Positive",
        "sentimentScore": 0.8,
        "aiConfidence": 94
      }
    }
  }
}
```

**Firebase Rules:**
```javascript
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",         // Admin và user (nếu auth) đọc được
        ".write": "auth != null"
      }
    }
  }
}
```

---

### 4.3 Messages

#### `/messages/{roomId}/{messageId}`
```json
{
  "messages": {
    "room_4721": {
      "-NXk3s8fK0xP9": {
        "senderType": "AI",              // User | AI | Admin | System
        "senderId": "gemini-flash-2.0",  // Model name hoặc admin ID
        "messageText": "Xin chào! Tôi là trợ lý AI...",
        "messageType": "text",           // text | note | system | image
        "isInternalNote": false,
        "metadata": {
          "confidence": 96,
          "intent": "Greeting",
          "sentiment": "Neutral",
          "model": "gemini-flash-2.0",
          "ragUsed": false,
          "latencyMs": 312
        },
        "createdAt": 1712217600000,
        "readByAdmin": false,
        "readByUser": true
      },
      "-NXk5mNvL2aQ1": {
        "senderType": "User",
        "senderId": "user_anonymous_xyz",
        "messageText": "Lịch tập tuần này thế nào ạ?",
        "messageType": "text",
        "isInternalNote": false,
        "createdAt": 1712218180000,
        "readByAdmin": false
      },
      "-NXk6pOqM3bR2": {
        "senderType": "System",
        "messageText": "Admin Trần đã tiếp nhận cuộc hội thoại này.",
        "messageType": "system",
        "createdAt": 1712218200000
      }
    }
  }
}
```

**Firebase Rules:**
```javascript
{
  "rules": {
    "messages": {
      "$roomId": {
        ".read": "auth != null",
        "$messageId": {
          ".write": "auth != null && (!newData.child('isInternalNote').val() || auth.token.role === 'admin')"
        }
      }
    }
  }
}
```

---

### 4.4 Typing Indicators

#### `/typing/{roomId}/{userId}`
```json
{
  "typing": {
    "room_4721": {
      "user_anonymous_xyz": {
        "isTyping": true,
        "timestamp": 1712218190000
      },
      "admin_001": {
        "isTyping": false,
        "timestamp": 1712218150000
      }
    }
  }
}
```

**Auto-cleanup:** Sử dụng `onDisconnect()` để set `isTyping: false` khi mất kết nối.

---

## 5. Các thành phần UI

### 5.1 Admin Dashboard (`/admin/dashboard`)

**Components:**
- `<Sidebar />` — Danh sách rooms, search, tabs filter (Tất cả/AI/Human)
- `<ChatHeader />` — Thông tin user, mode badges, action buttons
- `<MessageList />` — Hiển thị tin nhắn (AI, User, Admin, System, Note)
- `<InputArea />` — Nhập tin (context-aware: note vs reply)
- `<RightPanel />` — Customer info, AI analysis, admin online, quick replies
- `<PushNotificationStack />` — Thông báo realtime
- `<PresenceIndicator />` — Hiển thị admin online/offline

**Pages:**
- `/admin/dashboard` — Dashboard chính
- `/admin/rooms` — Danh sách rooms
- `/admin/rooms/[roomId]` — Chi tiết room
- `/admin/settings` — Cấu hình
- `/admin/knowledge-base` — Quản lý knowledge base
- `/admin/analytics` — Báo cáo

---

### 5.2 Bubble Chat Widget (`/widget/chat`)

**Components:**
- `<BubbleButton />` — Floating button với badge notification
- `<ChatWindow />` — Popup chat window
- `<BubbleMessageList />` — Tin nhắn (AI + User)
- `<BubbleInput />` — Input nhập tin

**Embeddable script:**
```html
<script src="https://your-domain.com/widget.js"></script>
<script>
  ChatWidget.init({
    apiKey: 'YOUR_API_KEY',
    userId: 'user_123', // Optional
    source: 'Landing page'
  });
</script>
```


---

## 7. Luồng chi tiết (Flows)

### Flow 1: User gửi tin nhắn → AI trả lời tự động (Happy Path)

**Actors:** User, Firebase, Backend AI Service, Admin Dashboard

**Preconditions:**
- User đã mở bubble chat widget
- Room đã được tạo hoặc tạo mới

**Steps:**

1. **User nhập tin nhắn** → Click "Send"
2. **Frontend Widget**:
   - Gọi `POST /api/chat/send-message` với `senderType: "User"`
   - Đồng thời push message lên Firebase `/messages/{roomId}/{messageId}`
3. **Backend nhận request**:
   - Lưu message vào SQL Server (`Messages` table)
   - Trigger AI processing: gọi `POST /api/ai/process-message`
4. **AI Service**:
   - Phân tích intent, sentiment
   - RAG: search trong `KnowledgeBase` table (Full-text search hoặc vector search)
   - Gọi LLM API (Gemini Flash)
   - Nhận response với confidence score
5. **Backend nhận AI response**:
   - **Nếu confidence >= 80%**:
     - Lưu AI message vào SQL + Firebase
     - Log vào `AIInteractions` table
     - Return response về Frontend
   - **Nếu confidence < 80%**:
     - Trigger **Flow 2: Fallback to Human**
6. **Firebase Realtime Listener** (Admin Dashboard):
   - Nhận event message mới
   - Update UI: hiển thị tin User và AI reply
   - Update unread count (nếu admin không focus vào room đó).
7. **Frontend Widget**:
   - Hiển thị tin User
   - Hiển thị typing indicator trong 1-2s
   - Hiển thị AI reply từ response

**End State:** User nhận được câu trả lời từ AI, room vẫn ở `currentMode: "AI"`

**Error Handling:**
- AI API timeout (>5s): Trigger Circuit Breaker → Fallback to Human
- AI API error (500, rate limit): Log error → Fallback to Human

---

### Flow 2: AI không trả lời được → Fallback sang Human

**Actors:** Backend AI Service, Backend Presence Service, Admin Dashboard, FCM

**Preconditions:**
- AI confidence < 80% HOẶC AI timeout/error

**Steps:**

1. **Backend AI Service** phát hiện cần fallback:
   - Log vào `AIInteractions` table với `Status: "Fallback"`
   - Update `ChatRooms.CurrentMode = "Waiting"`
2. **Backend gọi Presence Service**:
   - `GET /api/presence/admins` → Check có admin online không
3. **Case 1: Có admin online** → **Flow 3**
4. **Case 2: Tất cả offline** → **Flow 5**

---

### Flow 3: User yêu cầu gặp người thật → Check Presence → Phân room

**Actors:** User, Backend, Firebase Presence, Admin Dashboard

**Preconditions:**
- User click "Gặp nhân viên" HOẶC AI trigger fallback
- Có ít nhất 1 admin online

**Steps:**

1. **Backend check presence**:
   - Query Firebase `/presence` → Filter admins có `connections` không rỗng
2. **Backend gọi `sp_GetAvailableAdmin`**:
   - Round-robin: Chọn admin có `CurrentChatCount` thấp nhất
   - Nếu tất cả full → Đưa vào hàng đợi (`CurrentMode = "Waiting"`)
3. **Backend assign admin**:
   - Gọi `sp_AssignAdminToRoom` → Update `AssignedAdminId`, `CurrentMode = "Human"`
   - Push system message vào Firebase: "Admin [Name] đã tiếp nhận..."
4. **Firebase Realtime Event**:
   - Admin Dashboard nhận event `room_assigned` → Hiển thị notification:
     - Popup toast: "Bạn được phân room mới: Nguyễn Văn A"
     - Highlight room trong sidebar
5. **Admin Dashboard**:
   - Auto navigate hoặc auto-expand sidebar room
   - Play notification sound (optional)
6. **Backend gửi Web Push** (nếu admin không focus tab):
   - `POST /api/push/send-notification` với type: `new_message`

**End State:** Room ở mode `"Human"`, admin đã tiếp nhận

---

### Flow 4: Admin Takeover ↔ Trả lại AI

**Actors:** Admin, Backend, Firebase

**Preconditions:**
- Room đang ở mode `"AI"` (để takeover) hoặc `"Human"` (để handback)

**Steps (Takeover):**

1. **Admin click "Tiếp nhận"** button
2. **Frontend gọi** `PUT /api/chat/rooms/{roomId}/takeover`
3. **Backend**:
   - Update `ChatRooms.CurrentMode = "Human"`, `AssignedAdminId = {adminId}`
   - Update `Admins.CurrentChatCount += 1`
   - Push system message vào Firebase
4. **Firebase Realtime Listener**:
   - Admin Dashboard: Update badge `"Human Mode"`
   - Input placeholder thay đổi: "Nhập tin nhắn cho khách hàng..."
   - User widget: Hiển thị system message "Nhân viên đã vào hỗ trợ..."

**Steps (Handback to AI):**

1. **Admin click "Trả lại AI"** button
2. **Frontend gọi** `PUT /api/chat/rooms/{roomId}/handback-to-ai`
3. **Backend**:
   - Update `ChatRooms.CurrentMode = "AI"`, `AssignedAdminId = NULL`
   - Update `Admins.CurrentChatCount -= 1`
   - Push system message
4. **Firebase Realtime Listener**: Đảo ngược flow takeover

**End State:** Mode chuyển đổi thành công

---

### Flow 5: Tất cả Admin offline → Lưu message + FCM Push

**Actors:** User, Backend, SQL Server, FCM

**Preconditions:**
- User gửi tin nhắn HOẶC yêu cầu gặp người thật
- Tất cả admin offline (Firebase `/presence` không có connections)

**Steps:**

1. **Backend phát hiện không có admin online**
2. **Backend**:
   - Update `ChatRooms.CurrentMode = "Offline"`
   - Lưu tin nhắn User vào SQL
   - Push system message vào Firebase: "Nhân viên hiện không trực tuyến. Vui lòng để lại lời nhắn..."
3. **Backend trigger FCM**:
   - Query `FCMTokens` table → Lấy all active tokens
   - `POST /api/push/send-notification` với:
     - `type: "offline"`
     - `topic: "all_admins"`
     - `title: "Khách hàng đang chờ (Offline)"`
     - `body: "User [Name] vừa gửi tin nhắn lúc Admin vắng mặt."`
4. **FCM gửi notification đến tất cả admin devices**:
   - Web Push: Hiển thị browser notification
   - Mobile: Push notification (nếu có app)
5. **Admin click notification**:
   - Deep link mở dashboard → Navigate đến room
   - Auto takeover (optional)

**End State:** User đã để lại lời nhắn, admin sẽ nhận được push khi offline

---

### Flow 6: Admin Presence (Keep Connect) — Connect/Disconnect Lifecycle

**Actors:** Admin, Firebase SDK, Backend

**Steps (Connect):**

1. **Admin mở Dashboard** → Login (Firebase Auth)
2. **Frontend Firebase SDK**:
   ```javascript
   const connectedRef = ref(db, '.info/connected');
   onValue(connectedRef, (snap) => {
     if (snap.val() === true) {
       const myConnectionsRef = push(ref(db, `presence/${adminId}/connections`));
       
       // Auto remove khi disconnect
       onDisconnect(myConnectionsRef).remove();
       set(myConnectionsRef, true);
       
       // Update lastOnline khi disconnect
       onDisconnect(ref(db, `presence/${adminId}/lastOnline`))
         .set(serverTimestamp());
     }
   });
   ```
3. **Frontend gọi Backend**: `POST /api/presence/connect`
   - Backend log vào `AdminPresenceLog` (optional)
   - Backend update `Admins.LastActiveAt`

**Steps (Disconnect - Auto):**

1. **Admin đóng tab / mất mạng**
2. **Firebase Server tự động**:
   - Xóa connection node tại `/presence/{adminId}/connections/{sessionId}`
   - Set `lastOnline = serverTimestamp()`
3. **Firebase Listener (Backend hoặc Dashboard)**:
   - Detect connections rỗng → Admin offline
   - Update UI: Admin status = offline

**Steps (Disconnect - Manual Logout):**

1. **Admin click Logout**
2. **Frontend**:
   - `POST /api/presence/disconnect`
   - Firebase: Manually remove all connections
   - Firebase Auth: `signOut()`

**End State:** Presence được đồng bộ realtime, không cần polling

---

### Flow 7: Push Notification — 4 loại trigger

**Actors:** Backend, FCM, Admin devices

**4 loại push:**

#### 7.1 Push: Tin nhắn mới (new_message)
- **Trigger:** User gửi tin khi admin assigned nhưng không focus tab
- **Title:** "Tin nhắn mới từ [UserName]"
- **Body:** Nội dung message (truncate 100 chars)
- **Action:** Click → Navigate to room

#### 7.2 Push: Cần hỗ trợ gấp (urgent)
- **Trigger:** User click "Cần hỗ trợ gấp" / AI confidence < 50% / User typing từ khóa urgent
- **Title:** "🔴 Khách cần hỗ trợ gấp!"
- **Body:** "[UserName]: [message preview]"
- **Visual:** Border đỏ, auto-expand room
- **Action:** Click → Auto takeover + open room

#### 7.3 Push: Admin offline (FCM)
- **Trigger:** User gửi tin khi tất cả admin offline (Flow 5)
- **Title:** "Khách hàng đang chờ (Offline)"
- **Body:** "User [Name] vừa gửi tin nhắn lúc Admin vắng mặt."
- **Action:** Click → Open dashboard → takeover

#### 7.4 Push: AI Circuit Break (ai_fail)
- **Trigger:** AI timeout >5s / Error rate >10% / Circuit breaker open
- **Title:** "⚠️ Circuit Breaker kích hoạt!"
- **Body:** "Gemini Flash timeout. Tự động chuyển sang Human fallback."
- **Action:** Click → Open monitoring dashboard

**Implementation:**
```typescript
// Backend gửi FCM
const message = {
  data: { roomId, type, userId, userName },
  notification: { title, body },
  topic: 'all_admins', // Hoặc tokens: [token1, token2]
  webpush: {
    notification: {
      badge: '/badge-icon.png',
      icon: '/notification-icon.png',
      requireInteraction: type === 'urgent', // Giữ lại cho urgent
      actions: [
        { action: 'view', title: 'Mở chat' },
        { action: 'dismiss', title: 'Bỏ qua' }
      ]
    }
  }
};
await admin.messaging().send(message);
```

---

### Flow 8: Admin Round-robin — Load Balancing

**Actors:** Backend, SQL Server, Firebase

**Preconditions:**
- Có >1 admin online
- Room mới cần assign (từ Flow 3)

**Steps:**

1. **Backend gọi** `sp_GetAvailableAdmin`:
   ```sql
   SELECT TOP 1 AdminId, CurrentChatCount, MaxConcurrentChats
   FROM Admins
   WHERE IsActive = 1 
     AND CurrentChatCount < MaxConcurrentChats
   ORDER BY CurrentChatCount ASC, LastActiveAt DESC;
   ```
2. **Kết quả**:
   - Admin có `CurrentChatCount` thấp nhất → Assign
   - Nếu bằng nhau → Chọn admin active gần nhất (`LastActiveAt DESC`)
3. **Backend assign**:
   - `sp_AssignAdminToRoom` → Update room + increment `CurrentChatCount`
   - Push event to Firebase

**Optimization:**
- Cache danh sách admin online trong Redis (TTL 30s)
- Webhook: Khi admin connect/disconnect → Invalidate cache

---

### Flow 9: Lazy Loading Chat History — Pagination

**Actors:** Admin Dashboard, Backend API, SQL Server

**Preconditions:**
- Admin mở room detail
- Room có >20 tin nhắn

**Steps:**

1. **Frontend render MessageList**:
   - Load 20 tin gần nhất: `GET /api/chat/rooms/{roomId}/messages?pageSize=20`
   - Hiển thị scroll-to-bottom
2. **Admin scroll lên top**:
   - Detect scroll position ~100px từ top
   - Trigger lazy load: `GET /api/chat/rooms/{roomId}/messages?before={oldestTimestamp}&pageSize=20`
3. **Backend**:
   - Query SQL: 
     ```sql
     SELECT TOP 20 * FROM Messages 
     WHERE RoomId = @RoomId AND CreatedAt < @BeforeTimestamp
     ORDER BY CreatedAt DESC
     ```
   - Return messages + `hasMore: boolean`
4. **Frontend**:
   - Prepend messages vào đầu list
   - Maintain scroll position (không auto-scroll)
   - Nếu `hasMore = false` → Hiển thị "Đầu cuộc trò chuyện"

**Optimization:**
- Chỉ load từ SQL khi cần history cũ (>24h)
- Tin nhắn <24h → Có thể cache trong Firebase (ttl)

---

### Flow 10: Circuit Breaker cho AI — Monitor, Trip, Recover

**Actors:** Backend AI Service, Monitoring, Admin Dashboard

**States:**
- **Closed** (Normal): AI đang hoạt động bình thường
- **Open** (Tripped): AI bị lỗi → Ngừng gọi AI, auto fallback Human
- **Half-open** (Testing): Thử gọi lại AI sau 1 khoảng thời gian

**Steps:**

1. **Monitor AI Health**:
   - Backend track metrics:
     - `errorRate` (rolling window 5 phút)
     - `p95LatencyMs`
     - `failureCount` (liên tiếp)
2. **Trip Conditions** (Open Circuit):
   - Error rate >10% trong 5 phút
   - Hoặc 5 lỗi liên tiếp
   - Hoặc p95 latency >5000ms
3. **When Circuit Opens**:
   - Backend set Redis key: `circuit_breaker:ai = "open"`
   - Tất cả request mới → Auto fallback to Human (không gọi AI)
   - Log event: "Circuit breaker opened - AI unavailable"
   - Trigger Push: `type: "ai_fail"` → Notify all admins
4. **Recovery (Half-open)**:
   - Sau 60 seconds, chuyển sang `"half-open"`
   - Cho phép 1-2 request thử → Nếu thành công → Chuyển về `"closed"`
   - Nếu lại fail → Về `"open"`, tăng timeout lên 120s
5. **Monitoring Dashboard**:
   - Hiển thị real-time status trong Right Panel
   - Widget: "Circuit Breaker: Healthy / Degraded / Down"

**Implementation (Pseudo-code):**
```csharp
public async Task<AIResponse> ProcessWithCircuitBreaker(string message) {
    var state = await _redis.GetAsync("circuit_breaker:ai");
    
    if (state == "open") {
        throw new CircuitBreakerOpenException("AI unavailable - fallback to human");
    }
    
    try {
        var response = await CallAIAPI(message);
        await ResetFailureCount();
        return response;
    }
    catch (Exception ex) {
        await IncrementFailureCount();
        var count = await GetFailureCount();
        
        if (count >= 5) {
            await OpenCircuitBreaker();
        }
        throw;
    }
}
```

---

### Flow 11: Kết thúc phòng chat — Lưu lịch sử, Cleanup

**Actors:** Admin, Backend, SQL Server, Firebase

**Preconditions:**
- Admin click "Kết thúc" HOẶC User click "Đóng chat" HOẶC Timeout (30 phút không hoạt động)

**Steps:**

1. **Frontend**: `PUT /api/chat/rooms/{roomId}/close`
2. **Backend**:
   - Update `ChatRooms`:
     - `Status = "Closed"`
     - `ClosedAt = GETUTCDATE()`
     - Calculate metrics: `FirstResponseTime`, `AvgResponseTime`
   - Nếu assigned admin → Decrement `Admins.CurrentChatCount`
   - Push system message: "Cuộc hội thoại đã kết thúc."
3. **Optional: Survey**:
   - Nếu User widget vẫn mở → Hiển thị popup rating (1-5 sao)
   - User rate → `PUT /api/chat/rooms/{roomId}/rating`
   - Backend update `ChatRooms.SatisfactionRating`
4. **Firebase Cleanup** (optional):
   - Giữ messages trong 7 ngày (cho admin tra cứu nhanh)
   - Sau 7 ngày: Cloud Function auto-delete `/messages/{roomId}`
   - `/rooms/{roomId}` → Archive hoặc xóa
5. **Admin Dashboard**:
   - Room move vào tab "Closed"
   - Có thể reopen (nếu user quay lại trong 24h)

**End State:** Room closed, data lưu trong SQL, Firebase cleanup (scheduled)

---

## 8. Push Notification System

### 8.1 Firebase Cloud Messaging (FCM) Setup

**Admin Dashboard Registration:**
```typescript
// Frontend: Request permission & get token
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging();

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });
    
    // Send token to backend
    await fetch('/api/admins/fcm-token', {
      method: 'POST',
      body: JSON.stringify({
        adminId: currentAdminId,
        deviceToken: token,
        deviceType: 'Web',
        deviceName: navigator.userAgent
      })
    });
  }
}

// Listen for foreground messages
onMessage(messaging, (payload) => {
  showPushNotification(payload);
});
```

**Service Worker (Background messages):**
```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({ /* config */ });
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/notification-icon.png',
    badge: '/badge-icon.png',
    data: payload.data,
    requireInteraction: payload.data.type === 'urgent',
    actions: [
      { action: 'view', title: 'Mở chat' },
      { action: 'dismiss', title: 'Bỏ qua' }
    ]
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const roomId = event.notification.data.roomId;
    event.waitUntil(
      clients.openWindow(`/admin/rooms/${roomId}`)
    );
  }
});
```

---

### 8.2 Push Notification UI Component

**PushStack Component:**
```typescript
interface PushNotification {
  id: string;
  type: 'new_message' | 'urgent' | 'offline' | 'ai_fail';
  title: string;
  body: string;
  data: {
    roomId: string;
    userId?: string;
    userName?: string;
  };
  duration: number; // ms
  requireInteraction: boolean;
}

function PushStack() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  
  const addNotification = (notif: PushNotification) => {
    setNotifications(prev => [...prev, notif]);
    
    if (!notif.requireInteraction) {
      setTimeout(() => dismissNotification(notif.id), notif.duration);
    }
  };
  
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <div className="push-stack">
      {notifications.map(notif => (
        <PushCard 
          key={notif.id} 
          notification={notif}
          onDismiss={() => dismissNotification(notif.id)}
        />
      ))}
    </div>
  );
}
```

---

## 9. Security & Optimization

### 9.1 Firebase Security Rules

```javascript
{
  "rules": {
    // Presence: read all, write own
    "presence": {
      "$adminId": {
        ".read": true,
        ".write": "$adminId === auth.uid && auth.token.role === 'admin'"
      }
    },
    
    // Rooms: authenticated read/write
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    
    // Messages: authenticated read, conditional write
    "messages": {
      "$roomId": {
        ".read": "auth != null",
        "$messageId": {
          ".write": "auth != null && (
            !newData.child('isInternalNote').val() || 
            auth.token.role === 'admin'
          )"
        }
      }
    },
    
    // Typing: authenticated, auto-expire
    "typing": {
      "$roomId": {
        "$userId": {
          ".read": true,
          ".write": "$userId === auth.uid",
          ".validate": "newData.hasChildren(['isTyping', 'timestamp'])"
        }
      }
    }
  }
}
```

---

### 9.2 Rate Limiting

**Backend API Rate Limiting (ASP.NET Core):**
```csharp
// Startup.cs
services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("api", opt => {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 60;
    });
    
    options.AddFixedWindowLimiter("ai", opt => {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 20; // Giới hạn AI calls
    });
});

// Controller
[EnableRateLimiting("api")]
[HttpPost("send-message")]
public async Task<IActionResult> SendMessage() { }
```

---

### 9.3 Optimization Tips

#### Lazy Loading Chat History
- Frontend: Chỉ load 20 tin gần nhất khi mở room
- Scroll to top → Load thêm 20 tin cũ hơn (pagination)
- Không load toàn bộ history từ SQL lên Firebase

#### Firebase Indexing
```json
{
  "rules": {
    "messages": {
      "$roomId": {
        ".indexOn": ["createdAt", "senderType"]
      }
    },
    "rooms": {
      ".indexOn": ["currentMode", "status", "updatedAt"]
    }
  }
}
```

#### Caching
- **Admin online list**: Cache trong Redis, TTL 30s
- **Knowledge base**: Cache tất cả documents khi app start
- **Quick replies**: Cache per admin

#### Database Indexing
- Tất cả indexes đã liệt kê trong Section 3.1
- Thêm composite index cho queries thường dùng:
  ```sql
  CREATE INDEX IX_Messages_RoomId_CreatedAt_SenderType 
  ON Messages(RoomId, CreatedAt DESC, SenderType);
  ```

---

### 9.4 Data Retention

**Firebase:**
- Messages: Giữ 7 ngày (cho realtime sync)
- Cloud Function auto-delete sau 7 ngày
- Presence: Real-time only (không cần retention)

**SQL Server:**
- Messages: Permanent (hoặc archive sau 1 năm)
- ChatRooms: Permanent
- AIInteractions: Giữ 90 ngày (cho analytics)
- AdminPresenceLog: Giữ 30 ngày

**Archival Strategy:**
```sql
-- Chạy hàng tháng
INSERT INTO MessagesArchive 
SELECT * FROM Messages 
WHERE CreatedAt < DATEADD(YEAR, -1, GETUTCDATE());

DELETE FROM Messages 
WHERE CreatedAt < DATEADD(YEAR, -1, GETUTCDATE());
```

---

## 10. Error Handling

### 10.1 Frontend Error Handling

**API Call Wrapper:**
```typescript
async function apiCall<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }
    
    const data = await response.json();
    return data.data; // Unwrap { success, data }
  }
  catch (error) {
    if (error instanceof ApiError) {
      showToast(error.message, 'error');
    } else {
      showToast('Đã xảy ra lỗi. Vui lòng thử lại.', 'error');
    }
    throw error;
  }
}
```

**Firebase Connection Error:**
```typescript
const connectedRef = ref(db, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === false) {
    showToast('Mất kết nối Firebase. Đang thử kết nối lại...', 'warning');
  } else {
    showToast('Đã kết nối Firebase', 'success');
  }
});
```

---

### 10.2 Backend Error Handling

**Standard API Response:**
```csharp
public class ApiResponse<T> {
    public bool Success { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; }
}

// Exception filter
public class ApiExceptionFilter : IExceptionFilter {
    public void OnException(ExceptionContext context) {
        var response = new ApiResponse<object> {
            Success = false,
            Message = context.Exception.Message,
            Errors = new List<string> { context.Exception.StackTrace }
        };
        
        context.Result = new ObjectResult(response) {
            StatusCode = context.Exception switch {
                NotFoundException => 404,
                ValidationException => 400,
                UnauthorizedException => 401,
                _ => 500
            }
        };
    }
}
```

**Retry Logic for AI API:**
```csharp
public async Task<AIResponse> CallAIWithRetry(string message, int maxRetries = 3) {
    for (int i = 0; i < maxRetries; i++) {
        try {
            return await _aiClient.GenerateResponse(message);
        }
        catch (HttpRequestException ex) when (i < maxRetries - 1) {
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, i))); // Exponential backoff
        }
    }
    throw new AiUnavailableException("AI service unreachable after retries");
}
```

---

### 10.3 Logging & Monitoring

**Structured Logging (Serilog):**
```csharp
Log.Information("Message sent {@Message}", new {
    RoomId = roomId,
    SenderType = senderType,
    MessageLength = messageText.Length,
    LatencyMs = stopwatch.ElapsedMilliseconds
});

Log.Error(ex, "AI API failed for room {RoomId}", roomId);
```

**Metrics to Track:**
- API response times (p50, p95, p99)
- AI latency, error rate, confidence distribution
- Admin response times
- User satisfaction scores
- FCM delivery success rate

**Recommended Tools:**
- Application Insights (Azure)
- Sentry (Error tracking)
- Grafana + Prometheus (Metrics)

---

## 11. Deployment Checklist

### 11.1 Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

**Backend (appsettings.json):**
```json
{
  "ConnectionStrings": {
    "SqlServer": "Server=...;Database=ChatSupport;...",
    "Redis": "localhost:6379"
  },
  "Firebase": {
    "ProjectId": "...",
    "ServiceAccountKeyPath": "/path/to/serviceAccountKey.json"
  },
  "AI": {
    "Provider": "Gemini",
    "ApiKey": "...",
    "Model": "gemini-flash-2.0",
    "ConfidenceThreshold": 80
  },
  "FCM": {
    "ServerKey": "..."
  }
}
```

---

### 11.2 Database Migration

```bash
# Run migrations
dotnet ef database update

# Seed initial data
dotnet run --seed-data

# Verify indexes
SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Messages');
```

---

### 11.3 Firebase Setup

1. **Create Firebase Project** → Enable Realtime Database
2. **Deploy Security Rules** (Section 9.1)
3. **Enable FCM** → Generate VAPID key
4. **Create Service Account** → Download JSON key (cho Backend)

---

### 11.4 Pre-Launch Tests

- [ ] Load test: 100 concurrent users
- [ ] Firebase presence: Test disconnect scenarios
- [ ] AI fallback: Kill AI API → Verify human fallback
- [ ] FCM: Test push khi admin offline
- [ ] Circuit breaker: Simulate AI timeout
- [ ] Round-robin: 3 admins online → Verify load balancing
- [ ] Security: Penetration testing cho API & Firebase rules

---


