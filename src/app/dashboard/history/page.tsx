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
                  <Link
                    href={`/dashboard/chat/${session.oracleId}?session=${session.id}`}
                  >
                    <div className="glass-card rounded-lg p-4 hover:scale-[1.01] transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        {oracle && (
                          <div
                            className="text-xl w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${oracle.gradientFrom}, ${oracle.gradientTo})`,
                            }}
                          >
                            {oracle.icon}
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
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
