"use client";

import { getOracleById, oracles } from "@/lib/oracles";
import { StarField } from "@/components/StarField";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Star,
  Sparkles, ArrowLeft, ArrowRight, Hand, Droplet, Cat, Brain,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain,
};

export default function OracleProfileContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const oracleId = params.id as string;
  const oracle = getOracleById(oracleId);

  if (!oracle) {
    return (
      <div className="min-h-screen bg-[#0a0515] flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-serif gradient-text mb-4">占い師が見つかりません</h1>
          <p className="text-gray-400 mb-8">指定された占い師は存在しません。</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[oracle.icon];
  const currentIndex = oracles.findIndex(o => o.id === oracle.id);
  const prevOracle = currentIndex > 0 ? oracles[currentIndex - 1] : null;
  const nextOracle = currentIndex < oracles.length - 1 ? oracles[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0515] relative">
      <StarField />

      {/* Back Button */}
      <div className="relative z-10 pt-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>ホームに戻る</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row gap-8 items-center md:items-start"
          >
            {/* Oracle Image */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={oracle.image}
                  alt={oracle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {oracle.isNew && (
                <div className="absolute -top-3 -right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-sm font-bold shadow-lg animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    NEW
                  </span>
                </div>
              )}
            </div>

            {/* Oracle Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center shadow-lg`}>
                  {Icon && <Icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif gradient-text">{oracle.name}</h1>
                  <p className="text-sm uppercase tracking-widest text-gray-400">{oracle.englishName}</p>
                </div>
              </div>

              <p className="text-gold/80 font-medium text-lg mb-4 mt-4">{oracle.role}</p>
              <p className="text-gray-300 leading-relaxed mb-6">{oracle.description}</p>

              {/* Specialty Tags */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {oracle.specialty.split("、").map((tag, i) => (
                  <span
                    key={i}
                    className="text-sm px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => router.push(isAuthenticated ? `/dashboard?oracle=${oracle.id}` : "/login")}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold text-lg transition-all flex items-center gap-2 mx-auto md:mx-0"
              >
                {oracle.name}に相談する
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Profile Section */}
      {oracle.detailedProfile && (
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card rounded-2xl p-8"
            >
              <h2 className="text-2xl font-serif gradient-text mb-6">プロフィール</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{oracle.detailedProfile}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Navigation to Other Oracles */}
      <section className="relative z-10 py-12 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            {prevOracle ? (
              <button
                onClick={() => router.push(`/oracle/${prevOracle.id}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{prevOracle.name}</span>
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-gold transition-colors text-sm"
            >
              全ての占い師を見る
            </button>
            {nextOracle ? (
              <button
                onClick={() => router.push(`/oracle/${nextOracle.id}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors"
              >
                <span className="hidden sm:inline">{nextOracle.name}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
