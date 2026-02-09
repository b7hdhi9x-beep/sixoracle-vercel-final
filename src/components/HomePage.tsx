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
import { useState } from "react";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain,
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "新しく占い師を追加しました！", a: "六神ノ間は創設時の6人の占い師から始まりました。「六神」の名はこの創設メンバーに由来しており、屋号は変わりません。その後、新たに5人の占い師が加わりました：紫苑（手相）、星蘭（西洋占星術）、緋月（血液型）、獣牙（動物占い）、心理（MBTI）。現在は11人体制で、今後も新しい占い師を追加していきますが、「六神ノ間」の屋号はそのままです。" },
    { q: "AI占いとは何ですか？", a: "最新のAI技術を活用した占いサービスです。11人の個性豊かなAI占い師が、あなたの悩みに24時間いつでも寄り添い、的確なアドバイスを提供します。" },
    { q: "料金はいくらですか？", a: "月額¥1,980（税込）で、全11人のAI占い師に鑑定回数無制限でご相談いただけます。一般的な占いサービスでは1回3,000〜10,000円ですので、非常にお得です。" },
    { q: "どの占い師に相談すればいいですか？", a: "お悩みの内容に合わせてお選びください。恋愛なら玲蘭、タイミングなら蒼真、性格分析なら朔夜、MBTI診断なら心理など、それぞれ専門分野があります。" },
    { q: "解約はいつでもできますか？", a: "はい、いつでも解約可能です。解約後も期間内はサービスをご利用いただけます。" },
    { q: "占いの精度はどのくらいですか？", a: "最新のAI技術を活用し、各占い師が専門的な知識に基づいてアドバイスを行います。エンターテインメントとしてお楽しみいただきつつ、実用的なアドバイスも含まれています。" },
  ];

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo-final-web.png"
              alt="六神ノ間"
              className="w-full max-w-xs md:max-w-md mx-auto"
            />
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
            11人のAI占い師が、あなたの運命を星々から読み解く。
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

      {/* Oracles Section - Card with full image */}
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
                  <div
                    className="oracle-card h-full overflow-hidden group cursor-pointer"
                    onClick={() => router.push(isAuthenticated ? `/dashboard?oracle=${oracle.id}` : "/login")}
                  >
                    {/* NEW Badge */}
                    {oracle.isNew && (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold shadow-lg animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          NEW
                        </span>
                      </div>
                    )}
                    {/* Oracle Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={oracle.image}
                        alt={oracle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-serif text-gold mb-0.5">{oracle.name}</h3>
                        <p className="text-xs uppercase tracking-widest text-gray-300">
                          {oracle.englishName}
                        </p>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center shadow-lg`}>
                          {Icon && <Icon className="w-5 h-5 text-white" />}
                        </div>
                      </div>
                    </div>
                    {/* Oracle Info */}
                    <div className="p-5">
                      <p className="text-sm font-medium text-gold/80 mb-2">{oracle.role}</p>
                      <p className="text-sm text-gray-400 leading-relaxed mb-3">
                        {oracle.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {oracle.specialty.split("、").map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* Profile Link */}
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/oracle/${oracle.id}`); }}
                          className="text-xs text-gold/60 hover:text-gold transition-colors"
                        >
                          詳しく見る →
                        </button>
                      </div>
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
        <div className="max-w-4xl mx-auto px-4">
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
              11人の占い師による鑑定を、心ゆくまで。
            </p>
          </motion.div>

          <div className="max-w-lg mx-auto">
            {/* Single Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="glass-card rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
                <div className="p-10">
                  <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-sm text-gold mb-4">
                      月額プラン
                    </span>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold gradient-text">¥1,980</span>
                      <span className="text-sm text-gray-400">/ 月 (税込)</span>
                    </div>
                    <p className="text-sm text-gray-400">11人のAI占い師に、いつでも何度でも相談可能</p>
                  </div>
                  <div className="space-y-3 mb-8 text-sm">
                    {[
                      "鑑定回数無制限",
                      "全11人の占い師に相談可能",
                      "24時間いつでも利用可能",
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
                    お支払い方法：銀行振込のみ
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    ※ いつでも解約可能です
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Value Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-8 p-6 glass-card rounded-xl border border-gold/30 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-gold font-semibold mb-1">
                  単発鑑定1回分の料金で、1ヶ月間使い放題！
                </p>
                <p className="text-sm text-gray-400">
                  一般的な占いサービスでは1回3,000～10,000円。Six Oracleなら鑑定回数無制限で使い放題！
                </p>
              </div>
              <button
                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                className="shrink-0 px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold flex items-center gap-2 transition-all"
              >
                ログイン
                <ArrowRight className="w-5 h-5" />
              </button>
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
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 text-left text-gray-200 hover:text-gold transition-colors flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gold/50 transition-transform duration-300 flex-shrink-0 ml-2 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-400 animate-fadeIn">{faq.a}</div>
                )}
              </div>
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
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-4">
            <a href="/faq" className="hover:text-gold transition-colors">よくある質問</a>
            <a href="/help" className="hover:text-gold transition-colors">ヘルプガイド</a>
            <a href="/contact" className="hover:text-gold transition-colors">お問い合わせ</a>
            <a href="/feedback" className="hover:text-gold transition-colors">意見箱</a>
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
