"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { chatApi } from "../api/chatApi";
import { useFirebaseChat } from "../hooks/useFirebaseChat";
import { useUserNotification } from "@/app/hooks/useUserNotification";
import { useChatRoom } from "@/app/hooks/useChatRoom";
import type { ChatMessage, ChatMode, ChatWidgetConfig } from "../types/chat";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateUserId() {
  return `user_anon_${crypto.randomUUID()}`;
}

function generateSessionId() {
  return `session_${Date.now()}_${crypto.randomUUID()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <div className="flex gap-1.5 items-center px-3 py-2.5 bg-white border border-gray-200 rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl w-14">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.senderType === "User";
  const isSystem = message.senderType === "System";
  const isAdmin = message.senderType === "Admin";
  const isAI = message.senderType === "AI";

  if (isSystem) {
    return (
      <div className="self-center">
        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-center">
          {message.messageText}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-1.5 max-w-[88%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
    >
      {/* Avatar */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 self-end
          ${isUser ? "bg-[#185FA5] text-white" : isAdmin ? "bg-[#085041] text-white" : "bg-[#E6F1FB] text-[#0C447C]"}`}
      >
        {isUser ? "B" : isAdmin ? "A" : "AI"}
      </div>

      {/* Bubble */}
      <div className="flex flex-col gap-0.5">
        <div
          className={`px-3 py-1.5 text-[11px] leading-relaxed rounded-xl
            ${
              isUser
                ? "bg-[#185FA5] text-white rounded-tr-sm"
                : isAdmin
                  ? "bg-[#085041] text-white rounded-tl-sm"
                  : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm"
            }`}
        >
          {message.messageText}
        </div>
        {isAI && message.metadata?.confidence !== undefined && (
          <span className="text-[9px] text-gray-400 px-0.5">
            AI · {message.metadata.confidence}% confidence
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Mode Banner ──────────────────────────────────────────────────────────────

function ModeBanner({ mode }: { mode: ChatMode }) {
  if (mode === "AI") return null;

  const configs: Record<string, { text: string; cls: string }> = {
    Human: {
      text: "Đã kết nối với nhân viên hỗ trợ",
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    Waiting: {
      text: "Đang chờ nhân viên hỗ trợ tiếp nhận…",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    Offline: {
      text: "Tất cả nhân viên đang offline. Tin nhắn của bạn đã được ghi lại.",
      cls: "bg-gray-50 text-gray-600 border-gray-200",
    },
  };

  const cfg = configs[mode];
  if (!cfg) return null;

  return (
    <div
      className={`text-[10px] font-medium text-center px-3 py-1.5 border-b ${cfg.cls}`}
    >
      {cfg.text}
    </div>
  );
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ChatMode, { dot: string; text: string }> = {
  AI: { dot: "bg-[#9FE1CB]", text: "AI đang trực tuyến" },
  Human: { dot: "bg-green-400", text: "Nhân viên đang hỗ trợ" },
  Waiting: { dot: "bg-amber-400 animate-pulse", text: "Đang chờ nhân viên…" },
  Offline: { dot: "bg-gray-400", text: "Offline" },
};

// ─── Main Widget ──────────────────────────────────────────────────────────────

interface ChatWidgetProps {
  config?: ChatWidgetConfig;
}

export function ChatWidget({ config }: ChatWidgetProps) {
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<ChatMode>("AI");
  const [unreadCount, setUnreadCount] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);

  const userIdRef = useRef(generateUserId());
  const sessionIdRef = useRef(generateSessionId());
  const msgListRef = useRef<HTMLDivElement>(null);
  const roomCreatingRef = useRef(false);
  // Track messages already shown (to avoid Firebase listener re-emitting existing messages)
  const shownMsgIdsRef = useRef(new Set<string>());

  // ─── Firebase listener (active only in Human/Waiting mode) ────────────────
  const isFirebaseMode = mode === "Human" || mode === "Waiting";

  const handleFirebaseMessage = useCallback(
    (message: ChatMessage) => {
      // Dedup: skip messages we already rendered (user's own messages)
      if (shownMsgIdsRef.current.has(message.id)) return;
      // Skip user's own messages re-emitted by Firebase
      if (
        message.senderType === "User" &&
        message.senderId === userIdRef.current
      )
        return;

      shownMsgIdsRef.current.add(message.id);
      setMessages((prev) => [...prev, message]);

      if (!isOpen) setUnreadCount((c) => c + 1);

      // Detect mode change via system messages
      if (message.senderType === "System") {
        if (message.messageText.includes("tiếp nhận")) setMode("Human");
        if (message.messageText.includes("AI Mode")) setMode("AI");
      }
    },
    [isOpen],
  );

  const { pushMessage } = useFirebaseChat({
    roomId,
    enabled: isFirebaseMode,
    onMessage: handleFirebaseMessage,
  });

  // ─── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ─── Clear unread on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // ─── Initial greeting ─────────────────────────────────────────────────────
  useEffect(() => {
    const greeting: ChatMessage = {
      id: "greeting",
      senderType: "AI",
      senderId: "system",
      messageText:
        "Xin chào! Tôi là trợ lý AI của CLB Côn Nhị Khúc Hà Đông. Tôi có thể giúp gì cho bạn? Hỏi về lịch tập, học phí, hoặc đăng ký nhé!",
      messageType: "text",
      createdAt: Date.now(),
    };
    shownMsgIdsRef.current.add("greeting");
    setMessages([greeting]);
  }, []);

  // ─── Ensure room exists ───────────────────────────────────────────────────
  const ensureRoom = useCallback(async (): Promise<string | null> => {
    if (roomId) return roomId;
    if (roomCreatingRef.current) return null;

    roomCreatingRef.current = true;
    const result = await chatApi.createRoom({
      userId: userIdRef.current,
      userName: config?.userName ?? "Khách",
      sessionId: sessionIdRef.current,
      source: config?.source ?? "Landing page",
      deviceType: /Mobi/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      userAgent: navigator.userAgent,
    });
    roomCreatingRef.current = false;

    if (result.isSuccess) {
      setRoomId(result.data.roomId);
      return result.data.roomId;
    }

    return null;
  }, [roomId, config]);

  // ─── Message helpers ──────────────────────────────────────────────────────
  const appendError = useCallback((text: string) => {
    const errMsg: ChatMessage = {
      id: `err_${Date.now()}`,
      senderType: "System",
      messageText: text,
      messageType: "system",
      createdAt: Date.now(),
    };
    shownMsgIdsRef.current.add(errMsg.id);
    setMessages((prev) => [...prev, errMsg]);
  }, []);

  const triggerFallback = useCallback(
    (rid: string, noticeText: string) => {
      const notice: ChatMessage = {
        id: `fallback_${Date.now()}`,
        senderType: "System",
        messageText: noticeText,
        messageType: "system",
        createdAt: Date.now(),
      };
      shownMsgIdsRef.current.add(notice.id);
      setMessages((prev) => [...prev, notice]);
      setMode("Waiting");
      if (!roomId) setRoomId(rid);
    },
    [roomId],
  );

  // ─── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      senderType: "User",
      senderId: userIdRef.current,
      messageText: text,
      messageType: "text",
      createdAt: Date.now(),
    };
    shownMsgIdsRef.current.add(userMsg.id);
    setMessages((prev) => [...prev, userMsg]);

    // ── Human mode: push directly to Firebase, admin will reply ─────────────
    if (mode === "Human" && roomId) {
      await pushMessage(text, userIdRef.current, "User");
      setIsSending(false);
      return;
    }

    // ── AI mode: call backend API ─────────────────────────────────────────
    const rid = await ensureRoom();
    if (!rid) {
      setIsSending(false);
      appendError("Không thể kết nối đến server. Vui lòng thử lại.");
      return;
    }

    setIsTyping(true);

    const result = await chatApi.sendMessage({
      roomId: rid,
      senderType: "User",
      senderId: userIdRef.current,
      messageText: text,
      messageType: "text",
      isInternalNote: false,
    });

    setIsTyping(false);
    setIsSending(false);

    if (!result.isSuccess) {
      triggerFallback(
        rid,
        "Xin lỗi, hiện tại tôi gặp sự cố kỹ thuật. Đang kết nối với nhân viên hỗ trợ…",
      );
      return;
    }

    const { aiResponse } = result.data;

    if (!aiResponse) return;

    if (aiResponse.fallbackToHuman) {
      triggerFallback(
        rid,
        aiResponse.messageText ||
          "Câu hỏi này cần được hỗ trợ trực tiếp. Đang kết nối với nhân viên…",
      );
      return;
    }

    const aiMsg: ChatMessage = {
      id: aiResponse.messageId,
      senderType: "AI",
      senderId: "gemini-flash",
      messageText: aiResponse.messageText,
      messageType: "text",
      metadata: {
        confidence: aiResponse.confidence,
        intent: aiResponse.intent,
      },
      createdAt: Date.now(),
    };
    shownMsgIdsRef.current.add(aiMsg.id);
    setMessages((prev) => [...prev, aiMsg]);
  }, [input, isSending, mode, roomId, ensureRoom, appendError, triggerFallback, pushMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const { dot: statusDotColor, text: statusText } = STATUS_CONFIG[mode];

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2.5 z-[900]">
      {/* Chat window */}
      <div
        className={`w-80 bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-2xl
          origin-bottom-right transition-all duration-200
          ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="px-3.5 py-3 bg-[#185FA5] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <ChatIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white">
              CLB Côn Nhị Khúc
            </div>
            <div className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
              {statusText}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/75 hover:text-white text-xl leading-none p-0.5"
            aria-label="Đóng chat"
          >
            ×
          </button>
        </div>

        {/* Mode banner */}
        <ModeBanner mode={mode} />

        {/* Messages */}
        <div
          ref={msgListRef}
          className="h-52 overflow-y-auto px-3 py-3 flex flex-col gap-2 bg-gray-50/80"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-1.5 self-start">
              <div className="w-6 h-6 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[9px] font-bold text-[#0C447C] flex-shrink-0 self-end">
                AI
              </div>
              <TypingBubble />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-200 bg-white">
          <input
            id={inputId}
            className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-white text-gray-900 outline-none focus:border-[#185FA5] font-[inherit]"
            placeholder={
              mode === "Human"
                ? "Nhắn tin cho nhân viên…"
                : mode === "Waiting"
                  ? "Chờ nhân viên tiếp nhận…"
                  : "Nhập tin nhắn…"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || mode === "Waiting" || mode === "Offline"}
          />
          <button
            onClick={sendMessage}
            disabled={
              isSending ||
              !input.trim() ||
              mode === "Waiting" ||
              mode === "Offline"
            }
            className="w-8 h-8 bg-[#185FA5] border-0 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-[#0C447C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Gửi tin nhắn"
          >
            <SendIcon className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-400 py-1.5 bg-white border-t border-gray-100">
          Powered by AI · CLB Côn Nhị Khúc Hà Đông
        </div>
      </div>

      {/* Bubble button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-14 h-14 bg-[#185FA5] rounded-full flex items-center justify-center border-0 cursor-pointer hover:scale-105 transition-transform relative shadow-lg"
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        <ChatIcon className="w-6 h-6 text-white" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Icons (inline SVG to avoid external deps) ───────────────────────────────

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
