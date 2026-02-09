"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Calendar, Star, Droplet, Loader2 } from "lucide-react";

const zodiacSigns = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
const bloodTypes = ["A型", "B型", "O型", "AB型"];
const genders = ["男性", "女性", "その他", "回答しない"];

export default function ProfileContent() {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    display_name: "",
    birth_date: "",
    zodiac_sign: "",
    blood_type: "",
    gender: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        birth_date: profile.birth_date || "",
        zodiac_sign: profile.zodiac_sign || "",
        blood_type: profile.blood_type || "",
        gender: profile.gender || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("プロフィールを更新しました");
        refreshProfile?.();
      } else {
        setMessage("更新に失敗しました");
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-serif">プロフィール編集</h1>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">表示名</label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50 focus:outline-none transition"
                placeholder="あなたの名前"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 生年月日
              </label>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" /> 星座
              </label>
              <select
                value={form.zodiac_sign}
                onChange={(e) => setForm({ ...form, zodiac_sign: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50 focus:outline-none transition"
              >
                <option value="" className="bg-[#1a1a2e]">選択してください</option>
                {zodiacSigns.map((sign) => (
                  <option key={sign} value={sign} className="bg-[#1a1a2e]">{sign}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4" /> 血液型
              </label>
              <select
                value={form.blood_type}
                onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50 focus:outline-none transition"
              >
                <option value="" className="bg-[#1a1a2e]">選択してください</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#1a1a2e]">{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">性別</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50 focus:outline-none transition"
              >
                <option value="" className="bg-[#1a1a2e]">選択してください</option>
                {genders.map((g) => (
                  <option key={g} value={g} className="bg-[#1a1a2e]">{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">自己紹介</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber-500/50 focus:outline-none transition resize-none"
                placeholder="あなたについて教えてください..."
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes("失敗") || message.includes("エラー") ? "text-red-400" : "text-green-400"}`}>
                {message}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
