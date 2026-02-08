import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { History, X, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOracleById } from "@/lib/oracles";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface SimpleHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: "small" | "medium" | "large";
  contrast: "normal" | "high-dark" | "high-light";
  onSpeak?: (text: string) => void;
}

// Font size classes for different sizes
const fontSizeClasses = {
  small: {
    title: "text-2xl",
    date: "text-lg",
    oracle: "text-xl",
    message: "text-lg",
    button: "text-lg p-4",
  },
  medium: {
    title: "text-3xl",
    date: "text-xl",
    oracle: "text-2xl",
    message: "text-xl",
    button: "text-xl p-5",
  },
  large: {
    title: "text-4xl",
    date: "text-2xl",
    oracle: "text-3xl",
    message: "text-2xl",
    button: "text-2xl p-6",
  },
};

export function SimpleHistory({ isOpen, onClose, fontSize, contrast, onSpeak }: SimpleHistoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sizes = fontSizeClasses[fontSize];

  // Fetch chat history
  const { data: historyData, isLoading } = trpc.chat.getHistory.useQuery(
    { limit: 20 },
    { enabled: isOpen }
  );

  if (!isOpen) return null;

  // Group messages by session (each log entry contains both user and assistant messages)
  const sessions: Array<{
    oracleId: string;
    oracleName: string;
    date: Date;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  }> = [];

  if (historyData && Array.isArray(historyData)) {
    historyData.forEach((log) => {
      const oracle = getOracleById(log.oracleId);
      sessions.push({
        oracleId: log.oracleId,
        oracleName: oracle?.name || "占い師",
        date: new Date(log.createdAt),
        messages: [
          { role: "user", content: log.userMessage },
          { role: "assistant", content: log.assistantResponse },
        ],
      });
    });
  }

  const currentSession = sessions[currentIndex];
  const hasNext = currentIndex < sessions.length - 1;
  const hasPrev = currentIndex > 0;

  // Get contrast-specific classes
  const getContrastClasses = () => {
    switch (contrast) {
      case "high-dark":
        return {
          bg: "bg-black",
          text: "text-white",
          border: "border-white",
          card: "bg-gray-900 border-white border-2",
          button: "bg-white text-black hover:bg-gray-200",
          muted: "text-gray-300",
          accent: "text-yellow-300",
        };
      case "high-light":
        return {
          bg: "bg-white",
          text: "text-black",
          border: "border-black",
          card: "bg-gray-100 border-black border-2",
          button: "bg-black text-white hover:bg-gray-800",
          muted: "text-gray-700",
          accent: "text-blue-800",
        };
      default:
        return {
          bg: "bg-black/90",
          text: "text-white",
          border: "border-white/20",
          card: "bg-white/10 border-white/20",
          button: "bg-amber-500 text-white hover:bg-amber-400",
          muted: "text-gray-400",
          accent: "text-amber-400",
        };
    }
  };

  const colors = getContrastClasses();

  // Speak the current session
  const handleSpeak = () => {
    if (!currentSession || !onSpeak) return;
    
    const oracleMessage = currentSession.messages.find(m => m.role === "assistant");
    if (oracleMessage) {
      onSpeak(oracleMessage.content);
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col",
      colors.bg,
      colors.text
    )}>
      {/* Header */}
      <header className={cn(
        "p-4 flex items-center justify-between border-b",
        colors.border
      )}>
        <h1 className={cn(sizes.title, "font-bold", colors.accent)}>
          相談履歴
        </h1>
        <Button
          variant="ghost"
          size="lg"
          onClick={onClose}
          className={cn(sizes.button, colors.text)}
        >
          <X className="w-8 h-8 mr-2" />
          閉じる
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className={cn(sizes.message, colors.muted)}>読み込み中...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <History className={cn("w-24 h-24", colors.muted)} />
            <p className={cn(sizes.message, colors.muted)}>
              まだ相談履歴がありません
            </p>
          </div>
        ) : currentSession ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Date and Oracle */}
            <div className="text-center space-y-2">
              <p className={cn(sizes.date, colors.muted)}>
                {format(currentSession.date, "yyyy年M月d日 H時m分", { locale: ja })}
              </p>
              <p className={cn(sizes.oracle, "font-bold", colors.accent)}>
                {currentSession.oracleName}先生
              </p>
            </div>

            {/* Messages */}
            <div className={cn("rounded-2xl p-6 space-y-6", colors.card)}>
              {currentSession.messages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  <p className={cn(
                    "font-bold",
                    sizes.message,
                    msg.role === "user" ? colors.muted : colors.accent
                  )}>
                    {msg.role === "user" ? "あなた" : currentSession.oracleName}
                  </p>
                  <p className={cn(sizes.message, "leading-relaxed")}>
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Speak button */}
            {onSpeak && currentSession.messages.some(m => m.role === "assistant") && (
              <div className="flex justify-center">
                <Button
                  onClick={handleSpeak}
                  className={cn(sizes.button, colors.button, "rounded-full")}
                >
                  <Volume2 className="w-8 h-8 mr-3" />
                  読み上げる
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Navigation Footer */}
      {sessions.length > 0 && (
        <footer className={cn(
          "p-4 flex items-center justify-between border-t",
          colors.border
        )}>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setCurrentIndex(i => i - 1)}
            disabled={!hasPrev}
            className={cn(
              sizes.button,
              hasPrev ? colors.text : "opacity-30"
            )}
          >
            <ChevronLeft className="w-8 h-8 mr-2" />
            前へ
          </Button>
          
          <p className={cn(sizes.date, colors.muted)}>
            {currentIndex + 1} / {sessions.length}
          </p>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setCurrentIndex(i => i + 1)}
            disabled={!hasNext}
            className={cn(
              sizes.button,
              hasNext ? colors.text : "opacity-30"
            )}
          >
            次へ
            <ChevronRight className="w-8 h-8 ml-2" />
          </Button>
        </footer>
      )}
    </div>
  );
}

// Hook for managing history modal
export function useSimpleHistory() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    openHistory: () => setIsOpen(true),
    closeHistory: () => setIsOpen(false),
  };
}
