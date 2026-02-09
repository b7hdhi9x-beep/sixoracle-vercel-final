"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Shield, Home, Moon, Users, BarChart3, MessageSquare,
  ArrowLeft, Crown, Clock,
  Sparkles, Search, RefreshCw,
  TrendingUp, CheckCircle, XCircle, Loader2,
} from "lucide-react";

interface UserRow {
  id: string;
  email: string | null;
  nickname: string | null;
  is_premium: boolean;
  is_admin: boolean;
  premium_granted_by: string | null;
  total_messages_sent: number;
  free_messages_remaining: number;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !profile?.is_admin)) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, profile, router]);

  useEffect(() => {
    if (user && profile?.is_admin) {
      loadUsers();
    }
  }, [user, profile]);

  const loadUsers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?adminUserId=${user.id}`);
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumAction = async (targetUserId: string, action: "grant" | "revoke") => {
    if (!user) return;
    setActionLoading(targetUserId);
    try {
      await fetch("/api/admin/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUserId: user.id,
          targetUserId,
          action,
        }),
      });
      await loadUsers();
    } catch (err) {
      console.error("Premium action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.nickname || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.is_premium).length,
    totalMessages: users.reduce((sum, u) => sum + (u.total_messages_sent || 0), 0),
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mystical-bg">
      {/* Header */}
      <header className="border-b border-gray-800 bg-mystic-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-lg font-serif gradient-text">管理者ダッシュボード</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="text-gray-400 hover:text-white transition-colors"
              title="更新"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">ダッシュボードに戻る</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">総ユーザー数</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-gray-400">プレミアム会員</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.premiumUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">総メッセージ数</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
          </motion.div>
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ユーザーを検索..."
              className="flex-1 bg-transparent text-gray-200 placeholder:text-gray-600 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">ユーザー</th>
                  <th className="px-4 py-3">ステータス</th>
                  <th className="px-4 py-3">メッセージ数</th>
                  <th className="px-4 py-3">残り無料回数</th>
                  <th className="px-4 py-3">登録日</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-500 mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      ユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-200">{u.nickname || "未設定"}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_admin ? (
                          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">管理者</span>
                        ) : u.is_premium ? (
                          <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1 w-fit">
                            <Crown className="w-3 h-3" /> プレミアム
                            {u.premium_granted_by && (
                              <span className="text-gray-500">({u.premium_granted_by})</span>
                            )}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">無料</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{u.total_messages_sent || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{u.free_messages_remaining}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="px-4 py-3">
                        {!u.is_admin && (
                          <div className="flex items-center gap-2">
                            {u.is_premium ? (
                              <button
                                onClick={() => handlePremiumAction(u.id, "revoke")}
                                disabled={actionLoading === u.id}
                                className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                取消
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePremiumAction(u.id, "grant")}
                                disabled={actionLoading === u.id}
                                className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                付与
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
