"use client";

import { useState, useMemo } from "react";
import { cn } from "@/app/lib/utils/cn";
import type { AdminChatSession, PendingMessage } from "../types/adminChat";
import { Search, X } from "lucide-react";

type TabKey = "all" | "realtime" | "pending" | "closed";

// ─── Room item (Firebase realtime) ────────────────────────────────────────────

function RoomItem({
  session,
  isActive,
  onClick,
}: {
  session: AdminChatSession;
  isActive: boolean;
  onClick: () => void;
}) {
  const initials = session.displayName
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-2.5 px-3 py-2.5 border-b border-gray-100 transition-colors",
        isActive ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-gray-50"
      )}
    >
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0 mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[12px] font-semibold text-gray-900 truncate">{session.displayName}</span>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{relTime(session.createdAt)}</span>
        </div>
        <p className="text-[11px] text-gray-500 truncate leading-tight">{session.userQuestion}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
            Realtime
          </span>
          {session.unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {session.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Pending item ─────────────────────────────────────────────────────────────

function PendingItem({
  pending,
  isActive,
  onClick,
}: {
  pending: PendingMessage;
  isActive: boolean;
  onClick: () => void;
}) {
  const name = pending.userName ?? `Khách #${pending.sessionId.slice(-5)}`;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-2.5 px-3 py-2.5 border-b border-gray-100 transition-colors",
        isActive ? "bg-amber-50 border-l-2 border-l-amber-500" : "hover:bg-gray-50"
      )}
    >
      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0 mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[12px] font-semibold text-gray-900 truncate">{name}</span>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{relTimeIso(pending.createdAt)}</span>
        </div>
        <p className="text-[11px] text-gray-500 truncate leading-tight">{pending.userMessage}</p>
        <div className="mt-1">
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
            pending.status === "Replied"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          )}>
            {pending.status === "Replied" ? "Đã phản hồi" : "Chờ phản hồi"}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface ConversationListProps {
  sessions: AdminChatSession[];
  pendingMessages: PendingMessage[];
  activeKey: string | null;
  pendingCount: number;
  isLoadingRooms: boolean;
  isLoadingPending: boolean;
  onSelectSession: (session: AdminChatSession) => void;
  onSelectPending: (pending: PendingMessage) => void;
}

export function ConversationList({
  sessions,
  pendingMessages,
  activeKey,
  pendingCount,
  isLoadingRooms,
  isLoadingPending,
  onSelectSession,
  onSelectPending,
}: ConversationListProps) {
  const [tab, setTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sessions and pending messages by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) =>
      s.displayName.toLowerCase().includes(q) ||
      s.userQuestion.toLowerCase().includes(q) ||
      s.chatId.toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingMessages;
    const q = searchQuery.toLowerCase();
    return pendingMessages.filter((p) =>
      (p.userName ?? "").toLowerCase().includes(q) ||
      p.userMessage.toLowerCase().includes(q) ||
      p.sessionId.toLowerCase().includes(q)
    );
  }, [pendingMessages, searchQuery]);

  const visibleSessions = tab === "pending" ? [] : filteredSessions;
  const visiblePending = tab === "realtime" ? [] : filteredPending;
  const isEmpty = visibleSessions.length === 0 && visiblePending.length === 0;

  // Only show skeleton on INITIAL load (no data yet).
  // Do NOT replace loaded content with skeleton on subsequent refreshes —
  // loadPending polls every 30s and would flash the whole list to skeleton
  // every interval while isLoadingPending is briefly true.
  const hasAnyData = sessions.length > 0 || pendingMessages.length > 0;
  const isInitialLoading =
    !hasAnyData &&
    ((tab !== "pending" && isLoadingRooms) || (tab !== "realtime" && isLoadingPending));

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "Tất cả", count: sessions.length + pendingCount || undefined },
    { key: "realtime", label: "Realtime", count: sessions.length || undefined },
    { key: "pending", label: "Chờ phản hồi", count: pendingCount || undefined },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search bar */}
      <div className="px-2 py-2 flex-shrink-0 bg-gray-50 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm hội thoại…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-[12px] bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 py-2 text-[11px] font-semibold transition-colors relative",
              tab === t.key
                ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t.label}
            {!!t.count && (
              <span className={cn(
                "ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                tab === t.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {isInitialLoading ? (
          <LoadingSkeleton />
        ) : isEmpty ? (
          <EmptyState tab={tab} />
        ) : (
          <>
            {visibleSessions.map((s) => (
              <RoomItem
                key={s.chatId}
                session={s}
                isActive={activeKey === `r:${s.chatId}`}
                onClick={() => onSelectSession(s)}
              />
            ))}
            {visiblePending.map((p) => (
              <PendingItem
                key={p.id}
                pending={p}
                isActive={activeKey === `p:${p.id}`}
                onClick={() => onSelectPending(p)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="px-3 py-2 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-2 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const msgs: Record<TabKey, string> = {
    all: "Không có hội thoại nào",
    realtime: "Không có chat realtime",
    pending: "Không có tin nhắn chờ",
    closed: "Không có hội thoại đã đóng",
  };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
      <p className="text-[12px] text-gray-400">{msgs[tab]}</p>
      {tab === "realtime" && (
        <p className="text-[10px] text-gray-300">Chat xuất hiện khi AI fallback sang Human</p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "vừa xong";
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ`;
  return new Date(ts).toLocaleDateString("vi-VN");
}

function relTimeIso(iso: string): string {
  try {
    return relTime(new Date(iso).getTime());
  } catch {
    return "";
  }
}
