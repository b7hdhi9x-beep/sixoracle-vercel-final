"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Calendar, Gift, Star } from "lucide-react";

interface Anniversary {
  id: string;
  companion_id: string;
  title: string;
  date: string;
  notes: string;
  created_at: string;
}

export default function SpecialDatesContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnniversary, setSelectedAnniversary] = useState<Anniversary | null>(null);

  const fetchAnniversaries = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/companion/anniversaries", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        throw new Error("記念日の取得に失敗しました。");
      }

      const data = await res.json();
      setAnniversaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading) {
      fetchAnniversaries();
    }
  }, [loading, fetchAnniversaries]);

  const handleOpenModal = (anniversary: Anniversary | null = null) => {
    setSelectedAnniversary(anniversary);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnniversary(null);
  };

  const handleSave = async (formData: Omit<Anniversary, 'id' | 'companion_id' | 'created_at'>) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const method = selectedAnniversary ? "PUT" : "POST";
      const url = selectedAnniversary
        ? `/api/companion/anniversaries?id=${selectedAnniversary.id}`
        : "/api/companion/anniversaries";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("記念日の保存に失敗しました。");
      }

      fetchAnniversaries();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("本当にこの記念日を削除しますか？")) return;

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/companion/anniversaries?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        throw new Error("記念日の削除に失敗しました。");
      }

      fetchAnniversaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。");
    }
  };

  if (loading || isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">読み込み中...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">ログインしてください。</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-amber-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        {/* Starry background effect */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      <main className="max-w-7xl mx-auto z-10 relative">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-4xl font-serif text-amber-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            記念日管理
          </motion.h1>
          <motion.button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg shadow-amber-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            <span>新規追加</span>
          </motion.button>
        </div>

        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {anniversaries.map((anniv) => (
              <motion.div
                key={anniv.id}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Gift className="text-amber-400" size={24} />
                    <h2 className="text-2xl font-serif text-gray-200">{anniv.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 mb-2">
                    <Calendar size={16} />
                    <span>{new Date(anniv.date).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{anniv.notes}</p>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => handleOpenModal(anniv)} className="p-2 text-gray-400 hover:text-amber-400 transition-colors"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(anniv.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {anniversaries.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Star className="mx-auto text-amber-400/50" size={64} />
            <p className="mt-4 text-gray-400">まだ記念日が登録されていません。</p>
            <p className="text-gray-500">新しい記念日を追加して、大切な日を記録しましょう。</p>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <AnniversaryModal
            anniversary={selectedAnniversary}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface AnniversaryModalProps {
  anniversary: Anniversary | null;
  onClose: () => void;
  onSave: (formData: Omit<Anniversary, 'id' | 'companion_id' | 'created_at'>) => void;
}

function AnniversaryModal({ anniversary, onClose, onSave }: AnniversaryModalProps) {
  const [formData, setFormData] = useState({
    title: anniversary?.title || "",
    date: anniversary?.date ? new Date(anniversary.date).toISOString().split('T')[0] : "",
    notes: anniversary?.notes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 w-full max-w-md relative shadow-2xl shadow-purple-500/10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-serif text-amber-400 mb-6">{anniversary ? "記念日の編集" : "新しい記念日"}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">タイトル</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">日付</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition [color-scheme:dark]"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">メモ</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
            />
          </div>
          <div className="flex justify-end pt-4">
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-amber-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              保存
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
