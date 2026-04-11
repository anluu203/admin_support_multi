"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/app/utils/cn";

interface ChatInputBarProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  mode: "firebase" | "pending" | "none";
  alreadyReplied?: boolean;
  /** Pre-fill the input (e.g., from quick reply) */
  prefilledText?: string;
  onPrefilledConsumed?: () => void;
}

export function ChatInputBar({
  onSend,
  disabled,
  placeholder,
  mode,
  alreadyReplied,
  prefilledText,
  onPrefilledConsumed,
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply pre-filled text from quick replies
  useEffect(() => {
    if (prefilledText) {
      setText(prefilledText);
      onPrefilledConsumed?.();
      textareaRef.current?.focus();
    }
  }, [prefilledText, onPrefilledConsumed]);

  const canSend = text.trim().length > 0 && !disabled && !isSending;

  const handleSend = async () => {
    if (!canSend) return;
    const msg = text.trim();
    setText("");
    setIsSending(true);
    try {
      await onSend(msg);
    } finally {
      setIsSending(false);
      // Defer focus until after React re-enables the textarea (disabled → enabled
      // happens in the next render cycle triggered by setIsSending(false)).
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modeBannerText =
    mode === "pending" && alreadyReplied
      ? "Đã phản hồi · tiếp tục nhắn để gửi thêm"
      : mode === "pending"
      ? "Offline queue · khách sẽ nhận khi online"
      : null;

  return (
    <div className="border-t border-gray-200 bg-white">
      {modeBannerText && (
        <div className={cn(
          "px-4 py-1.5 text-[10px] font-semibold border-b border-gray-100",
          mode === "firebase"
            ? "text-blue-600 bg-blue-50/60"
            : alreadyReplied
            ? "text-green-700 bg-green-50/60"
            : "text-amber-600 bg-amber-50/60"
        )}>
          {modeBannerText}
        </div>
      )}
      <div className="flex items-end gap-2 px-3 py-2.5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={placeholder ?? "Nhập tin nhắn…"}
          disabled={disabled || isSending}
          className={cn(
            "flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-900",
            "outline-none focus:border-blue-500 font-[inherit] leading-relaxed",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border-0",
            canSend
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-200 cursor-not-allowed"
          )}
          aria-label="Gửi"
        >
          {isSending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendIcon className={cn("w-4 h-4", canSend ? "text-white" : "text-gray-400")} />
          )}
        </button>
      </div>
      <p className="px-4 pb-2 text-[10px] text-gray-400">Enter gửi · Shift+Enter xuống dòng</p>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
