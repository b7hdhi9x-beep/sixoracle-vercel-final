
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Facebook, Link, Star, Users, BrainCircuit, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// 仮のデータ型定義
interface MbtiResult {
  mbti_type: string;
  group_name: string;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  compatibility: { type: string; description: string }[];
}

// 仮の占い師データ
const fortuneteller = {
  name: "水晶玉の老婆",
  avatar: "/placeholder-fortuneteller.jpg", // 占い師のアバター画像パス
};

const MBTIGroupResultContent = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      // TODO: APIからグループ診断結果を取得するロジックを実装
      // 以下はダミーデータ
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult({
        mbti_type: "INFJ-A",
        group_name: "星屑の探求者たち",
        analysis: "深い洞察力と共感力を持ち、理想を追求するグループです。内なるビジョンに従い、静かながらも強い影響力を周囲に与えます。複雑な問題の本質を見抜く力がありますが、時に現実とのギャップに悩むことも。",
        strengths: ["高い共感性", "戦略的思考", "強い信念", "創造性"],
        weaknesses: ["完璧主義", "燃え尽きやすい", "批判に敏感", "決断に時間がかかる"],
        compatibility: [
          { type: "ENFP", description: "互いの創造性を刺激し合う最高のパートナー。" },
          { type: "INTP", description: "知的な会話が弾み、深い理解を築ける関係。" },
        ],
      });
    };

    if (isAuthenticated) {
      fetchResult().catch(err => setError("結果の取得に失敗しました。"));
    }
  }, [isAuthenticated]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `私たちのMBTIグループ診断結果は「${result?.group_name}」でした！あなたも診断してみませんか？`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  if (loading || !result && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
        <div className="text-center text-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <BrainCircuit className="w-16 h-16 mx-auto text-amber-400" />
          </motion.div>
          <p className="mt-4 text-lg font-serif">結果を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">
        <p>{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">
        <p>このページを表示するにはログインが必要です。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-gray-300 font-sans p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        {/* 星空の背景をここに実装 (例: CSSや画像) */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-1000"></div>
      </div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto z-10 relative"
      >
        <motion.header variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif text-white font-bold mb-2 tracking-wider">
            MBTIグループ診断結果
          </h1>
          <p className="text-amber-400 text-2xl font-serif">- {result.group_name} -</p>
        </motion.header>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="w-10 h-10 text-amber-400 mr-4" />
            <div>
              <h2 className="text-2xl font-serif text-white">あなたのタイプ</h2>
              <p className="text-4xl font-bold text-amber-400 tracking-widest">{result.mbti_type}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-start">
            <img src={fortuneteller.avatar} alt={fortuneteller.name} className="w-16 h-16 rounded-full border-2 border-amber-500/50 mr-4"/>
            <div>
              <h3 className="text-xl font-serif text-white mb-2">- {fortuneteller.name}の分析 -</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.analysis}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-serif text-white mb-4 flex items-center"><Star className="w-5 h-5 mr-2 text-amber-400"/>強み</h3>
            <ul className="space-y-2">
              {result.strengths.map((strength, i) => (
                <motion.li key={i} className="flex items-center" custom={i} variants={itemVariants}>
                  <Star className="w-4 h-4 mr-3 text-amber-500/70 flex-shrink-0" />
                  <span>{strength}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-serif text-white mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-purple-400"/>課題</h3>
            <ul className="space-y-2">
              {result.weaknesses.map((weakness, i) => (
                <motion.li key={i} className="flex items-center" custom={i} variants={itemVariants}>
                  <BarChart3 className="w-4 h-4 mr-3 text-purple-500/70 flex-shrink-0" />
                  <span>{weakness}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 mb-8">
          <h3 className="text-xl font-serif text-white mb-4 flex items-center"><BrainCircuit className="w-5 h-5 mr-2 text-amber-400"/>相性の良いタイプ</h3>
          <div className="space-y-4">
            {result.compatibility.map((comp, i) => (
              <motion.div key={i} custom={i} variants={itemVariants}>
                <p className="font-bold text-amber-400 text-lg">{comp.type}</p>
                <p className="text-gray-400">{comp.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <h3 className="text-lg font-serif text-white mb-4">この結果を共有する</h3>
          <div className="flex justify-center items-center space-x-4">
            <motion.a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Twitter className="w-6 h-6 text-white" />
            </motion.a>
            <motion.a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Facebook className="w-6 h-6 text-white" />
            </motion.a>
            <motion.button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Link className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </motion.div>

      </motion.main>
    </div>
  );
};

export default MBTIGroupResultContent;
