## 3. Database Schema

### 3.1 SQL Server Schema

#### Table: `ChatRooms`
Lưu thông tin phòng chat

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `RoomId` | UNIQUEIDENTIFIER | PRIMARY KEY | Firebase room key hoặc GUID |
| `UserId` | NVARCHAR(100) | NOT NULL | ID người dùng (có thể anonymous) |
| `UserName` | NVARCHAR(200) | NULL | Tên hiển thị |
| `UserEmail` | NVARCHAR(255) | NULL | Email (nếu có) |
| `UserPhone` | NVARCHAR(20) | NULL | SĐT (nếu có) |
| `SessionId` | NVARCHAR(100) | NOT NULL | Session tracking ID |
| `Source` | NVARCHAR(100) | NULL | Nguồn (Landing page, Facebook, etc.) |
| `DeviceType` | NVARCHAR(50) | NULL | Mobile/Desktop/Tablet |
| `UserAgent` | NVARCHAR(500) | NULL | Browser info |
| `CurrentMode` | NVARCHAR(20) | NOT NULL | `AI`, `Human`, `Waiting`, `Offline` |
| `AssignedAdminId` | INT | NULL | FK → Admins.AdminId |
| `Status` | NVARCHAR(20) | NOT NULL | `Active`, `Closed`, `Archived` |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |
| `UpdatedAt` | DATETIME2 | NOT NULL | Auto update trigger |
| `ClosedAt` | DATETIME2 | NULL | Thời điểm kết thúc |
| `FirstResponseTime` | INT | NULL | Seconds from first message to first reply |
| `AvgResponseTime` | FLOAT | NULL | Average response time |
| `TotalMessages` | INT | DEFAULT 0 | Tổng số tin nhắn |
| `SentimentScore` | FLOAT | NULL | -1.0 to 1.0 |
| `SatisfactionRating` | INT | NULL | 1-5 stars (post-chat survey) |

**Indexes:**
```sql
CREATE INDEX IX_ChatRooms_UserId ON ChatRooms(UserId);
CREATE INDEX IX_ChatRooms_SessionId ON ChatRooms(SessionId);
CREATE INDEX IX_ChatRooms_Status ON ChatRooms(Status);
CREATE INDEX IX_ChatRooms_CreatedAt ON ChatRooms(CreatedAt DESC);
CREATE INDEX IX_ChatRooms_AssignedAdminId ON ChatRooms(AssignedAdminId);
```

---

#### Table: `Messages`
Lưu lịch sử tin nhắn

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `MessageId` | BIGINT | PRIMARY KEY IDENTITY | Auto increment |
| `RoomId` | UNIQUEIDENTIFIER | NOT NULL, FK → ChatRooms | Room ID |
| `FirebaseMessageId` | NVARCHAR(100) | NULL | Firebase push key |
| `SenderType` | NVARCHAR(20) | NOT NULL | `User`, `AI`, `Admin`, `System` |
| `SenderId` | NVARCHAR(100) | NULL | Admin ID hoặc AI model name |
| `MessageText` | NVARCHAR(MAX) | NOT NULL | Nội dung tin nhắn |
| `MessageType` | NVARCHAR(20) | DEFAULT 'text' | `text`, `note`, `system`, `image` |
| `IsInternalNote` | BIT | DEFAULT 0 | 1 = chỉ admin xem |
| `Metadata` | NVARCHAR(MAX) | NULL | JSON: {confidence, intent, model, etc.} |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |
| `ReadByAdminAt` | DATETIME2 | NULL | Thời điểm admin đọc |
| `AIConfidence` | FLOAT | NULL | 0-100% |
| `AIIntent` | NVARCHAR(100) | NULL | Ví dụ: "Hỏi học phí" |
| `AISentiment` | NVARCHAR(20) | NULL | `Positive`, `Neutral`, `Negative` |

**Indexes:**
```sql
CREATE INDEX IX_Messages_RoomId_CreatedAt ON Messages(RoomId, CreatedAt DESC);
CREATE INDEX IX_Messages_SenderType ON Messages(SenderType);
CREATE INDEX IX_Messages_CreatedAt ON Messages(CreatedAt DESC);
```

---

#### Table: `Admins`
Thông tin admin/CSR

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `AdminId` | INT | PRIMARY KEY IDENTITY | Auto increment |
| `FirebaseUid` | NVARCHAR(128) | UNIQUE NOT NULL | Firebase Auth UID |
| `Email` | NVARCHAR(255) | UNIQUE NOT NULL | Login email |
| `FullName` | NVARCHAR(200) | NOT NULL | Tên hiển thị |
| `Role` | NVARCHAR(50) | NOT NULL | `Superadmin`, `Admin`, `Support` |
| `AvatarUrl` | NVARCHAR(500) | NULL | URL ảnh đại diện |
| `IsActive` | BIT | DEFAULT 1 | 0 = disabled |
| `MaxConcurrentChats` | INT | DEFAULT 5 | Số phòng tối đa |
| `CurrentChatCount` | INT | DEFAULT 0 | Số phòng đang xử lý |
| `TotalChatsHandled` | INT | DEFAULT 0 | Tổng số phòng đã xử lý |
| `AvgResponseTime` | FLOAT | NULL | Seconds |
| `AvgSatisfactionScore` | FLOAT | NULL | 1-5 stars |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |
| `LastActiveAt` | DATETIME2 | NULL | Cập nhật khi presence connect |

**Indexes:**
```sql
CREATE UNIQUE INDEX IX_Admins_FirebaseUid ON Admins(FirebaseUid);
CREATE INDEX IX_Admins_IsActive ON Admins(IsActive);
```

---

#### Table: `AdminPresenceLog`
Log lịch sử online/offline (optional, for analytics)

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `LogId` | BIGINT | PRIMARY KEY IDENTITY | Auto increment |
| `AdminId` | INT | NOT NULL, FK → Admins | Admin ID |
| `EventType` | NVARCHAR(20) | NOT NULL | `Connect`, `Disconnect` |
| `ConnectionId` | NVARCHAR(100) | NULL | Firebase session ID |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |
| `DeviceInfo` | NVARCHAR(500) | NULL | Browser/OS |

---

#### Table: `AIInteractions`
Log tương tác với AI (cho monitoring & debugging)

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `InteractionId` | BIGINT | PRIMARY KEY IDENTITY | Auto increment |
| `RoomId` | UNIQUEIDENTIFIER | NOT NULL, FK → ChatRooms | Room ID |
| `MessageId` | BIGINT | NULL, FK → Messages | Message ID |
| `AIProvider` | NVARCHAR(50) | NOT NULL | `Gemini`, `Claude`, etc. |
| `ModelName` | NVARCHAR(100) | NOT NULL | `gemini-flash`, etc. |
| `PromptTokens` | INT | NULL | Token count input |
| `CompletionTokens` | INT | NULL | Token count output |
| `LatencyMs` | INT | NULL | Response time |
| `Status` | NVARCHAR(20) | NOT NULL | `Success`, `Error`, `Timeout` |
| `ErrorMessage` | NVARCHAR(MAX) | NULL | Error details |
| `Confidence` | FLOAT | NULL | 0-100% |
| `Intent` | NVARCHAR(100) | NULL | Detected intent |
| `Sentiment` | NVARCHAR(20) | NULL | Sentiment analysis |
| `RAGUsed` | BIT | DEFAULT 0 | 1 = used knowledge base |
| `RAGSources` | NVARCHAR(MAX) | NULL | JSON: documents used |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |

**Indexes:**
```sql
CREATE INDEX IX_AIInteractions_RoomId ON AIInteractions(RoomId);
CREATE INDEX IX_AIInteractions_Status ON AIInteractions(Status);
CREATE INDEX IX_AIInteractions_CreatedAt ON AIInteractions(CreatedAt DESC);
```

---

#### Table: `FCMTokens`
Lưu FCM tokens của admin devices

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `TokenId` | INT | PRIMARY KEY IDENTITY | Auto increment |
| `AdminId` | INT | NOT NULL, FK → Admins | Admin ID |
| `DeviceToken` | NVARCHAR(255) | UNIQUE NOT NULL | FCM token |
| `DeviceType` | NVARCHAR(20) | NOT NULL | `Web`, `Android`, `iOS` |
| `DeviceName` | NVARCHAR(200) | NULL | Browser/Device name |
| `IsActive` | BIT | DEFAULT 1 | 0 = revoked |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |
| `LastUsedAt` | DATETIME2 | NULL | Cập nhật khi gửi push |

**Indexes:**
```sql
CREATE INDEX IX_FCMTokens_AdminId ON FCMTokens(AdminId);
CREATE UNIQUE INDEX IX_FCMTokens_DeviceToken ON FCMTokens(DeviceToken);
```

---

#### Table: `KnowledgeBase`
Knowledge base cho RAG (Retrieval Augmented Generation)

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `DocumentId` | INT | PRIMARY KEY IDENTITY | Auto increment |
| `Category` | NVARCHAR(100) | NOT NULL | `Học phí`, `Lịch tập`, `Đăng ký`, etc. |
| `Question` | NVARCHAR(500) | NOT NULL | Câu hỏi mẫu |
| `Answer` | NVARCHAR(MAX) | NOT NULL | Câu trả lời chuẩn |
| `Keywords` | NVARCHAR(500) | NULL | Từ khóa để search |
| `Priority` | INT | DEFAULT 0 | Độ ưu tiên (càng cao càng match trước) |
| `IsActive` | BIT | DEFAULT 1 | 0 = disabled |
| `UsageCount` | INT | DEFAULT 0 | Số lần được sử dụng |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |
| `UpdatedAt` | DATETIME2 | NOT NULL | Auto update trigger |
| `CreatedBy` | INT | NULL, FK → Admins | Admin tạo |

**Indexes:**
```sql
CREATE INDEX IX_KnowledgeBase_Category ON KnowledgeBase(Category);
CREATE INDEX IX_KnowledgeBase_IsActive ON KnowledgeBase(IsActive);
CREATE FULLTEXT INDEX ON KnowledgeBase(Question, Answer, Keywords);
```

---

#### Table: `QuickReplies`
Các câu trả lời nhanh cho admin

| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| `ReplyId` | INT | PRIMARY KEY IDENTITY | Auto increment |
| `AdminId` | INT | NULL, FK → Admins | NULL = shared, otherwise personal |
| `ShortCode` | NVARCHAR(50) | NULL | Shortcut (ví dụ: `/price`) |
| `MessageText` | NVARCHAR(MAX) | NOT NULL | Nội dung |
| `IsGlobal` | BIT | DEFAULT 0 | 1 = tất cả admin dùng được |
| `UsageCount` | INT | DEFAULT 0 | Số lần sử dụng |
| `CreatedAt` | DATETIME2 | NOT NULL | Default GETUTCDATE() |

---

### 3.2 Stored Procedures (Optional)

#### `sp_CreateChatRoom`
```sql
CREATE PROCEDURE sp_CreateChatRoom
    @UserId NVARCHAR(100),
    @UserName NVARCHAR(200) = NULL,
    @SessionId NVARCHAR(100),
    @Source NVARCHAR(100) = NULL,
    @DeviceType NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    DECLARE @RoomId UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO ChatRooms (RoomId, UserId, UserName, SessionId, Source, DeviceType, UserAgent, CurrentMode, Status, CreatedAt, UpdatedAt)
    VALUES (@RoomId, @UserId, @UserName, @SessionId, @Source, @DeviceType, @UserAgent, 'AI', 'Active', GETUTCDATE(), GETUTCDATE());
    
    SELECT @RoomId AS RoomId;
END
```

#### `sp_AssignAdminToRoom`
```sql
CREATE PROCEDURE sp_AssignAdminToRoom
    @RoomId UNIQUEIDENTIFIER,
    @AdminId INT
AS
BEGIN
    UPDATE ChatRooms 
    SET AssignedAdminId = @AdminId, CurrentMode = 'Human', UpdatedAt = GETUTCDATE()
    WHERE RoomId = @RoomId;
    
    UPDATE Admins 
    SET CurrentChatCount = CurrentChatCount + 1
    WHERE AdminId = @AdminId;
END
```

#### `sp_GetAvailableAdmin`
Round-robin load balancing
```sql
CREATE PROCEDURE sp_GetAvailableAdmin
AS
BEGIN
    SELECT TOP 1 AdminId, FullName, Email, CurrentChatCount, MaxConcurrentChats
    FROM Admins
    WHERE IsActive = 1 
      AND CurrentChatCount < MaxConcurrentChats
    ORDER BY CurrentChatCount ASC, LastActiveAt DESC;
END
```

