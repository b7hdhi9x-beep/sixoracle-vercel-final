"use client";

import { oracles } from "@/lib/oracles";
import { StarField } from "@/components/StarField";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Star,
  Sparkles, Check, ChevronDown, ArrowRight, Hand, Droplet, Cat, Brain,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain,
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative mystical-bg">
      <StarField />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-2xl mb-6">
              <Sparkles className="w-16 h-16 text-mystic-bg" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-4 gradient-text font-serif"
          >
            六神ノ間
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gold mb-4"
          >
            Six Oracle — AI Fortune Telling
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            6人のAI占い師が、あなたの運命を星々から読み解く。
            <br />
            時を超えた叡智と最新の技術が交わる、あなただけの聖域へようこそ。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
              className="btn-primary text-lg px-8 py-4 rounded-full flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isAuthenticated ? "鑑定を始める" : "運命の扉を開く"}
            </button>
            <button
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="text-lg px-8 py-4 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-all"
            >
              鑑定メニューを見る
            </button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-gold/50" />
        </motion.div>
      </section>

      {/* Oracles Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4 gradient-text">導き手たち</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              それぞれの専門分野を持つAI占い師が、多角的な視点からあなたの悩みに寄り添います。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oracles.map((oracle, index) => {
              const Icon = iconMap[oracle.icon];
              return (
                <motion.div
                  key={oracle.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                >
                  <div className="oracle-card h-full p-6 flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center mb-4 shadow-lg overflow-hidden`}
                    >
                      {oracle.avatar ? (
                        <img src={oracle.avatar} alt={oracle.name} className="w-full h-full object-cover" />
                      ) : (
                        Icon && <Icon className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-2xl font-serif text-gold mb-1">{oracle.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                      {oracle.englishName}
                    </p>
                    <p className="text-sm font-medium text-gold/80 mb-2">{oracle.role}</p>
                    <p className="text-sm text-gray-400 leading-relaxed flex-grow">
                      {oracle.description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {oracle.specialty.split("、").map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4 gradient-text">
              運命のサブスクリプション
            </h2>
            <p className="text-gray-400">
              6人の占い師による鑑定を、心ゆくまで。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass-card rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
              <div className="p-8">
                <div className="text-center mb-6">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-sm text-gold mb-4">
                    月額プラン
                  </span>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold gradient-text">¥1,980</span>
                    <span className="text-sm text-gray-400">/ 月 (税込)</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  {[
                    "鑑定回数無制限",
                    "24時間いつでも相談可能",
                    "全占い師を指名可能",
                    "鑑定履歴の保存",
                    "いつでも解約可能",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold text-lg transition-all flex items-center justify-center gap-2"
                >
                  {isAuthenticated ? "鑑定を始める" : "今すぐ申し込む"}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  ※ 無料トライアル: 1日3回まで鑑定可能
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4 gradient-text">よくある質問</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: "AI占いとは何ですか？", a: "最新のAI技術を活用した占いサービスです。6人の個性豊かなAI占い師が、あなたの悩みに24時間いつでも寄り添い、的確なアドバイスを提供します。" },
              { q: "無料で利用できますか？", a: "はい、無料トライアルとして1日3回まで鑑定を受けることができます。より多くの鑑定をご希望の場合は、月額プラン（¥1,980/月）をご検討ください。" },
              { q: "どの占い師に相談すればいいですか？", a: "お悩みの内容に合わせてお選びください。恋愛なら玲蘭、タイミングなら蒼真、性格分析なら朔夜など、それぞれ専門分野があります。" },
              { q: "解約はいつでもできますか？", a: "はい、いつでも解約可能です。解約後も期間内はサービスをご利用いただけます。" },
            ].map((faq, i) => (
              <details key={i} className="glass-card rounded-lg group">
                <summary className="p-4 cursor-pointer text-gray-200 hover:text-gold transition-colors flex items-center justify-between">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-gold/50 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-400">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-gray-800/50 bg-black/30 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-gold" />
            <span className="text-xl font-serif font-bold gradient-text">六神ノ間</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-6">
            <a href="/terms" className="hover:text-gold transition-colors">利用規約</a>
            <a href="/privacy" className="hover:text-gold transition-colors">プライバシーポリシー</a>
            <a href="/legal" className="hover:text-gold transition-colors">特定商取引法に基づく表記</a>
          </div>
          <p className="text-xs text-gray-600">© 2026 Six Oracle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
