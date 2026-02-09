"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { oracles, getOracleById } from "@/lib/oracles";
import { getSessions, ChatSession } from "@/lib/chatStorage";
import { motion } from "framer-motion";
import {
  Shield, Home, Users, BarChart3, MessageSquare,
  ArrowRight, ArrowLeft, Crown, Clock, Heart, Calculator,
  Lightbulb, Star, Hand, Droplet, Cat, Brain, Moon,
  Sparkles, Eye, Search, RefreshCw,
  TrendingUp, Activity, Calendar, Gift, XCircle, CheckCircle,
  Settings, Database, Lock, Unlock, AlertTriangle,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain,
};

type AdminTab = "overview" | "sessions" | "users" | "system";

// Direct localStorage access for admin panel (no auth required)
const ALL_USERS_KEY = "sixoracle_all_users";

interface StoredUser {
  phone: string;
  isPremium: boolean;
  isAdmin: boolean;
  nickname?: string;
  createdAt: number;
  premiumExpiry?: number;
  premiumGrantedBy?: string;
}

function getAllUsersFromStorage(): StoredUser[] {
  try {
    const stored = localStorage.getItem(ALL_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUsersToStorage(users: StoredUser[]) {
  try {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

function grantPremiumDirect(phone: string, days: number) {
  const users = getAllUsersFromStorage();
  const idx = users.findIndex(u => u.phone === phone);
  if (idx >= 0) {
    users[idx].isPremium = true;
    users[idx].premiumExpiry = Date.now() + days * 24 * 60 * 60 * 1000;
    users[idx].premiumGrantedBy = "admin";
    saveUsersToStorage(users);
  }
}

function revokePremiumDirect(phone: string) {
  const users = getAllUsersFromStorage();
  const idx = users.findIndex(u => u.phone === phone);
  if (idx >= 0) {
    users[idx].isPremium = false;
    users[idx].premiumExpiry = undefined;
    users[idx].premiumGrantedBy = undefined;
    saveUsersToStorage(users);
  }
}

export default function AdminPanelContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

    const topOracles = Object.entries(oracleUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({
        oracle: getOracleById(id),
        count,
      }));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => s.createdAt >= todayStart.getTime()).length;

    const allUsers = mounted ? getAllUsersFromStorage() : [];
    const totalUsers = allUsers.length;
    const premiumUsers = allUsers.filter(u => u.isPremium).length;

    return { totalSessions, totalMessages, oracleUsage, last7Days, topOracles, todaySessions, totalUsers, premiumUsers };
  }, [sessions, mounted]);

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
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
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h1 className="text-lg font-bold text-white">管理者パネル</h1>
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
            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              OWNER ONLY
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800/50 bg-black/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview" as AdminTab, label: "概要", icon: BarChart3 },
              { id: "sessions" as AdminTab, label: "鑑定履歴", icon: MessageSquare },
              { id: "users" as AdminTab, label: "ユーザー管理", icon: Users },
              { id: "system" as AdminTab, label: "システム", icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        {activeTab === "system" && (
          <SystemTab />
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
          { label: "登録ユーザー", value: stats.totalUsers, icon: Users, color: "text-purple-400" },
          { label: "有料会員", value: stats.premiumUsers, icon: Crown, color: "text-amber-400" },
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

      {/* Today's Activity */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-400" />
          本日のアクティビティ
        </h3>
        <p className="text-3xl font-bold text-green-400">{stats.todaySessions}</p>
        <p className="text-xs text-gray-500 mt-1">セッション</p>
      </div>

      {/* Activity Chart */}
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
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.oracle.color} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                  {item.oracle.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.oracle.image} alt="" className="w-full h-full object-cover" />
                  ) : Icon ? (
                    <Icon className="w-4 h-4 text-white" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{item.oracle.name}</span>
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
            <p className="text-sm text-gray-500 text-center py-4">まだ鑑定データがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Sessions Tab ============
function SessionsTab({
  sessions, searchQuery, setSearchQuery, selectedSession, setSelectedSession,
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
          一覧に戻る
        </button>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle?.color || "from-gray-500 to-gray-600"} flex items-center justify-center overflow-hidden`}>
              {oracle?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={oracle.image} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div>
              <h3 className="text-white font-semibold">{selectedSession.title}</h3>
              <p className="text-xs text-gray-400">
                {oracle?.name} · {new Date(selectedSession.createdAt).toLocaleString("ja-JP")}
              </p>
            </div>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedSession.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-500/20 text-blue-100 border border-blue-500/30"
                    : "bg-white/5 text-gray-300 border border-gray-700"
                }`}>
                  {msg.content}
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
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="セッションを検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
          />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{sessions.length}件</span>
      </div>

      <div className="space-y-2">
        {sessions.map((session) => {
          const oracle = getOracleById(session.oracleId);
          const Icon = oracle ? iconMap[oracle.icon] : null;
          return (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="w-full glass-card rounded-lg p-4 text-left hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle?.color || "from-gray-500 to-gray-600"} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                  {oracle?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={oracle.image} alt="" className="w-full h-full object-cover" />
                  ) : Icon ? (
                    <Icon className="w-5 h-5 text-white" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm text-white truncate">{session.title}</h4>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                      {new Date(session.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {oracle?.name} · {session.messages.length}メッセージ
                  </p>
                </div>
                <Eye className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </div>
            </button>
          );
        })}
        {sessions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">鑑定履歴がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Users Tab ============
function UsersTab() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [grantingPhone, setGrantingPhone] = useState<string | null>(null);
  const [grantDays, setGrantDays] = useState(30);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(getAllUsersFromStorage());
  };

  const handleGrant = (phone: string) => {
    grantPremiumDirect(phone, grantDays);
    setGrantingPhone(null);
    setGrantDays(30);
    setActionMessage({ type: "success", text: `${phone} にプレミアム権限を${grantDays}日間付与しました` });
    setTimeout(() => setActionMessage(null), 4000);
    refreshUsers();
  };

  const handleRevoke = (phone: string) => {
    revokePremiumDirect(phone);
    setConfirmRevoke(null);
    setActionMessage({ type: "success", text: `${phone} のプレミアム権限を取り消しました` });
    setTimeout(() => setActionMessage(null), 4000);
    refreshUsers();
  };

  return (
    <div className="space-y-4">
      {/* Action Message */}
      {actionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
            actionMessage.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {actionMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {actionMessage.text}
        </motion.div>
      )}

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            登録ユーザー ({users.length}人)
          </h3>
          <button
            onClick={refreshUsers}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="更新"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {users.map((u, i) => {
            const isPremiumExpired = u.premiumExpiry && Date.now() > u.premiumExpiry;
            const premiumActive = u.isPremium && !isPremiumExpired;

            return (
              <div key={i} className="p-4 bg-black/20 rounded-lg border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {u.phone?.slice(-2) || "??"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-white">{u.phone}</span>
                      {u.nickname && (
                        <span className="text-xs text-gray-400">({u.nickname})</span>
                      )}
                      {premiumActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Crown className="w-3 h-3 inline mr-0.5" />
                          プレミアム
                        </span>
                      )}
                      {isPremiumExpired && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          期限切れ
                        </span>
                      )}
                      {u.isAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          <Shield className="w-3 h-3 inline mr-0.5" />
                          管理者
                        </span>
                      )}
                      {u.premiumGrantedBy === "admin" && premiumActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <Gift className="w-3 h-3 inline mr-0.5" />
                          管理者付与
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      登録日: {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                      {u.premiumExpiry && premiumActive && (
                        <span>
                          {" "}· 有効期限: {new Date(u.premiumExpiry).toLocaleDateString("ja-JP")}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {!u.isAdmin && (
                    <div className="flex gap-2 flex-shrink-0">
                      {!premiumActive ? (
                        <button
                          onClick={() => setGrantingPhone(u.phone)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                        >
                          <Gift className="w-3 h-3" />
                          付与
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmRevoke(u.phone)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          取消
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Grant Premium Dialog */}
                {grantingPhone === u.phone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-gray-700"
                  >
                    <p className="text-xs text-gray-400 mb-2">プレミアム権限の付与期間を選択</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[7, 14, 30, 60, 90, 180, 365].map(days => (
                        <button
                          key={days}
                          onClick={() => setGrantDays(days)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            grantDays === days
                              ? "bg-amber-500/30 text-amber-300 border-amber-500/50"
                              : "bg-black/20 text-gray-400 border-gray-700 hover:border-gray-500"
                          }`}
                        >
                          {days}日間
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleGrant(u.phone)}
                        className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {grantDays}日間付与する
                      </button>
                      <button
                        onClick={() => setGrantingPhone(null)}
                        className="text-xs px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Revoke Confirmation */}
                {confirmRevoke === u.phone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-gray-700"
                  >
                    <p className="text-xs text-red-400 mb-2">本当にプレミアム権限を取り消しますか？</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRevoke(u.phone)}
                        className="text-xs px-4 py-2 rounded-lg bg-red-500/30 text-red-300 border border-red-500/50 hover:bg-red-500/40 transition-colors"
                      >
                        取り消す
                      </button>
                      <button
                        onClick={() => setConfirmRevoke(null)}
                        className="text-xs px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">ユーザーデータがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ System Tab ============
function SystemTab() {
  const [clearConfirm, setClearConfirm] = useState<string | null>(null);

  const handleClearData = (key: string, label: string) => {
    try {
      localStorage.removeItem(key);
      setClearConfirm(null);
      alert(`${label}を削除しました。ページを再読み込みしてください。`);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* System Info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          システム情報
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">バージョン</p>
            <p className="text-white">Vercel v3.0</p>
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
            <p className="text-gray-500 text-xs mb-1">料金プラン</p>
            <p className="text-white">¥1,980/月</p>
          </div>
        </div>
      </div>

      {/* Registered Oracles */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          登録占い師一覧 ({oracles.length}人)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {oracles.map((oracle) => {
            const Icon = iconMap[oracle.icon];
            return (
              <div key={oracle.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                  {oracle.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={oracle.image} alt="" className="w-full h-full object-cover" />
                  ) : Icon ? (
                    <Icon className="w-5 h-5 text-white" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{oracle.name}</span>
                    <span className="text-[10px] text-gray-500">{oracle.englishName}</span>
                    {oracle.isNew && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{oracle.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-blue-400" />
          クイックリンク
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "トップページ", href: "/" },
            { label: "ダッシュボード", href: "/dashboard" },
            { label: "ログインページ", href: "/login" },
            { label: "利用規約", href: "/terms" },
            { label: "プライバシーポリシー", href: "/privacy" },
            { label: "特定商取引法", href: "/legal" },
            { label: "FAQ", href: "/faq" },
            { label: "ヘルプガイド", href: "/help" },
            { label: "お問い合わせ", href: "/contact" },
            { label: "意見箱", href: "/feedback" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="p-3 bg-black/20 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-3 h-3 text-gray-500" />
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-xl p-6 border border-red-900/30">
        <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          危険な操作
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          以下の操作は取り消せません。慎重に行ってください。
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <p className="text-sm text-white">全チャット履歴を削除</p>
              <p className="text-xs text-gray-500">LocalStorageの鑑定セッションデータを全削除</p>
            </div>
            {clearConfirm === "sessions" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleClearData("sixoracle_sessions", "チャット履歴")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/30 text-red-300 border border-red-500/50"
                >
                  実行
                </button>
                <button
                  onClick={() => setClearConfirm(null)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm("sessions")}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
              >
                削除
              </button>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <p className="text-sm text-white">全ユーザーデータを削除</p>
              <p className="text-xs text-gray-500">LocalStorageのユーザー登録データを全削除</p>
            </div>
            {clearConfirm === "users" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleClearData("sixoracle_all_users", "ユーザーデータ")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/30 text-red-300 border border-red-500/50"
                >
                  実行
                </button>
                <button
                  onClick={() => setClearConfirm(null)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm("users")}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
              >
                削除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
