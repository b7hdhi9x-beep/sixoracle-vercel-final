"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { oracles } from "@/lib/oracles";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { FavoriteButton } from "@/components/favorite-button";
import { InstallPrompt } from "@/components/install-prompt";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase.auth]);

  useEffect(() => {
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFavoriteIds(data);
      })
      .catch(console.error);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleFavoriteToggle(oracleId: string, favorited: boolean) {
    setFavoriteIds((prev) =>
      favorited ? [...prev, oracleId] : prev.filter((id) => id !== oracleId)
    );
  }

  // Sort: favorites first, then original order
  const sortedOracles = [...oracles].sort((a, b) => {
    const aFav = favoriteIds.includes(a.id) ? 0 : 1;
    const bFav = favoriteIds.includes(b.id) ? 0 : 1;
    return aFav - bFav;
  });

  const displayOracles = showFavoritesOnly
    ? sortedOracles.filter((o) => favoriteIds.includes(o.id))
    : sortedOracles;

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-[rgba(212,175,55,0.15)] bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228451672/wWPMmymhqoNMwmyZ.webp"
              alt="六神ノ間"
              className="w-8 h-8"
              loading="eager"
            />
            <h1 className="font-[var(--font-cinzel)] text-xl text-[#d4af37] tracking-wider">
              六神ノ間
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/history"
              className="text-xs text-[#9ca3af] hover:text-[#d4af37] transition-colors hidden sm:inline px-2"
            >
              鑑定履歴
            </Link>
            <NotificationBell />
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
          {/* フィルター */}
          {favoriteIds.length > 0 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  !showFavoritesOnly
                    ? "border-[#d4af37] text-[#d4af37]"
                    : "border-[rgba(212,175,55,0.2)] text-[#9ca3af] hover:text-[#d4af37]"
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setShowFavoritesOnly(true)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  showFavoritesOnly
                    ? "border-[#d4af37] text-[#d4af37]"
                    : "border-[rgba(212,175,55,0.2)] text-[#9ca3af] hover:text-[#d4af37]"
                }`}
              >
                お気に入り
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayOracles.map((oracle, index) => (
            <motion.div
              key={oracle.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <Link href={`/dashboard/chat/${oracle.id}`}>
                <div className="glass-card rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.03] group h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full shrink-0 shadow-lg overflow-hidden ring-2 ring-[rgba(212,175,55,0.3)]">
                      <img
                        src={oracle.image}
                        alt={oracle.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
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
                    <FavoriteButton
                      oracleId={oracle.id}
                      initialFavorited={favoriteIds.includes(oracle.id)}
                      onToggle={handleFavoriteToggle}
                    />
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

      <InstallPrompt />
    </div>
  );
}
