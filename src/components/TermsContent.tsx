"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsContent() {
  return (
    <div className="min-h-screen mystical-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          トップに戻る
        </Link>
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-serif gradient-text mb-6">利用規約</h1>
          <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
            <p>本利用規約（以下「本規約」）は、六神ノ間（以下「本サービス」）の利用条件を定めるものです。</p>
            <h2 className="text-lg text-gold mt-6">第1条（適用）</h2>
            <p>本規約は、ユーザーと本サービスとの間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>
            <h2 className="text-lg text-gold mt-6">第2条（サービス内容）</h2>
            <p>本サービスは、AI技術を活用した占いエンターテインメントサービスです。提供される占い結果は参考情報であり、医療・法律・金融等の専門的なアドバイスに代わるものではありません。</p>
            <h2 className="text-lg text-gold mt-6">第3条（料金）</h2>
            <p>月額プラン: ¥1,980（税込）/ 月。無料トライアル: 1日3回まで鑑定可能。</p>
            <h2 className="text-lg text-gold mt-6">第4条（解約）</h2>
            <p>有料プランはいつでも解約可能です。解約後も期間終了まではサービスをご利用いただけます。</p>
            <h2 className="text-lg text-gold mt-6">第5条（免責事項）</h2>
            <p>本サービスの占い結果に基づく行動により生じた損害について、当方は一切の責任を負いません。</p>
            <p className="text-gray-500 mt-8 text-xs">最終更新日: 2026年2月1日</p>
          </div>
        </div>
      </div>
    </div>
  );
}
