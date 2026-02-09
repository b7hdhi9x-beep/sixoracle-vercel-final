
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface Fortuneteller {
  id: string;
  name: string;
  specialty: string;
  profile_image_url: string;
}

export default function FavoritesContent() {
  const [favorites, setFavorites] = useState<Fortuneteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("認証トークンがありません。");
      }

      const res = await fetch('/api/favorites/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('お気に入りリストの取得に失敗しました。');
      }

      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchFavorites();
    }
  }, [authLoading, fetchFavorites]);

  const handleRemove = async (id: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("認証トークンがありません。");
      }

      const res = await fetch('/api/favorites/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fortuneteller_id: id }),
      });

      if (!res.ok) {
        throw new Error('お気に入りの削除に失敗しました。');
      }

      setFavorites(prev => prev.filter(fav => fav.id !== id));
    } catch (e: any) {
      setError(e.message);
      // Optionally show a notification to the user
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/fortuneteller/${id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-4xl sm:text-5xl font-serif text-center mb-8 text-amber-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          お気に入り占い師
        </motion.h1>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-gray-400 py-20"
          >
            <Star className="w-16 h-16 mx-auto mb-4 text-amber-500/50" />
            <p className="text-xl">お気に入りの占い師はまだいません。</p>
            <p>占い師を探しに行きましょう。</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((fortuneteller, index) => (
                <motion.div
                  key={fortuneteller.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-lg"
                >
                  <div 
                    className="cursor-pointer" 
                    onClick={() => handleCardClick(fortuneteller.id)}
                  >
                    <img 
                      src={fortuneteller.profile_image_url || '/default-avatar.png'} 
                      alt={fortuneteller.name} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-serif text-amber-400 truncate">{fortuneteller.name}</h3>
                      <p className="text-gray-300 text-sm mt-1 truncate">{fortuneteller.specialty}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemove(fortuneteller.id)}
                    className="absolute top-2 right-2 bg-red-600/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm"
                    aria-label={`Remove ${fortuneteller.name} from favorites`}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
