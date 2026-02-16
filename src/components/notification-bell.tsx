"use client";

import { useEffect, useState, useRef } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  link?: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
        if (typeof data.unreadCount === "number")
          setUnreadCount(data.unreadCount);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  const typeIcon: Record<string, string> = {
    INFO: "ℹ️",
    WARNING: "⚠️",
    SUCCESS: "✅",
    FORTUNE: "🔮",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[#9ca3af] hover:text-[#d4af37] transition-colors"
        aria-label="通知"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto glass-card rounded-xl border border-[rgba(212,175,55,0.2)] shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(212,175,55,0.1)]">
            <h3 className="text-sm font-bold text-[#d4af37]">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-[#9ca3af] hover:text-[#d4af37] transition-colors"
              >
                すべて既読
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-[#9ca3af] text-center py-8">
              通知はありません
            </p>
          ) : (
            <div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-[rgba(255,255,255,0.03)] ${
                    !n.read ? "bg-[rgba(212,175,55,0.05)]" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">
                      {typeIcon[n.type] || "ℹ️"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">{n.title}</p>
                      <p className="text-[11px] text-[#9ca3af] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-[#9ca3af]/50 mt-1">
                        {new Date(n.createdAt).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-[#d4af37] rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
