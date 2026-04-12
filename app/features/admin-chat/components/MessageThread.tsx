"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/app/lib/utils/cn";
import { MessageSearch } from "./MessageSearch";
import type { FirebaseChatMessage, PendingMessage } from "../types/adminChat";

// ─── Single bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: FirebaseChatMessage }) {
  if (msg.sender === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-[10px] sm:text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-center max-w-xs">
          {msg.text}
        </span>
      </div>
    );
  }

  const isAdmin = msg.sender === "admin";

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[85%] sm:max-w-[78%]",
        isAdmin ? "ml-auto flex-row-reverse" : "",
      )}
    >
      <div
        className={cn(
          "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 self-end",
          isAdmin ? "bg-teal-700 text-white" : "bg-blue-100 text-blue-700",
        )}
      >
        {isAdmin ? "A" : "U"}
      </div>
      <div className="flex flex-col gap-0.5">
        <div
          className={cn(
            "px-3 py-2 text-[11px] sm:text-[12px] leading-relaxed rounded-xl",
            isAdmin
              ? "bg-teal-700 text-white rounded-tr-sm"
              : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm",
          )}
        >
          {msg.text}
        </div>
        <span
          className={cn(
            "text-[9px] sm:text-[10px] text-gray-400 px-0.5",
            isAdmin && "text-right",
          )}
        >
          {formatTs(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonBubble({ align }: { align: "left" | "right" }) {
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[60%]",
        align === "right" ? "ml-auto flex-row-reverse" : "",
      )}
    >
      <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 animate-pulse" />
      <div className="h-9 flex-1 rounded-xl bg-gray-200 animate-pulse" />
    </div>
  );
}

// ─── Room thread ──────────────────────────────────────────────────────────────

interface RoomThreadProps {
  messages: FirebaseChatMessage[];
  isLoading: boolean;
}

export function RoomThread({ messages, isLoading }: RoomThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleScrollToMessage = useCallback((messageId: string) => {
    const element = messageRefs.current[messageId];
    if (element && messagesContainerRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight effect
      element.classList.add("bg-yellow-100");
      setTimeout(() => element.classList.remove("bg-yellow-100"), 2000);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/60">
      {/* Message search bar */}
      <div className="flex-shrink-0 flex items-center justify-end border-b border-gray-200 bg-white min-h-[40px]">
        <MessageSearch
          messages={messages}
          onScrollToMessage={handleScrollToMessage}
        />
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {isLoading ? (
          <>
            <SkeletonBubble align="left" />
            <SkeletonBubble align="right" />
            <SkeletonBubble align="left" />
          </>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[12px] text-gray-400">Chưa có tin nhắn</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) messageRefs.current[msg.id] = el;
              }}
              className="transition-colors duration-200"
            >
              <Bubble msg={msg} />
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Admin reply bubble (reusable) ───────────────────────────────────────────

function AdminReplyBubble({ text, time }: { text: string; time?: string }) {
  return (
    <div className="flex gap-2 max-w-[85%] sm:max-w-[78%] ml-auto flex-row-reverse">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-teal-700 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 self-end">
        A
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="px-3 py-2 text-[11px] sm:text-[12px] leading-relaxed bg-teal-700 text-white rounded-xl rounded-tr-sm">
          {text}
        </div>
        {time && (
          <span className="text-[9px] sm:text-[10px] text-gray-400 px-0.5 text-right">
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Pending thread ───────────────────────────────────────────────────────────

interface PendingThreadProps {
  pending: PendingMessage;
  /** Additional replies sent this session (not yet persisted to the backend model) */
  extraReplies?: string[];
}

export function PendingThread({
  pending,
  extraReplies = [],
}: PendingThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pending.adminReply, extraReplies.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/60">
      {/* User message */}
      <div className="flex gap-2 max-w-[85%] sm:max-w-[78%]">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700 flex-shrink-0 self-end">
          U
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="px-3 py-2 text-[11px] sm:text-[12px] leading-relaxed bg-white border border-gray-200 text-gray-900 rounded-xl rounded-tl-sm">
            {pending.userMessage}
          </div>
          <span className="text-[9px] sm:text-[10px] text-gray-400 px-0.5">
            {formatIso(pending.createdAt)}
          </span>
        </div>
      </div>

      {/* First admin reply (from backend model) */}
      {pending.adminReply && (
        <AdminReplyBubble
          text={pending.adminReply}
          time={pending.repliedAt ? formatIso(pending.repliedAt) : undefined}
        />
      )}

      {/* Subsequent replies sent this session */}
      {extraReplies.map((r, i) => (
        <AdminReplyBubble key={i} text={r} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTs(ts: string | number): string {
  try {
    const d = new Date(typeof ts === "number" ? ts : ts);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatIso(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
