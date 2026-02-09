"use client";
import { useState } from "react";
import { StarField } from "@/components/StarField";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Send, Loader2, CheckCircle, Star, ThumbsUp, Lightbulb, Bug, Heart } from "lucide-react";
import Link from "next/link";

type FeedbackType = "praise" | "suggestion" | "bug" | "other";

const feedbackTypes: { id: FeedbackType; label: string; icon: any; description: string }[] = [
  { id: "praise", label: "良かった点", icon: ThumbsUp, description: "サービスの良い点を教えてください" },
  { id: "suggestion", label: "改善提案", icon: Lightbulb, description: "こうなったらいいなという提案" },
  { id: "bug", label: "不具合報告", icon: Bug, description: "問題や不具合を報告" },
  { id: "other", label: "その他", icon: MessageSquare, description: "その他のご意見" },
];

export default function FeedbackContent() {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !message.trim()) return;

    setIsSubmitting(true);

    // メール送信（mailto:リンクを使用）
    const typeLabel = feedbackTypes.find(t => t.id === selectedType)?.label || "";
    const subject = encodeURIComponent(`[六神ノ間 意見箱] ${typeLabel}`);
    const body = encodeURIComponent(
      `【フィードバック種別】${typeLabel}\n【満足度】${"★".repeat(rating)}${"☆".repeat(5 - rating)}（${rating}/5）\n\n【内容】\n${message}`
    );
    
    window.open(`mailto:sixoracle@gmail.com?subject=${subject}&body=${body}`, "_blank");

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0f0a1e] text-white relative overflow-hidden">
        <StarField />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-12 text-center max-w-md w-full"
          >
            <Heart className="w-16 h-16 mx-auto mb-6 text-pink-400" />
            <h2 className="text-2xl font-serif font-bold mb-4">ありがとうございます！</h2>
            <p className="text-gray-400 mb-2">
              貴重なご意見をいただきありがとうございます。
            </p>
            <p className="text-gray-400 mb-8 text-sm">
              メールクライアントが開きます。送信ボタンを押してお送りください。
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSelectedType(null);
                  setRating(0);
                  setMessage("");
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
              >
                別のフィードバックを送る
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gold hover:bg-gold-dark text-black font-medium rounded-full transition-colors text-center"
              >
                トップに戻る
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white relative overflow-hidden">
      <StarField />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0a1e]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            トップに戻る
          </Link>
        </div>
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gold" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-4">
            意見箱
          </h1>
          <p className="text-gray-400">
            サービスの改善に向けて、皆様のご意見をお聞かせください
          </p>
          <p className="text-sm text-gray-500 mt-2">
            いただいたフィードバックは全て目を通しております
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">フィードバックの種類</label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedType === type.id
                        ? "border-gold bg-gold/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${selectedType === type.id ? "text-gold" : "text-gray-400"}`} />
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">サービスの満足度</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-400 ml-2">
                  {rating === 1 && "改善が必要"}
                  {rating === 2 && "やや不満"}
                  {rating === 3 && "普通"}
                  {rating === 4 && "満足"}
                  {rating === 5 && "とても満足"}
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <label htmlFor="feedback-message" className="flex items-center gap-2 text-sm font-medium text-gray-300">
              ご意見・ご感想
              <span className="text-xs text-red-400">必須</span>
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                selectedType === "praise"
                  ? "どのような点が良かったですか？"
                  : selectedType === "suggestion"
                  ? "どのような改善を希望されますか？"
                  : selectedType === "bug"
                  ? "どのような問題が発生しましたか？（使用デバイス・ブラウザも教えてください）"
                  : "ご自由にお書きください..."
              }
              required
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedType || !message.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-black font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                フィードバックを送信
              </>
            )}
          </button>
        </motion.form>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">© 2026 Six Oracle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
