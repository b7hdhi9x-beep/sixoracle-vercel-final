"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyContent() {
  return (
    <div className="min-h-screen mystical-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          トップに戻る
        </Link>
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-serif gradient-text mb-6">プライバシーポリシー</h1>
          <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
            <p>六神ノ間（以下「本サービス」）は、ユーザーの個人情報の保護を重要と考えています。</p>
            <h2 className="text-lg text-gold mt-6">収集する情報</h2>
            <p>本サービスでは、以下の情報を収集する場合があります：電話番号（認証用）、チャット履歴（ローカル保存）、利用状況データ。</p>
            <h2 className="text-lg text-gold mt-6">情報の利用目的</h2>
            <p>収集した情報は、サービスの提供・改善、ユーザーサポート、利用状況の分析に利用します。</p>
            <h2 className="text-lg text-gold mt-6">データの保管</h2>
            <p>チャット履歴はユーザーのブラウザ（LocalStorage）に保存され、サーバーには送信されません。</p>
            <h2 className="text-lg text-gold mt-6">第三者提供</h2>
            <p>法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。</p>
            <p className="text-gray-500 mt-8 text-xs">最終更新日: 2026年2月1日</p>
          </div>
        </div>
      </div>
    </div>
  );
}
