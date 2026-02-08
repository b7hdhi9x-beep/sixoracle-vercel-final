import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Oracle } from "@/lib/oracles";

interface OracleThinkingAnimationProps {
  oracle: Oracle;
}

// 占い師ごとの鑑定中メッセージ（ローテーション）
const oracleThinkingMessages: Record<string, string[]> = {
  souma: [
    "蒼真が時の流れを読み解いています...",
    "運命の糸を辿っています...",
    "時空の彼方から答えを探しています...",
    "星々の巡りを確認しています...",
    "あなたの運命の転機を見極めています...",
  ],
  reira: [
    "玲蘭があなたの心に寄り添っています...",
    "愛のエネルギーを感じ取っています...",
    "心の奥底にある想いを読み解いています...",
    "感情の波動を受け取っています...",
    "あなたの恋の行方を占っています...",
  ],
  sakuya: [
    "朔夜が数字の神秘を解き明かしています...",
    "数秘の法則を紐解いています...",
    "あなたの運命数を計算しています...",
    "宇宙の数式を読み解いています...",
    "数字が語る真実を探っています...",
  ],
  akari: [
    "灯がタロットカードを引いています...",
    "カードが語りかけています...",
    "大アルカナの導きを受けています...",
    "運命のカードを展開しています...",
    "タロットの啓示を受け取っています...",
  ],
  yui: [
    "結衣が夢の世界を彷徨っています...",
    "夢のメッセージを解読しています...",
    "潜在意識の扉を開いています...",
    "夢の象徴を読み解いています...",
    "あなたの深層心理を探っています...",
  ],
  gen: [
    "玄が守護の力を練っています...",
    "風水の気の流れを読んでいます...",
    "陰陽のバランスを見極めています...",
    "守護霊からのメッセージを受信しています...",
    "あなたを守る力を感じ取っています...",
  ],
  shion: [
    "紫苑があなたの手のひらを読み解いています...",
    "生命線の奥深くを辿っています...",
    "手相に刻まれた運命を解読しています...",
    "掌の紋様が語る物語を読んでいます...",
    "あなたの手に秘められた力を感じています...",
  ],
  seiran: [
    "星蘭が星々の配置を読み解いています...",
    "天体の動きを追っています...",
    "あなたの星座の運行を確認しています...",
    "宇宙のエネルギーを受信しています...",
    "星々があなたに語りかけています...",
  ],
  hizuki: [
    "緋月が血の神秘を読み解いています...",
    "血液型の相性を分析しています...",
    "あなたの本質を見極めています...",
    "血の記憶を辿っています...",
    "深層の性格パターンを解読しています...",
  ],
  juga: [
    "獣牙がお前の内なる獣を探しているぜ...",
    "動物霊がざわめいている...",
    "お前の魂の動物を呼び出しているところだ...",
    "野生の直感が何かを告げている...",
    "お前の本能を読み取っているぜ...",
  ],
  shinri: [
    "心理があなたの心の地図を読み解いています...",
    "深層心理のパターンを分析しています...",
    "あなたの内面世界を探索しています...",
    "心理学的な視点から洞察を得ています...",
    "あなたの思考パターンを解読しています...",
  ],
};

// 占い師ごとのカラーマッピング
const oracleColors: Record<string, { primary: string; glow: string; bg: string }> = {
  souma: { primary: "#4f6ef7", glow: "rgba(79, 110, 247, 0.4)", bg: "rgba(79, 110, 247, 0.08)" },
  reira: { primary: "#ec4899", glow: "rgba(236, 72, 153, 0.4)", bg: "rgba(236, 72, 153, 0.08)" },
  sakuya: { primary: "#8b5cf6", glow: "rgba(139, 92, 246, 0.4)", bg: "rgba(139, 92, 246, 0.08)" },
  akari: { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", bg: "rgba(245, 158, 11, 0.08)" },
  yui: { primary: "#06b6d4", glow: "rgba(6, 182, 212, 0.4)", bg: "rgba(6, 182, 212, 0.08)" },
  gen: { primary: "#10b981", glow: "rgba(16, 185, 129, 0.4)", bg: "rgba(16, 185, 129, 0.08)" },
  shion: { primary: "#a855f7", glow: "rgba(168, 85, 247, 0.4)", bg: "rgba(168, 85, 247, 0.08)" },
  seiran: { primary: "#6366f1", glow: "rgba(99, 102, 241, 0.4)", bg: "rgba(99, 102, 241, 0.08)" },
  hizuki: { primary: "#ef4444", glow: "rgba(239, 68, 68, 0.4)", bg: "rgba(239, 68, 68, 0.08)" },
  juga: { primary: "#d97706", glow: "rgba(217, 119, 6, 0.4)", bg: "rgba(217, 119, 6, 0.08)" },
  shinri: { primary: "#0ea5e9", glow: "rgba(14, 165, 233, 0.4)", bg: "rgba(14, 165, 233, 0.08)" },
};

// 占い師ごとの占術アイコン（SVG path）
const oracleSymbols: Record<string, string> = {
  souma: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z", // 時計
  reira: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", // ハート
  sakuya: "M5 8h14V6H5v2zm0 4h14v-2H5v2zm0 4h14v-2H5v2zm0 4h14v-2H5v2z", // 数字
  akari: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", // カード
  yui: "M12 3a6 6 0 0 0-6 6c0 4.97 6 11 6 11s6-6.03 6-11a6 6 0 0 0-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z", // 夢
  gen: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z", // 星
  shion: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z", // 手
  seiran: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z", // 星
  hizuki: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", // 血
  juga: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z", // 獣
  shinri: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z", // 心理
};

export function OracleThinkingAnimation({ oracle }: OracleThinkingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const messages = useMemo(() => 
    oracleThinkingMessages[oracle.id] || [`${oracle.name}が鑑定中...`],
    [oracle.id, oracle.name]
  );

  const colors = oracleColors[oracle.id] || { primary: "#d4a574", glow: "rgba(212, 165, 116, 0.4)", bg: "rgba(212, 165, 116, 0.08)" };

  // メッセージのローテーション（4秒ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  // 経過時間カウンター
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-3 message-animate px-1">
      {/* 占い師アバター（グロー付き） */}
      <div className="relative flex-shrink-0">
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{ 
            boxShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
            animation: 'oracle-glow 2s ease-in-out infinite'
          }}
        />
        <Avatar className="w-12 h-12 ring-2 relative z-10" style={{ borderColor: colors.primary, '--tw-ring-color': colors.primary } as React.CSSProperties}>
          <AvatarImage src={oracle.image} alt={oracle.name} />
        </Avatar>
        {/* 占術シンボルバッジ */}
        <div 
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-20 border-2 border-background"
          style={{ backgroundColor: colors.primary }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d={oracleSymbols[oracle.id] || oracleSymbols.souma} />
          </svg>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className="text-xs mb-1.5 ml-1 font-medium" style={{ color: colors.primary }}>
          {oracle.name}
        </span>
        
        <div 
          className="relative rounded-2xl rounded-tl-sm overflow-hidden w-full max-w-sm"
          style={{ 
            background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(40, 30, 70, 0.95) 50%, ${colors.bg} 100%)`,
            border: `1px solid ${colors.primary}33`,
            boxShadow: `0 4px 24px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`
          }}
        >
          {/* シマーエフェクト */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${colors.primary}22 50%, transparent 100%)`,
              animation: 'shimmer 2s ease-in-out infinite',
            }}
          />
          
          <div className="relative z-10 p-4">
            {/* アニメーションドット */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: colors.primary,
                      animation: `oracle-dot-bounce 1.4s ease-in-out infinite ${i * 200}ms`,
                      boxShadow: `0 0 6px ${colors.glow}`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{elapsedSeconds}秒</span>
              </div>
            </div>

            {/* ローテーションメッセージ */}
            <div className="min-h-[1.5rem] flex items-center">
              <p 
                key={messageIndex}
                className="text-sm font-medium leading-relaxed"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  animation: 'oracle-message-fade 4s ease-in-out infinite',
                }}
              >
                {messages[messageIndex]}
              </p>
            </div>

            {/* プログレスバー */}
            <div className="mt-3 h-0.5 rounded-full overflow-hidden bg-white/5">
              <div 
                className="h-full rounded-full"
                style={{
                  backgroundColor: colors.primary,
                  animation: 'oracle-progress 3s ease-in-out infinite',
                  boxShadow: `0 0 8px ${colors.glow}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
