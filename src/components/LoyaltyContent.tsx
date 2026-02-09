
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Star, Award, Gift, Gem } from "lucide-react";

const LoyaltyContent = () => {
  const { profile } = useAuth();

  const loyaltyPoints = profile?.loyalty_points || 0;

  const levels = [
    { name: "ブロンズ", points: 0, icon: <Star className="w-8 h-8 text-amber-700" /> },
    { name: "シルバー", points: 500, icon: <Award className="w-8 h-8 text-gray-400" /> },
    { name: "ゴールド", points: 1500, icon: <Gem className="w-8 h-8 text-amber-400" /> },
    { name: "プラチナ", points: 5000, icon: <Gift className="w-8 h-8 text-purple-400" /> },
  ];

  const currentLevelIndex = levels.findIndex((level, index) => {
    const nextLevel = levels[index + 1];
    return loyaltyPoints >= level.points && (!nextLevel || loyaltyPoints < nextLevel.points);
  });

  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];

  const progress = nextLevel
    ? ((loyaltyPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100
    : 100;

  const benefits = [
    { title: "限定コンテンツへのアクセス", level: "シルバー" },
    { title: "優先サポート", level: "ゴールド" },
    { title: "新機能への早期アクセス", level: "ゴールド" },
    { title: "限定グッズ", level: "プラチナ" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-serif text-amber-400 mb-2">ロイヤルティプログラム</h1>
          <p className="text-gray-300 text-lg">ご愛顧いただきありがとうございます</p>
        </motion.header>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-lg">現在のポイント</p>
              <p className="text-5xl sm:text-6xl font-bold text-amber-400 tracking-tighter">{loyaltyPoints.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentLevel.icon}</div>
              <div>
                <p className="text-gray-400">現在のレベル</p>
                <p className="text-2xl font-bold">{currentLevel.name}</p>
              </div>
            </div>
          </div>

          {nextLevel && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-300">
                <span>{currentLevel.name}</span>
                <span>{nextLevel.name}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-amber-500 to-purple-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
              <p className="text-center mt-3 text-gray-400">
                あと <span className="font-bold text-white">{nextLevel.points - loyaltyPoints}</span> ポイントで「{nextLevel.name}」に到達！
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-3xl font-serif text-center mb-6 text-amber-400">レベル別特典</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index + 1}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex items-center gap-4"
              >
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/30">
                  <Gift className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">「{benefit.level}」レベルから利用可能</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoyaltyContent;
