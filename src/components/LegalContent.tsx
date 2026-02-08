"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LegalContent() {
  return (
    <div className="min-h-screen mystical-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          トップに戻る
        </Link>
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-serif gradient-text mb-6">特定商取引法に基づく表記</h1>
          <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 pr-4 text-gold font-medium whitespace-nowrap">販売事業者</td>
                  <td className="py-3">Six Oracle</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 pr-4 text-gold font-medium whitespace-nowrap">サービス名</td>
                  <td className="py-3">六神ノ間（Six Oracle）</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 pr-4 text-gold font-medium whitespace-nowrap">販売価格</td>
                  <td className="py-3">月額 ¥1,980（税込）</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 pr-4 text-gold font-medium whitespace-nowrap">支払方法</td>
                  <td className="py-3">クレジットカード（Stripe決済）</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 pr-4 text-gold font-medium whitespace-nowrap">サービス提供時期</td>
                  <td className="py-3">お支払い確認後、即時利用可能</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 pr-4 text-gold font-medium whitespace-nowrap">解約・返金</td>
                  <td className="py-3">いつでも解約可能。日割り返金はありません。</td>
                </tr>
              </tbody>
            </table>
            <p className="text-gray-500 mt-8 text-xs">最終更新日: 2026年2月1日</p>
          </div>
        </div>
      </div>
    </div>
  );
}
