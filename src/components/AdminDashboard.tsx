"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { oracles, getOracleById } from "@/lib/oracles";
import { getSessions, ChatSession } from "@/lib/chatStorage";
import { motion } from "framer-motion";
import {
  Shield, Home, Moon, Users, BarChart3, MessageSquare,
  ArrowRight, ArrowLeft, Crown, Clock, Heart, Calculator,
  Lightbulb, Star, Hand, Droplet, Cat, Brain,
  Sparkles, Eye, Trash2, Search, RefreshCw,
  TrendingUp, Activity, Calendar,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain,
};

type AdminTab = "overview" | "sessions" | "users";

interface StoredUser {
  phone: string;
  isPremium: boolean;
  isAdmin: boolean;
  nickname?: string;
  createdAt: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSessions(getSessions());
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
    const oracleUsage: Record<string, number> = {};
    sessions.forEach(s => {
      oracleUsage[s.oracleId] = (oracleUsage[s.oracleId] || 0) + 1;
    });

    // Sessions by date (last 7 days)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * dayMs;
      const dayEnd = dayStart + dayMs;
      const count = sessions.filter(s => s.createdAt >= dayStart && s.createdAt < dayEnd).length;
      const date = new Date(dayStart);
      return {
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        count,
      };
    });

    // Top oracles
    const topOracles = Object.entries(oracleUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({
        oracle: getOracleById(id),
        count,
      }));

    // Today's sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => s.createdAt >= todayStart.getTime()).length;

    return { totalSessions, totalMessages, oracleUsage, last7Days, topOracles, todaySessions };
  }, [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.oracleId.toLowerCase().includes(q) ||
      s.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">アクセス拒否</h1>
          <p className="text-gray-400 mb-6">管理者権限が必要です</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mystical-bg">
      {/* Admin Header */}
      <header className="border-b border-red-900/30 bg-black/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h1 className="text-lg font-bold text-white">管理者ダッシュボード</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title="データを更新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
              ADMIN
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800/50 bg-black/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: "overview" as AdminTab, label: "概要", icon: BarChart3 },
              { id: "sessions" as AdminTab, label: "鑑定履歴", icon: MessageSquare },
              { id: "users" as AdminTab, label: "ユーザー情報", icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-red-400 text-red-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <OverviewTab stats={stats} />
        )}
        {activeTab === "sessions" && (
          <SessionsTab
            sessions={filteredSessions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedSession={selectedSession}
            setSelectedSession={setSelectedSession}
          />
        )}
        {activeTab === "users" && (
          <UsersTab />
        )}
      </main>
    </div>
  );
}

// ============ Overview Tab ============
function OverviewTab({ stats }: { stats: any }) {
  const maxCount = Math.max(...stats.last7Days.map((d: any) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "総セッション数", value: stats.totalSessions, icon: MessageSquare, color: "text-blue-400" },
          { label: "総メッセージ数", value: stats.totalMessages, icon: Activity, color: "text-green-400" },
          { label: "本日のセッション", value: stats.todaySessions, icon: Calendar, color: "text-amber-400" },
          { label: "利用占い師数", value: Object.keys(stats.oracleUsage).length, icon: Users, color: "text-purple-400" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-gray-400">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart (Simple bar chart) */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          過去7日間のアクティビティ
        </h3>
        <div className="flex items-end gap-2 h-40">
          {stats.last7Days.map((day: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{day.count}</span>
              <div
                className="w-full bg-gradient-to-t from-blue-500/80 to-blue-400/40 rounded-t-md transition-all duration-500"
                style={{ height: `${Math.max((day.count / maxCount) * 100, 4)}%` }}
              />
              <span className="text-[10px] text-gray-500">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Oracles */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          人気占い師ランキング
        </h3>
        <div className="space-y-3">
          {stats.topOracles.map((item: any, i: number) => {
            if (!item.oracle) return null;
            const Icon = iconMap[item.oracle.icon];
            const percentage = stats.totalSessions > 0
              ? Math.round((item.count / stats.totalSessions) * 100)
              : 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-6">{i + 1}</span>
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.oracle.color} flex items-center justify-center overflow-hidden`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.oracle.image} alt={item.oracle.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate">{item.oracle.name}</span>
                    <span className="text-xs text-gray-400">{item.count}回 ({percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {stats.topOracles.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">まだデータがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Sessions Tab ============
function SessionsTab({
  sessions,
  searchQuery,
  setSearchQuery,
  selectedSession,
  setSelectedSession,
}: {
  sessions: ChatSession[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedSession: ChatSession | null;
  setSelectedSession: (s: ChatSession | null) => void;
}) {
  if (selectedSession) {
    const oracle = getOracleById(selectedSession.oracleId);
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">一覧に戻る</span>
        </button>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            {oracle && (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle.color} overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={oracle.image} alt={oracle.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-white font-semibold">{selectedSession.title}</h3>
              <p className="text-xs text-gray-400">
                {oracle?.name} · {new Date(selectedSession.createdAt).toLocaleString("ja-JP")}
                · {selectedSession.messages.length}メッセージ
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {selectedSession.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-blue-500/20 text-blue-100 border border-blue-500/30"
                    : "bg-gray-800/50 text-gray-200 border border-gray-700/50"
                }`}>
                  {msg.role === "assistant" && oracle && (
                    <p className="text-xs text-gold/60 mb-1">{oracle.name}</p>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-gray-500 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="セッションを検索..."
          className="w-full bg-black/30 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
        />
      </div>

      {/* Session List */}
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">鑑定履歴がありません</p>
          </div>
        ) : (
          sessions.slice(0, 50).map(session => {
            const oracle = getOracleById(session.oracleId);
            return (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="w-full glass-card rounded-lg p-3 flex items-center gap-3 hover:border-red-500/30 transition-colors text-left group"
              >
                {oracle && (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle.color} overflow-hidden flex-shrink-0`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={oracle.image} alt={oracle.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm text-white truncate">{session.title}</h4>
                    <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                      {new Date(session.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{oracle?.name}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-500">{session.messages.length}メッセージ</span>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors flex-shrink-0" />
              </button>
            );
          })
        )}
      </div>

      {sessions.length > 50 && (
        <p className="text-center text-xs text-gray-500">
          最新50件を表示中（全{sessions.length}件）
        </p>
      )}
    </div>
  );
}

// ============ Users Tab ============
function UsersTab() {
  const [users, setUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    // In LocalStorage mode, we can only see the current user
    // But we can scan for any stored user data
    try {
      const stored = localStorage.getItem("sixoracle_user");
      if (stored) {
        const user = JSON.parse(stored);
        setUsers([user]);
      }
    } catch {}
  }, []);

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          登録ユーザー
        </h3>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-300">
            ※ 軽量版（LocalStorage）のため、現在ログイン中のユーザーのみ表示されます。
            完全版（Manus版）ではサーバーサイドのデータベースで全ユーザーを管理できます。
          </p>
        </div>

        <div className="space-y-3">
          {users.map((u, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                {u.phone?.slice(-2) || "??"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white">{u.phone}</span>
                  {u.isPremium && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Crown className="w-3 h-3 inline mr-0.5" />
                      プレミアム
                    </span>
                  )}
                  {u.isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      <Shield className="w-3 h-3 inline mr-0.5" />
                      管理者
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  登録日: {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">ユーザーデータがありません</p>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          システム情報
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">バージョン</p>
            <p className="text-white">Vercel Lite v2.0</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">データ保存</p>
            <p className="text-white">LocalStorage</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">占い師数</p>
            <p className="text-white">{oracles.length}人</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">認証方式</p>
            <p className="text-white">デモ認証</p>
          </div>
        </div>
      </div>
    </div>
  );
}
