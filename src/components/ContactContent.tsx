"use client";
import { useState } from "react";
import { StarField } from "@/components/StarField";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Mail, MessageSquare, Loader2, CheckCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

type CategoryType = "general" | "payment" | "technical" | "account" | "feedback" | "other";

const categories: Record<CategoryType, string> = {
  general: "一般的なお問い合わせ",
  payment: "料金・お支払いについて",
  technical: "技術的な問題",
  account: "アカウントについて",
  feedback: "ご意見・ご要望",
  other: "その他",
};

export default function ContactContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<CategoryType | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !category || !message.trim()) return;

    setIsSubmitting(true);

    // メール送信（mailto:リンクを使用）
    const subject = encodeURIComponent(`[六神ノ間] ${categories[category as CategoryType]} - ${name}`);
    const body = encodeURIComponent(
      `【お名前】${name}\n【メールアドレス】${email}\n【カテゴリ】${categories[category as CategoryType]}\n\n【お問い合わせ内容】\n${message}`
    );
    
    // メールクライアントを開く
    window.open(`mailto:sixoracle@gmail.com?subject=${subject}&body=${body}`, "_blank");

    // 送信完了状態にする
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
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-400" />
            <h2 className="text-2xl font-serif font-bold mb-4">送信準備完了</h2>
            <p className="text-gray-400 mb-2">
              メールクライアントが開きます。
            </p>
            <p className="text-gray-400 mb-8 text-sm">
              メールクライアントが開かない場合は、直接 <a href="mailto:sixoracle@gmail.com" className="text-gold hover:underline">sixoracle@gmail.com</a> までお問い合わせください。
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName("");
                  setEmail("");
                  setCategory("");
                  setMessage("");
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
              >
                新しいお問い合わせ
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
          <Mail className="w-12 h-12 mx-auto mb-4 text-gold" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-4">
            お問い合わせ
          </h1>
          <p className="text-gray-400">
            ご質問・ご要望がございましたら、お気軽にお問い合わせください
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ※ 日本語・English 対応
          </p>
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 mb-8 text-center"
        >
          <span className="text-gray-400">
            お問い合わせの前に{" "}
          </span>
          <Link href="/faq" className="text-gold hover:text-gold-dark underline">
            よくある質問
          </Link>
          <span className="text-gray-400">
            {" "}もご確認ください
          </span>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-xl p-8 space-y-6"
        >
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              お名前
              <span className="text-xs text-red-400">必須</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="お名前を入力してください"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              メールアドレス
              <span className="text-xs text-red-400">必須</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="flex items-center gap-2 text-sm font-medium">
              カテゴリ
              <span className="text-xs text-red-400">必須</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              <option value="" disabled className="bg-[#19142d]">カテゴリを選択してください</option>
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key} className="bg-[#19142d]">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium">
              お問い合わせ内容
              <span className="text-xs text-red-400">必須</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="お問い合わせ内容を詳しくお書きください..."
              required
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !category}
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
                送信する
              </>
            )}
          </button>
        </motion.form>

        {/* Direct Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-card rounded-xl p-6 text-center"
        >
          <p className="text-gray-400 text-sm mb-2">直接メールでのお問い合わせ</p>
          <a
            href="mailto:sixoracle@gmail.com"
            className="text-gold hover:text-gold-dark transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            sixoracle@gmail.com
          </a>
        </motion.div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-gold/30 rounded-full transition-colors text-sm"
          >
            トップに戻る
          </Link>
        </div>
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
