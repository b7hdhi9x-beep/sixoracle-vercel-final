import { useState, useEffect } from "react";
import { getOracleById } from "@/lib/oracles";
import { Sparkles, X, ChevronDown } from "lucide-react";

interface ReadingCompleteNotificationProps {
  oracleId: string | null;
  show: boolean;
  onDismiss: () => void;
  onScrollToResult?: () => void;
}

export function ReadingCompleteNotification({
  oracleId,
  show,
  onDismiss,
  onScrollToResult,
}: ReadingCompleteNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const oracle = oracleId ? getOracleById(oracleId) : null;
  const oracleName = oracle?.name || "占い師";

  // Color mapping for each oracle
  const getOracleColors = (id: string | null) => {
    switch (id) {
      case "souma":
        return {
          bg: "from-blue-600/95 to-indigo-800/95",
          border: "border-blue-400/50",
          glow: "shadow-blue-500/30",
          text: "text-blue-100",
          accent: "text-blue-200",
        };
      case "kohana":
        return {
          bg: "from-pink-500/95 to-rose-700/95",
          border: "border-pink-400/50",
          glow: "shadow-pink-500/30",
          text: "text-pink-100",
          accent: "text-pink-200",
        };
      case "reiga":
        return {
          bg: "from-emerald-600/95 to-teal-800/95",
          border: "border-emerald-400/50",
          glow: "shadow-emerald-500/30",
          text: "text-emerald-100",
          accent: "text-emerald-200",
        };
      case "hikaru":
        return {
          bg: "from-amber-500/95 to-orange-700/95",
          border: "border-amber-400/50",
          glow: "shadow-amber-500/30",
          text: "text-amber-100",
          accent: "text-amber-200",
        };
      case "shion":
        return {
          bg: "from-purple-600/95 to-violet-800/95",
          border: "border-purple-400/50",
          glow: "shadow-purple-500/30",
          text: "text-purple-100",
          accent: "text-purple-200",
        };
      case "juga":
        return {
          bg: "from-slate-600/95 to-gray-800/95",
          border: "border-slate-400/50",
          glow: "shadow-slate-500/30",
          text: "text-slate-100",
          accent: "text-slate-200",
        };
      case "shinri":
        return {
          bg: "from-cyan-600/95 to-blue-800/95",
          border: "border-cyan-400/50",
          glow: "shadow-cyan-500/30",
          text: "text-cyan-100",
          accent: "text-cyan-200",
        };
      default:
        return {
          bg: "from-purple-600/95 to-indigo-800/95",
          border: "border-purple-400/50",
          glow: "shadow-purple-500/30",
          text: "text-purple-100",
          accent: "text-purple-200",
        };
    }
  };

  const colors = getOracleColors(oracleId);

  useEffect(() => {
    if (show) {
      setIsExiting(false);
      // Small delay for entrance animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 8000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onDismiss();
    }, 400);
  };

  const handleScrollToResult = () => {
    onScrollToResult?.();
    handleDismiss();
  };

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4 pointer-events-none transition-all duration-500 ease-out ${
        isVisible && !isExiting
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div
        className={`
          pointer-events-auto
          max-w-lg w-full
          bg-gradient-to-r ${colors.bg}
          ${colors.border} border
          rounded-2xl
          shadow-2xl ${colors.glow}
          backdrop-blur-xl
          overflow-hidden
          cursor-pointer
        `}
        onClick={handleScrollToResult}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "shimmer 2s infinite",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative p-4 flex items-center gap-4">
          {/* Oracle icon with pulse */}
          <div className="relative flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-white/40 animate-ping" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`text-base font-bold text-white mb-0.5`}>
              {oracleName}からの鑑定結果が届きました
            </p>
            <p className={`text-sm ${colors.accent} flex items-center gap-1`}>
              <ChevronDown className="w-4 h-4 animate-bounce" />
              タップして結果を確認
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-white/40 rounded-full"
            style={{
              animation: "shrink 8s linear forwards",
            }}
          />
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shrink {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
