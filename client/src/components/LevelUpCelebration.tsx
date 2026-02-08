/**
 * 親密度レベルアップ演出コンポーネント
 * レベルアップ時にアニメーション演出と特典解放通知を表示
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Gift, X, Crown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { oracles } from "@/lib/oracles";

interface LevelUpReward {
  id: number;
  name: string;
  description: string;
  rewardType: string;
}

interface LevelUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  oracleId: string;
  previousLevel: number;
  newLevel: number;
  unlockedRewards?: LevelUpReward[];
}

// レベルごとの称号
const LEVEL_TITLES: Record<number, string> = {
  1: "出会いの始まり",
  2: "信頼の芽生え",
  3: "絆の深まり",
  4: "心の通い合い",
  5: "魂の共鳴",
  6: "運命の導き手",
  7: "永遠の絆",
  8: "神秘の境地",
  9: "究極の信頼",
  10: "伝説の契約者",
};

// レベルごとの色
const LEVEL_COLORS: Record<number, { primary: string; secondary: string }> = {
  1: { primary: "#94a3b8", secondary: "#64748b" }, // slate
  2: { primary: "#a3e635", secondary: "#84cc16" }, // lime
  3: { primary: "#22d3ee", secondary: "#06b6d4" }, // cyan
  4: { primary: "#60a5fa", secondary: "#3b82f6" }, // blue
  5: { primary: "#a78bfa", secondary: "#8b5cf6" }, // violet
  6: { primary: "#f472b6", secondary: "#ec4899" }, // pink
  7: { primary: "#fb923c", secondary: "#f97316" }, // orange
  8: { primary: "#fbbf24", secondary: "#f59e0b" }, // amber
  9: { primary: "#f87171", secondary: "#ef4444" }, // red
  10: { primary: "#fcd34d", secondary: "#eab308" }, // gold
};

export function LevelUpCelebration({
  isOpen,
  onClose,
  oracleId,
  previousLevel,
  newLevel,
  unlockedRewards = [],
}: LevelUpCelebrationProps) {
  const [showRewards, setShowRewards] = useState(false);
  const oracle = oracles.find(o => o.id === oracleId) || oracles[0];
  const colors = LEVEL_COLORS[newLevel] || LEVEL_COLORS[1];
  const title = LEVEL_TITLES[newLevel] || "新たな境地";

  useEffect(() => {
    if (isOpen) {
      // 2秒後に特典表示
      const timer = setTimeout(() => {
        if (unlockedRewards.length > 0) {
          setShowRewards(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowRewards(false);
    }
  }, [isOpen, unlockedRewards.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* 背景の星エフェクト */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3,
                }}
                className="absolute"
              >
                <Star
                  className="w-4 h-4"
                  style={{ color: colors.primary }}
                  fill={colors.primary}
                />
              </motion.div>
            ))}
          </div>

          {/* メインコンテンツ */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative max-w-md w-full mx-4 p-8 rounded-3xl bg-gradient-to-b from-background/95 to-background/80 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* レベルアップアニメーション */}
            <div className="text-center">
              {/* 占い師アイコン */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative inline-block mb-6"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  }}
                >
                  {oracle.icon === "Clock" && "⏰"}
                  {oracle.icon === "Heart" && "❤️"}
                  {oracle.icon === "Binary" && "🔢"}
                  {oracle.icon === "Sun" && "☀️"}
                  {oracle.icon === "Moon" && "🌙"}
                  {oracle.icon === "Shield" && "🛡️"}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg"
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>

              {/* タイトル */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" style={{ color: colors.primary }} />
                  <span className="text-sm uppercase tracking-widest text-muted-foreground">
                    Level Up!
                  </span>
                  <Sparkles className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-1">
                  {oracle.name}との絆が深まりました
                </h2>
                <p className="text-muted-foreground text-sm">
                  {oracle.englishName}
                </p>
              </motion.div>

              {/* レベル表示 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="my-8"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-muted-foreground">
                      Lv.{previousLevel}
                    </div>
                  </div>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <span className="text-2xl">→</span>
                  </motion.div>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-5xl font-bold"
                      style={{ color: colors.primary }}
                    >
                      Lv.{newLevel}
                    </motion.div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 px-4 py-2 rounded-full inline-block"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                    border: `1px solid ${colors.primary}40`,
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: colors.primary }}>
                    ✨ {title} ✨
                  </span>
                </motion.div>
              </motion.div>

              {/* 解放された特典 */}
              <AnimatePresence>
                {showRewards && unlockedRewards.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 pt-6 mt-6">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Gift className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium">新しい特典が解放されました！</span>
                      </div>
                      <div className="space-y-3">
                        {unlockedRewards.map((reward, index) => (
                          <motion.div
                            key={reward.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-500" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-sm">{reward.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {reward.description}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 閉じるボタン */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <Button
                  onClick={onClose}
                  className="w-full"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  これからもよろしくね
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * レベルアップ検出フック
 * 親密度の変化を監視してレベルアップを検出
 */
export function useLevelUpDetection(
  currentLevel: number | undefined,
  oracleId: string
) {
  const [levelUpData, setLevelUpData] = useState<{
    previousLevel: number;
    newLevel: number;
    oracleId: string;
  } | null>(null);
  const [previousLevel, setPreviousLevel] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (currentLevel !== undefined && previousLevel !== undefined) {
      if (currentLevel > previousLevel) {
        setLevelUpData({
          previousLevel,
          newLevel: currentLevel,
          oracleId,
        });
      }
    }
    if (currentLevel !== undefined) {
      setPreviousLevel(currentLevel);
    }
  }, [currentLevel, oracleId, previousLevel]);

  const clearLevelUp = () => setLevelUpData(null);

  return { levelUpData, clearLevelUp };
}
