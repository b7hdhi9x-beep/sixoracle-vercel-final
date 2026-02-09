"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { oracles, getOracleById } from "@/lib/oracles";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pin, Archive, Trash2, MessageSquare, Loader2, Search, Filter } from "lucide-react";

interface SessionItem {
  id: string;
  oracle_id: string;
  title: string;
  message_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function HistoryContent() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pinned" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isAuthenticated) fetchSessions();
  }, [isAuthenticated]);

  const getToken = async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/sessions/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (sessionId: string, pinned: boolean) => {
    const token = await getToken();
    await fetch("/api/sessions/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ session_id: sessionId, is_pinned: !pinned }),
    });
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, is_pinned: !pinned } : s));
  };

  const handleArchive = async (sessionId: string) => {
    const token = await getToken();
    await fetch("/api/sessions/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ session_id: sessionId, is_archived: true }),
    });
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, is_archived: true } : s));
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("このセッションを削除しますか？")) return;
    const token = await getToken();
    await fetch("/api/sessions/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ session_id: sessionId }),
    });
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === "pinned") return s.is_pinned;
    if (filter === "archived") return s.is_archived;
    return !s.is_archived;
  }).filter((s) => {
    if (!searchQuery) return true;
    const oracle = getOracleById(s.oracle_id);
    return s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oracle?.name.includes(searchQuery);
  });

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
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-serif">鑑定履歴</h1>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="セッションを検索..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: "all" as const, label: "すべて" },
              { key: "pinned" as const, label: "ピン留め" },
              { key: "archived" as const, label: "アーカイブ" },
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

          {/* Sessions List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>鑑定履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredSessions.map((session) => {
                  const oracle = getOracleById(session.oracle_id);
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 hover:border-amber-500/30 transition cursor-pointer"
                      onClick={() => router.push(`/reading-history?session_id=${session.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${oracle?.color || "from-gray-500 to-gray-600"} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-lg">{oracle?.name?.[0] || "?"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{session.title || "無題のセッション"}</h3>
                            {session.is_pinned && <Pin className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                          </div>
                          <p className="text-sm text-gray-400">{oracle?.name || "不明"} · {session.message_count}メッセージ</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(session.updated_at || session.created_at).toLocaleDateString("ja-JP")}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handlePin(session.id, session.is_pinned)} className="p-2 rounded-lg hover:bg-white/10 transition">
                            <Pin className={`w-4 h-4 ${session.is_pinned ? "text-amber-400" : "text-gray-500"}`} />
                          </button>
                          <button onClick={() => handleArchive(session.id)} className="p-2 rounded-lg hover:bg-white/10 transition">
                            <Archive className="w-4 h-4 text-gray-500" />
                          </button>
                          <button onClick={() => handleDelete(session.id)} className="p-2 rounded-lg hover:bg-white/10 transition">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
