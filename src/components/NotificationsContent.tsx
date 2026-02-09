"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Check, CheckCheck, Loader2, Inbox } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsContent() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  const getToken = async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/notifications/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const token = await getToken();
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notification_id: id }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const token = await getToken();
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-serif">通知</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  {unreadCount}件未読
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
                <CheckCheck className="w-4 h-4" /> すべて既読
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {[
              { key: "all" as const, label: "すべて" },
              { key: "unread" as const, label: "未読のみ" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  filter === tab.key
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>通知はありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white/5 backdrop-blur-lg border rounded-2xl p-4 transition ${
                      notif.is_read ? "border-white/5" : "border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notif.is_read ? "bg-white/5" : "bg-amber-500/20"
                      }`}>
                        <Bell className={`w-5 h-5 ${notif.is_read ? "text-gray-500" : "text-amber-400"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${notif.is_read ? "text-gray-400" : "text-white"}`}>
                          {notif.title}
                        </h3>
                        <p className="text-sm text-gray-400">{notif.body}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.created_at).toLocaleDateString("ja-JP", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <button onClick={() => markAsRead(notif.id)} className="p-2 rounded-lg hover:bg-white/10 transition">
                          <Check className="w-4 h-4 text-amber-400" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
