
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

export default function MonthlyCodeContent() {
  const { user, isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>({ type: 'info', text: '月額支援コードを入力してください。' });

  const handleCodeValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'コードを入力してください。' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('認証トークンが見つかりません。再度ログインしてください。');
      }

      const response = await fetch('/api/monthly-code/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'コードの検証に失敗しました。');
      }

      setMessage({ type: 'success', text: result.message || 'コードが正常に適用されました！' });
      await refreshProfile(); // ユーザープロファイルを更新してプレミアム状態を反映
      setCode('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました。';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
        <h1 className="font-serif text-3xl text-white mb-4">アクセスできません</h1>
        <p className="text-gray-300">このページを表示するにはログインが必要です。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Gift className="mx-auto w-16 h-16 text-amber-400 mb-4" />
            <h1 className="font-serif text-4xl font-bold">月額コード</h1>
            <p className="text-gray-400 mt-2">支援コードを入力して特典を有効化</p>
          </div>

          <form onSubmit={handleCodeValidation} className="space-y-6">
            <div>
              <label htmlFor="monthly-code" className="sr-only">月額コード</label>
              <input
                id="monthly-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 bg-black/20 border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all duration-300 placeholder-gray-500 text-center tracking-widest"
                disabled={isLoading}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full font-bold text-lg py-3 px-6 rounded-lg bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'コードを適用'
              )}
            </motion.button>
          </form>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg text-center flex items-center justify-center space-x-2 ${{
                success: 'bg-green-500/10 text-green-300 border border-green-500/20',
                error: 'bg-red-500/10 text-red-300 border border-red-500/20',
                info: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
              }[message.type]}`}>
              {message.type === 'success' && <ShieldCheck className="w-5 h-5" />}
              {message.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              <p>{message.text}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
