"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getOracleById } from "@/lib/oracles";

interface SessionSummary {
  id: string;
  oracleId: string;
  title: string | null;
  updatedAt: string;
  messages: { content: string }[];
  _count: { messages: number };
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleExport(sessionId: string, format: "txt" | "csv") {
    window.open(`/api/export/${sessionId}?format=${format}`, "_blank");
  }

  async function handleShare(sessionId: string) {
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.shareToken) {
        const url = `${window.location.origin}/shared/${data.shareToken}`;
        await navigator.clipboard.writeText(url);
        alert("共有リンクをコピーしました（30日間有効）");
      }
    } catch {
      alert("共有リンクの生成に失敗しました");
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[rgba(212,175,55,0.15)] bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-[#9ca3af] hover:text-[#d4af37] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-[var(--font-noto-serif-jp)] text-lg text-[#d4af37]">
              鑑定履歴
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-[#9ca3af]">まだ鑑定履歴がありません</p>
            <Link href="/dashboard">
              <span className="text-[#d4af37] hover:text-[#f4d03f] underline text-sm">
                占い師を選んで鑑定を始める
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const oracle = getOracleById(session.oracleId);
              const lastMessage = session.messages[0]?.content ?? "";
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="glass-card rounded-lg p-4 hover:scale-[1.01] transition-all">
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/dashboard/chat/${session.oracleId}?session=${session.id}`}
                        className="flex items-start gap-3 flex-1 min-w-0"
                      >
                        {oracle && (
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-1 ring-[rgba(212,175,55,0.2)]">
                            <img
                              src={oracle.image}
                              alt={oracle.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className="font-bold text-sm truncate"
                              style={{ color: oracle?.color ?? "#d4af37" }}
                            >
                              {oracle?.name ?? session.oracleId}
                            </h3>
                            <span className="text-[10px] text-[#9ca3af] shrink-0">
                              {new Date(session.updatedAt).toLocaleDateString(
                                "ja-JP",
                                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-[#9ca3af] mt-1 truncate">
                            {session.title ?? lastMessage}
                          </p>
                          <p className="text-[10px] text-[#9ca3af]/50 mt-1">
                            {session._count.messages}件のメッセージ
                          </p>
                        </div>
                      </Link>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleShare(session.id)}
                          className="text-[#9ca3af] hover:text-[#d4af37] transition-colors p-1.5"
                          title="共有"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleExport(session.id, "txt")}
                          className="text-[#9ca3af] hover:text-[#d4af37] transition-colors p-1.5"
                          title="テキストで保存"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
