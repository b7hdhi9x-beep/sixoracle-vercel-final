
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, Calendar, User, Star, Loader2 } from 'lucide-react';

// データ型定義
type ScheduledMessage = {
  id: string;
  sender_name: string;
  sender_title: string;
  message: string;
  scheduled_at: string;
  is_read: boolean;
};

export default function ScheduledMessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError("メッセージを表示するにはログインが必要です。");
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("認証トークンがありません。");
        }

        const res = await fetch('/api/scheduled-messages/list', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('メッセージの取得に失敗しました。');
        }

        const data = await res.json();
        setMessages(data.messages || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, authLoading]);

  const markAsRead = async (id: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/scheduled-messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message_id: id }),
      });

      if (!res.ok) {
        throw new Error('既読への更新に失敗しました。');
      }

      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: true } : msg));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const filteredMessages = useMemo(() => {
    if (filter === 'all') return messages;
    return messages.filter(msg => filter === 'read' ? msg.is_read : !msg.is_read);
  }, [messages, filter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl sm:text-5xl font-serif text-amber-400 mb-2 text-center">SCHEDULED MESSAGES</h1>
          <p className="text-gray-300 text-center mb-8">占い師からの予約メッセージ</p>
        </motion.div>

        <div className="flex justify-center space-x-4 mb-8">
          {(['unread', 'read', 'all'] as const).map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm sm:text-base transition-all duration-300 ${filter === f ? 'bg-amber-500 text-black font-bold' : 'bg-white/10 hover:bg-white/20'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {f === 'unread' ? '未読' : f === 'read' ? '既読' : 'すべて'}
            </motion.button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-amber-400" size={48} />
          </div>
        )}

        {error && <p className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</p>}

        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <AnimatePresence>
              {filteredMessages.length > 0 ? (
                filteredMessages.map(msg => (
                  <motion.div
                    key={msg.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, x: -50 }}
                    layout
                    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="p-2 bg-amber-500/10 rounded-full mr-4">
                           <User className="text-amber-400" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-100">{msg.sender_name}</p>
                          <p className="text-sm text-amber-300 flex items-center"><Star size={14} className="mr-1"/>{msg.sender_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={14} className="mr-2" />
                        {new Date(msg.scheduled_at).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex justify-between items-center">
                        <div>
                            {msg.is_read ? (
                                <span className="flex items-center text-sm text-green-400"><MailOpen size={16} className="mr-2"/>既読</span>
                            ) : (
                                <span className="flex items-center text-sm text-amber-400"><Mail size={16} className="mr-2"/>未読</span>
                            )}
                        </div>
                        {!msg.is_read && (
                            <motion.button
                                onClick={() => markAsRead(msg.id)}
                                className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
                                whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(255, 193, 7, 0.5)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                既読にする
                            </motion.button>
                        )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <p className="text-gray-400">該当するメッセージはありません。</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
