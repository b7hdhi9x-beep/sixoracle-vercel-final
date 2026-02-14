"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { oracles } from "@/lib/oracles";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-[rgba(212,175,55,0.15)] bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="font-[var(--font-cinzel)] text-xl text-[#d4af37] tracking-wider">
              六神ノ間
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/history"
              className="text-xs text-[#9ca3af] hover:text-[#d4af37] transition-colors hidden sm:inline"
            >
              鑑定履歴
            </Link>
            {user && (
              <span className="text-xs text-[#9ca3af] hidden md:inline">
                {user.email}
              </span>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-[rgba(212,175,55,0.3)] text-[#9ca3af] hover:text-[#d4af37] text-xs"
            >
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* メイン */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center space-y-3"
        >
          <h2 className="font-[var(--font-noto-serif-jp)] text-2xl md:text-3xl font-bold text-[#d4af37]">
            神託者を選ぶ
          </h2>
          <p className="text-sm text-[#9ca3af]">
            あなたの悩みに最適な占い師をお選びください
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {oracles.map((oracle, index) => (
            <motion.div
              key={oracle.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link href={`/dashboard/chat/${oracle.id}`}>
                <div className="glass-card rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.03] group h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="text-3xl w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${oracle.gradientFrom}, ${oracle.gradientTo})`,
                      }}
                    >
                      {oracle.icon}
                    </div>
                    <div>
                      <h3
                        className="font-[var(--font-noto-serif-jp)] text-lg font-bold"
                        style={{ color: oracle.color }}
                      >
                        {oracle.name}
                      </h3>
                      <p className="text-[10px] text-[#d4af37]/60">
                        {oracle.title}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">
                      {oracle.specialty}
                    </span>
                  </div>

                  <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-3 flex-1">
                    {oracle.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[rgba(212,175,55,0.1)]">
                    <span className="text-xs text-[#d4af37] group-hover:text-[#f4d03f] transition-colors flex items-center gap-1">
                      鑑定を始める
                      <svg
                        className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
