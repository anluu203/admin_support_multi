"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn } from "@/app/lib/utils/cn";
import { Menu, X, Info } from "lucide-react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { ConversationList } from "./ConversationList";
import { RoomThread, PendingThread } from "./MessageThread";
import { ChatInputBar } from "./ChatInputBar";
import { useAdminPresence } from "../hooks/useAdminPresence";
import { useAdminChatRoom } from "../hooks/useAdminChatRoom";
import { useFirebaseChatList } from "../hooks/useFirebaseChatList";
import { adminChatApi } from "../api/adminChatApi";
import {
  mapFirebaseRoom,
  type AdminChatSession,
  type ActiveConv,
  type FirebaseChatMessage,
  type PendingMessage,
} from "../types/adminChat";
import Link from "next/link";

// ─── Admin info (client-only) ─────────────────────────────────────────────────

interface AdminInfo {
  id: string;
  displayName: string;
}

const FALLBACK_ADMIN: AdminInfo = { id: "admin_local", displayName: "Admin" };

function readAdminFromStorage(): AdminInfo {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw) as {
        id?: string | number;
        username?: string;
        fullName?: string;
      };
      return {
        id: String(u.id ?? "admin_local"),
        displayName: u.fullName ?? u.username ?? "Admin",
      };
    }
  } catch {
    /* ignore */
  }
  return FALLBACK_ADMIN;
}

// ─── Chat header ──────────────────────────────────────────────────────────────

function ChatHeader({
  active,
  onClose,
}: {
  active: ActiveConv;
  onClose: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  // Reset confirm state whenever the active conversation changes
  useEffect(() => { setConfirming(false); }, [active]);

  if (!active) {
    return (
      <div className="h-14 border-b border-gray-200 bg-white flex items-center px-5 flex-shrink-0">
        <ChatBubbleIcon className="w-4 h-4 text-gray-300 mr-2" />
        <span className="text-[13px] text-gray-400">
          Chọn một hội thoại để bắt đầu
        </span>
      </div>
    );
  }

  const isRoom = active.kind === "room";
  const name = isRoom
    ? active.session.displayName
    : (active.pending.userName ?? "Khách");
  const sub = isRoom
    ? `Chat #${active.session.chatId.slice(-8)}`
    : `Tin nhắn offline · ${active.pending.createdAt ? new Date(active.pending.createdAt).toLocaleString("vi-VN") : ""}`;

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center gap-3 px-4 flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
        {name
          .split(" ")
          .map((w) => w[0])
          .slice(-2)
          .join("")
          .toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">
          {name}
        </p>
        <p className="text-[11px] text-gray-400 truncate">{sub}</p>
      </div>

      {isRoom ? (
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 flex-shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Realtime
        </span>
      ) : (
        <span
          className={cn(
            "text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0",
            active.pending.status === "Replied"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700",
          )}
        >
          {active.pending.status === "Replied"
            ? "Đã phản hồi"
            : "Offline queue"}
        </span>
      )}

      {confirming ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-red-600 font-semibold">Kết thúc hội thoại?</span>
          <button
            onClick={() => { setConfirming(false); onClose(); }}
            className="text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            Xác nhận
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-[11px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="text-[11px] font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
        >
          Kết thúc
        </button>
      )}
    </div>
  );
}

// ─── Right info panel ─────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  "Bạn cần hỗ trợ thêm không ạ?",
  "Admin sẽ liên hệ lại sớm nhất.",
  "Vui lòng để lại số điện thoại.",
  "Cảm ơn bạn đã liên hệ với chúng tôi!",
];

function InfoPanel({
  active,
  onQuickReply,
}: {
  active: ActiveConv;
  onQuickReply: (text: string) => void;
}) {
  if (!active) return null;

  const rows: [string, string][] =
    active.kind === "room"
      ? [
          ["Chat ID", active.session.chatId.slice(-10)],
          ["User ID", active.session.userId.slice(-10)],
          ["Câu hỏi đầu", active.session.userQuestion || "—"],
          [
            "Thời gian",
            new Date(active.session.createdAt).toLocaleString("vi-VN"),
          ],
        ]
      : [
          ["Session", active.pending.sessionId.slice(-10)],
          ["Trạng thái", active.pending.status],
          [
            "Thời gian",
            active.pending.createdAt
              ? new Date(active.pending.createdAt).toLocaleString("vi-VN")
              : "—",
          ],
        ];

  return (
    <div className="w-52 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0 flex flex-col">
      {/* Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Thông tin
        </p>
        <div className="space-y-2.5">
          {rows.map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] text-gray-400">{k}</p>
              <p className="text-[11px] font-semibold text-gray-800 break-all leading-snug">
                {v}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick replies */}
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Trả lời nhanh
        </p>
        {QUICK_REPLIES.map((r) => (
          <button
            key={r}
            onClick={() => onQuickReply(r)}
            className="w-full text-left text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 mb-1.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors leading-snug"
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Empty panel ──────────────────────────────────────────────────────────────

function EmptyPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/60 gap-3 select-none">
      <ChatBubbleIcon className="w-14 h-14 text-gray-200" />
      <p className="text-[13px] text-gray-400 font-medium">
        Chọn một hội thoại
      </p>
      <p className="text-[11px] text-gray-300 text-center max-w-xs">
        Realtime chats xuất hiện khi AI không trả lời được và admin đang online.
        Pending queue là tin nhắn khi admin offline.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function LiveChatPage() {
  // ── Mobile detection ──────────────────────────────────────────────────────
  const isMobile = useIsMobile();
  const [showMobileConvList, setShowMobileConvList] = useState(false);
  const [showMobileInfoPanel, setShowMobileInfoPanel] = useState(false);

  // ── Defer localStorage to client ──────────────────────────────────────
  const [admin, setAdmin] = useState<AdminInfo>(FALLBACK_ADMIN);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAdmin(readAdminFromStorage());
    setMounted(true);
  }, []);

  // ── Firebase: list of open chat rooms ─────────────────────────────────
  const { rooms: firebaseRooms, isLoading: isLoadingRooms } =
    useFirebaseChatList(mounted);
  const sessions = useMemo(
    () => firebaseRooms.map(mapFirebaseRoom),
    [firebaseRooms],
  );

  // ── REST: pending messages ─────────────────────────────────────────────
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  const loadPending = useCallback(async () => {
    setIsLoadingPending(true);
    const [res, cnt] = await Promise.all([
      adminChatApi.getPendingMessages({ status: "Pending", pageSize: 50 }),
      adminChatApi.getPendingCount(),
    ]);
    if (res.isSuccess) {
      const fresh = Array.isArray(res.data) ? res.data : [];
      // Merge: keep non-Pending messages already in state (e.g. Replied ones that
      // admin is still viewing) so the sidebar doesn't lose them between polls.
      setPendingMessages((prev) => {
        const kept = prev.filter((p) => p.status !== "Pending");
        const merged = [...fresh];
        kept.forEach((k) => {
          if (!merged.some((m) => m.id === k.id)) merged.push(k);
        });
        return merged;
      });
    }
    if (cnt.isSuccess) setPendingCount(cnt.data.count);
    setIsLoadingPending(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadPending();
    const iv = setInterval(loadPending, 30_000);
    return () => clearInterval(iv);
  }, [mounted, loadPending]);

  // ── Admin presence ─────────────────────────────────────────────────────
  useAdminPresence({
    adminId: admin.id,
    displayName: admin.displayName,
    enabled: mounted,
  });

  // ── Active conversation ────────────────────────────────────────────────
  const [active, setActive] = useState<ActiveConv>(null);
  const [roomMsgs, setRoomMsgs] = useState<FirebaseChatMessage[]>([]);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);

  // Cache messages per room so they persist when switching conversations
  const roomMessagesCache = useRef<Record<string, FirebaseChatMessage[]>>({});
  const seenIdsCache = useRef<Record<string, Set<string>>>({});

  // Subsequent admin replies for pending messages (beyond the first).
  // The backend model only stores one adminReply; extra replies are kept
  // in local session state so the thread shows the full conversation.
  const [pendingExtraReplies, setPendingExtraReplies] = useState<
    Record<string, string[]>
  >({});

  // Quick-reply pre-fill
  const [prefilledText, setPrefilledText] = useState("");

  const activeChatId = active?.kind === "room" ? active.session.chatId : null;

  // ── Firebase messages for open room ───────────────────────────────────
  const { sendMessage: sendFirebaseMsg } = useAdminChatRoom({
    chatRoomId: activeChatId,
    onMessage: useCallback((msg: FirebaseChatMessage) => {
      if (!activeChatId) return;

      // Ensure cache entry exists
      if (!seenIdsCache.current[activeChatId]) {
        seenIdsCache.current[activeChatId] = new Set();
      }

      // Skip duplicate messages
      if (seenIdsCache.current[activeChatId].has(msg.id)) return;
      seenIdsCache.current[activeChatId].add(msg.id);

      // Update cache
      if (!roomMessagesCache.current[activeChatId]) {
        roomMessagesCache.current[activeChatId] = [];
      }
      roomMessagesCache.current[activeChatId].push(msg);

      // Update display
      setRoomMsgs((prev) => [...prev, msg]);
    }, [activeChatId]),
  });

  // ── Handlers ───────────────────────────────────────────────────────────

  const selectRoom = useCallback((session: AdminChatSession) => {
    const chatId = session.chatId;

    // Restore cached messages for this room, or empty if first load
    const cached = roomMessagesCache.current[chatId] ?? [];
    setRoomMsgs(cached);

    // Restore seenIds cache from the cached messages
    // This prevents Firebase listener from re-emitting them as duplicates
    if (!seenIdsCache.current[chatId]) {
      seenIdsCache.current[chatId] = new Set(cached.map((m) => m.id));
    }

    setActive({ kind: "room", session });
    setIsLoadingMsgs(false);
    setPrefilledText("");
  }, []);

  const selectPending = useCallback((pending: PendingMessage) => {
    setActive({ kind: "pending", pending });
    setRoomMsgs([]); // Pending messages don't use Firebase, clear display
    setPrefilledText("");
  }, []);

  const handleClose = async () => {
    if (active?.kind === "room") {
      await adminChatApi.closeFirebaseRoom(active.session.chatId);
    }
    setActive(null);
    // Keep room messages in cache for later viewing
  };

  const handleSend = async (text: string) => {
    if (!active || !text.trim()) return;

    if (active.kind === "room") {
      // Write directly to Firebase for instant delivery.
      // The REST API call is intentionally removed: it's documented as optional
      // ("Admin có thể gửi trực tiếp qua Firebase SDK") and causes duplicate
      // messages when the backend also writes to Firebase with a different key.
      await sendFirebaseMsg(text, admin.id);
    } else {
      const result = await adminChatApi.replyPending(active.pending.id, text);
      if (!result.isSuccess) return; // Don't update UI if API failed

      if (!active.pending.adminReply) {
        // First reply: update the pending record's adminReply field
        const updated = {
          ...active.pending,
          adminReply: text,
          status: "Replied" as const,
          repliedAt: new Date().toISOString(),
        };
        setActive({ kind: "pending", pending: updated });
        setPendingMessages((prev) =>
          prev.map((p) => (p.id === active.pending.id ? updated : p)),
        );
      } else {
        // Subsequent replies: accumulate in local session state so the thread
        // shows the full back-and-forth without needing a backend model change.
        setPendingExtraReplies((prev) => ({
          ...prev,
          [active.pending.id]: [...(prev[active.pending.id] ?? []), text],
        }));
      }
    }
  };

  const activeKey =
    active?.kind === "room"
      ? `r:${active.session.chatId}`
      : active?.kind === "pending"
        ? `p:${active.pending.id}`
        : null;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ── DESKTOP SIDEBAR (hidden on md, visible on lg+) ─────────────────── */}
      <div className="hidden md:flex w-[260px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ChatBubbleIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900 leading-tight">
                Live Chat
              </p>
              <p className="text-[10px] text-gray-400">Hội thoại khách hàng</p>
            </div>
          </div>

          {/* Online badge — only renders after mount to avoid hydration mismatch */}
          {mounted && (
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold text-green-700 truncate">
                {admin.displayName}
              </span>
              <span className="text-[10px] text-green-500 ml-auto flex-shrink-0">
                Online
              </span>
            </div>
          )}
        </div>

        <ConversationList
          sessions={sessions}
          pendingMessages={pendingMessages}
          activeKey={activeKey}
          pendingCount={pendingCount}
          isLoadingRooms={isLoadingRooms}
          isLoadingPending={isLoadingPending}
          onSelectSession={selectRoom}
          onSelectPending={selectPending}
        />
      </div>

      {/* ── MAIN AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header with mobile buttons */}
        <ChatHeader active={active} onClose={handleClose} />

        {/* Mobile hamburger & info buttons - visible only on mobile */}
        {isMobile && (
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white">
            <button
              onClick={() => setShowMobileConvList(!showMobileConvList)}
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
              aria-label="Show conversations"
              title="Conversations"
            >
              <Menu className="w-5 h-5" />
            </button>
            {active && (
              <button
                onClick={() => setShowMobileInfoPanel(!showMobileInfoPanel)}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                aria-label="Show info panel"
                title="Info"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1" /> {/* Spacer */}
          </div>
        )}

        {!active ? (
          <EmptyPanel />
        ) : (
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Thread + Input */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {active.kind === "room" ? (
                <RoomThread messages={roomMsgs} isLoading={isLoadingMsgs} />
              ) : (
                <PendingThread
                  pending={active.pending}
                  extraReplies={pendingExtraReplies[active.pending.id] ?? []}
                />
              )}

              <ChatInputBar
                mode={active.kind === "room" ? "firebase" : "pending"}
                alreadyReplied={
                  active.kind === "pending" &&
                  active.pending.status === "Replied"
                }
                onSend={handleSend}
                prefilledText={prefilledText}
                onPrefilledConsumed={() => setPrefilledText("")}
                placeholder={
                  active.kind === "room"
                    ? "Nhập tin nhắn cho khách…  (Enter gửi · Shift+Enter xuống dòng)"
                    : "Nhập phản hồi cho tin nhắn offline…"
                }
              />
            </div>

            {/* Info panel - hidden on small screens (md:hidden = hidden on md-, shown on lg+) */}
            <div className="hidden lg:flex w-52 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0 flex flex-col">
              <InfoPanel active={active} onQuickReply={setPrefilledText} />
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE OVERLAY: Conversations Drawer ──────────────────────────── */}
      {isMobile && showMobileConvList && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowMobileConvList(false)}
            aria-hidden
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 flex flex-col shadow-lg">
            {/* Close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <span className="text-[13px] font-bold text-gray-900">Conversations</span>
              <button
                onClick={() => setShowMobileConvList(false)}
                className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-hidden">
              <ConversationList
                sessions={sessions}
                pendingMessages={pendingMessages}
                activeKey={activeKey}
                pendingCount={pendingCount}
                isLoadingRooms={isLoadingRooms}
                isLoadingPending={isLoadingPending}
                onSelectSession={(s) => {
                  selectRoom(s);
                  setShowMobileConvList(false); // Auto-close on selection
                }}
                onSelectPending={(p) => {
                  selectPending(p);
                  setShowMobileConvList(false); // Auto-close on selection
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* ── MOBILE OVERLAY: Info Panel Drawer ────────────────────────────── */}
      {isMobile && showMobileInfoPanel && active && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowMobileInfoPanel(false)}
            aria-hidden
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-72 bg-white border-l border-gray-200 z-50 flex flex-col shadow-lg">
            {/* Close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <span className="text-[13px] font-bold text-gray-900">Details</span>
              <button
                onClick={() => setShowMobileInfoPanel(false)}
                className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <InfoPanel active={active} onQuickReply={setPrefilledText} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
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
