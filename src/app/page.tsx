"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { oracles } from "@/lib/oracles";
import { Button } from "@/components/ui/button";

function StarField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }}
        />
      ))}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="space-y-6"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-[#a855f7] text-sm tracking-[0.3em] uppercase font-[var(--font-cinzel)]"
        >
          Divine Fortune Telling
        </motion.p>

        <h1 className="font-[var(--font-cinzel)] text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider">
          <span className="text-[#d4af37] glow-gold">六神ノ間</span>
        </h1>

        <p className="font-[var(--font-noto-serif-jp)] text-xl md:text-2xl text-[#d4af37]/80 tracking-widest">
          ─ Six Oracle ─
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-[#9ca3af] text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          11人のAI占い師が、あなたの運命を多角的に紐解きます。
          <br />
          四柱推命・易経・タロット・西洋占星術……
          <br />
          古今東西の叡智が、ここに集結。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="pt-8"
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-[#d4af37] hover:bg-[#f4d03f] text-[#0a0a1a] font-bold text-lg px-10 py-6 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            >
              占いの間へ入る
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 animate-bounce"
      >
        <svg
          className="w-6 h-6 text-[#d4af37]/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}

function OracleCard({
  oracle,
  index,
}: {
  oracle: (typeof oracles)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Link href={`/dashboard/chat/${oracle.id}`}>
        <div className="glass-card rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] group h-full">
          <div className="flex items-start gap-4">
            <div
              className="text-4xl w-14 h-14 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${oracle.gradientFrom}, ${oracle.gradientTo})`,
              }}
            >
              {oracle.icon}
            </div>
            <div className="space-y-2 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3
                  className="font-[var(--font-noto-serif-jp)] text-xl font-bold"
                  style={{ color: oracle.color }}
                >
                  {oracle.name}
                </h3>
                <span className="text-xs text-[#9ca3af]">
                  {oracle.nameReading}
                </span>
              </div>
              <p className="text-xs text-[#d4af37]/70 tracking-wider">
                {oracle.title}
              </p>
              <p className="text-sm text-[#9ca3af] leading-relaxed line-clamp-2">
                {oracle.description}
              </p>
              <div className="pt-1">
                <span className="text-xs px-2 py-1 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">
                  {oracle.specialty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function OraclesSection() {
  return (
    <section className="py-20 px-4" id="oracles">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-[var(--font-cinzel)] text-3xl md:text-4xl font-bold text-[#d4af37] glow-gold tracking-wider">
            The Eleven Oracles
          </h2>
          <p className="font-[var(--font-noto-serif-jp)] text-lg text-[#9ca3af]">
            ─ 十一柱の神託者たち ─
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oracles.map((oracle, index) => (
            <OracleCard key={oracle.id} oracle={oracle} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-20 px-4" id="pricing">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="font-[var(--font-cinzel)] text-3xl md:text-4xl font-bold text-[#d4af37] glow-gold tracking-wider">
            Pricing
          </h2>
          <p className="font-[var(--font-noto-serif-jp)] text-lg text-[#9ca3af]">
            ─ 料金 ─
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-lg mx-auto"
        >
          <p className="text-[#a855f7] text-sm tracking-widest mb-4 font-[var(--font-cinzel)]">
            MONTHLY PLAN
          </p>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-5xl md:text-6xl font-bold text-[#d4af37] glow-gold">
              1,980
            </span>
            <span className="text-xl text-[#9ca3af]">円/月</span>
          </div>
          <p className="text-xs text-[#9ca3af] mb-8">（税込）</p>

          <div className="space-y-4 text-left mb-10">
            {[
              "11人すべてのAI占い師と無制限チャット",
              "四柱推命・タロット・西洋占星術など多彩な占術",
              "24時間いつでも鑑定可能",
              "チャット履歴の保存・閲覧",
              "初回3日間無料トライアル",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#d4af37] shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[#e5e7eb] text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Link href="/dashboard">
            <Button
              size="lg"
              className="w-full bg-[#d4af37] hover:bg-[#f4d03f] text-[#0a0a1a] font-bold text-lg py-6 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
            >
              無料で試してみる
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-[rgba(212,175,55,0.1)]">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        <h3 className="font-[var(--font-cinzel)] text-xl text-[#d4af37]/70 tracking-wider">
          六神ノ間
        </h3>
        <p className="text-xs text-[#9ca3af]">
          本サービスはエンターテインメントを目的としたAI占いです。
          <br />
          鑑定結果は参考情報であり、重要な決断の際は専門家にご相談ください。
        </p>
        <p className="text-xs text-[#9ca3af]/50">
          &copy; 2025 六神ノ間 ─ Six Oracle. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="relative">
      <StarField />
      <HeroSection />
      <OraclesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
