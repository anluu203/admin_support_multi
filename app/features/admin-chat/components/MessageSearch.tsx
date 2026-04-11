"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import type { FirebaseChatMessage } from "../types/adminChat";

interface MessageSearchProps {
  messages: FirebaseChatMessage[];
  onScrollToMessage?: (messageId: string) => void;
}

export function MessageSearch({ messages, onScrollToMessage }: MessageSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter messages that match search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  const hasResults = filteredMessages.length > 0;
  const currentMatch = hasResults ? filteredMessages[currentIndex] : null;
  const totalMatches = filteredMessages.length;

  const handleNextMatch = useCallback(() => {
    if (!hasResults) return;
    const next = (currentIndex + 1) % totalMatches;
    setCurrentIndex(next);
    currentMatch && onScrollToMessage?.(filteredMessages[next].id);
  }, [currentIndex, filteredMessages, hasResults, onScrollToMessage, totalMatches, currentMatch]);

  const handlePrevMatch = useCallback(() => {
    if (!hasResults) return;
    const prev = currentIndex === 0 ? totalMatches - 1 : currentIndex - 1;
    setCurrentIndex(prev);
    onScrollToMessage?.(filteredMessages[prev].id);
  }, [currentIndex, filteredMessages, hasResults, onScrollToMessage, totalMatches]);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setCurrentIndex(0);
    setIsOpen(false);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        aria-label="Tìm kiếm tin nhắn"
        title="Tìm kiếm tin nhắn (Ctrl+F)"
      >
        <Search className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200 rounded-t">
      <div className="flex-1 flex items-center gap-1 bg-white border border-gray-200 rounded px-2">
        <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Tìm tin nhắn…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentIndex(0);
          }}
          autoFocus
          className="flex-1 py-1.5 text-[12px] bg-transparent outline-none min-w-0"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Match counter */}
      {searchQuery && (
        <span className="text-[11px] text-gray-500 whitespace-nowrap px-1 font-medium">
          {hasResults ? `${currentIndex + 1}/${totalMatches}` : "0 kết quả"}
        </span>
      )}

      {/* Navigation buttons */}
      {hasResults && (
        <>
          <button
            onClick={handlePrevMatch}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            aria-label="Kết quả trước"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMatch}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            aria-label="Kết quả tiếp"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
        aria-label="Đóng tìm kiếm"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
