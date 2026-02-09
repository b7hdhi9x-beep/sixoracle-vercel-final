"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { oracles } from "@/lib/oracles";
import { motion } from "framer-motion";
import { ArrowLeft, Save, MessageSquare, Loader2 } from "lucide-react";

interface CompanionSetting {
  oracle_id: string;
  nickname: string;
  greeting_enabled: boolean;
  daily_message_enabled: boolean;
  anniversary_reminder: boolean;
}

export default function MessageSettingsContent() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<CompanionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) fetchSettings();
  }, [isAuthenticated]);

  const getToken = async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/companion/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || oracles.map((o) => ({
          oracle_id: o.id,
          nickname: "",
          greeting_enabled: true,
          daily_message_enabled: false,
          anniversary_reminder: true,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (oracleId: string, key: keyof CompanionSetting, value: any) => {
    setSettings((prev) =>
      prev.map((s) => s.oracle_id === oracleId ? { ...s, [key]: value } : s)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = await getToken();
      const res = await fetch("/api/companion/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setMessage("設定を保存しました");
      } else {
        setMessage("保存に失敗しました");
      }
    } catch {
      setMessage("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-serif">メッセージ設定</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {settings.map((setting) => {
                const oracle = oracles.find((o) => o.id === setting.oracle_id);
                if (!oracle) return null;
                return (
                  <div key={setting.oracle_id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center`}>
                        <span className="text-sm font-bold">{oracle.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{oracle.name}</h3>
                        <p className="text-xs text-gray-400">{oracle.englishName}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">ニックネーム</label>
                        <input
                          type="text"
                          value={setting.nickname}
                          onChange={(e) => updateSetting(setting.oracle_id, "nickname", e.target.value)}
                          placeholder={`${oracle.name}の呼び方`}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">挨拶メッセージ</span>
                        <button
                          onClick={() => updateSetting(setting.oracle_id, "greeting_enabled", !setting.greeting_enabled)}
                          className={`w-12 h-6 rounded-full transition ${setting.greeting_enabled ? "bg-amber-500" : "bg-white/10"}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${setting.greeting_enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">毎日メッセージ</span>
                        <button
                          onClick={() => updateSetting(setting.oracle_id, "daily_message_enabled", !setting.daily_message_enabled)}
                          className={`w-12 h-6 rounded-full transition ${setting.daily_message_enabled ? "bg-amber-500" : "bg-white/10"}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${setting.daily_message_enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">記念日リマインダー</span>
                        <button
                          onClick={() => updateSetting(setting.oracle_id, "anniversary_reminder", !setting.anniversary_reminder)}
                          className={`w-12 h-6 rounded-full transition ${setting.anniversary_reminder ? "bg-amber-500" : "bg-white/10"}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${setting.anniversary_reminder ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {message && (
                <p className={`text-sm text-center ${message.includes("失敗") || message.includes("エラー") ? "text-red-400" : "text-green-400"}`}>
                  {message}
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "保存中..." : "設定を保存"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
