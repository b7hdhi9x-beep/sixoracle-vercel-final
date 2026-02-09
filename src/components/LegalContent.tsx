"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LegalContent() {
  return (
    <div className="min-h-screen mystical-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          トップに戻る
        </Link>
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl md:text-3xl font-serif gradient-text mb-8">特定商取引法に基づく表記</h1>
          <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top w-1/3">販売業者</td>
                  <td className="py-4">六神ノ間運営事務局</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">運営責任者</td>
                  <td className="py-4">武部啓作</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">所在地</td>
                  <td className="py-4">〒162-0066 東京都新宿区市谷台町1-3-304</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">電話番号</td>
                  <td className="py-4">090-9343-1571</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">メールアドレス</td>
                  <td className="py-4">b7hdhi9x@icloud.com</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">サービス内容</td>
                  <td className="py-4">
                    <strong>デジタルコンパニオンサービス「六神ノ間」</strong><br/><br/>
                    当サービスは、AI技術を活用した「デジタルコンパニオン」サービスです。
                    個性豊かなAIキャラクター（六神）との対話を通じて、
                    日常の出来事の共有、心の整理、自己内省のサポートを提供します。<br/><br/>
                    <strong>【サービスの特徴】</strong><br/>
                    ・AIキャラクターとの対話による心理的サポート<br/>
                    ・日常の出来事を六神の視点で肯定的に捉え直す機能<br/>
                    ・継続利用による親密度システムと特典解放<br/>
                    ・重要な暦（節分、新月等）や記念日に合わせたメッセージ配信<br/>
                    ・会話履歴の記憶による継続的なサポート<br/><br/>
                    <strong className="text-amber-400">【重要なお知らせ】</strong><br/>
                    <span className="text-amber-300">
                    本サービスは娯楽・エンターテインメントを目的としたAIチャットサービスです。
                    占い・鑑定の結果は、AIが生成したフィクションであり、
                    実際の運勢や未来を予測・保証するものではありません。
                    重要な人生の決断については、専門家にご相談ください。
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">販売価格</td>
                  <td className="py-4">
                    <strong>月額プラン</strong>：1,980円（税込）<br/>
                    ・対話回数無制限<br/>
                    ・全占い師（11人以上）に相談可能<br/>
                    ・全機能利用可能（音声入力・画像鑑定等）<br/>
                    ・親密度システム・特典解放機能<br/>
                    ・鑑定履歴の無期限保存<br/>
                    ・24時間いつでも相談可能<br/>
                    ・有効期間：30日間
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">商品代金以外の必要料金</td>
                  <td className="py-4">
                    インターネット接続料金、通信料金等はお客様のご負担となります。<br/>
                    銀行振込の場合、振込手数料はお客様のご負担となります。
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">支払方法</td>
                  <td className="py-4">
                    <strong>銀行振込のみ</strong><br/><br/>
                    【振込先口座】
                    <table className="mt-2 mb-4 text-sm">
                      <tbody>
                        <tr>
                          <td className="pr-4 py-1">金融機関名</td>
                          <td>楽天銀行（金融機関コード：0036）</td>
                        </tr>
                        <tr>
                          <td className="pr-4 py-1">支店名</td>
                          <td>エンカ支店（支店コード：216）</td>
                        </tr>
                        <tr>
                          <td className="pr-4 py-1">預金種別</td>
                          <td>普通預金</td>
                        </tr>
                        <tr>
                          <td className="pr-4 py-1">口座番号</td>
                          <td>1479015</td>
                        </tr>
                        <tr>
                          <td className="pr-4 py-1">口座名義</td>
                          <td>タケベケイサク</td>
                        </tr>
                      </tbody>
                    </table>
                    ※振込時は、お名前の前に会員番号（ログイン後に確認可能）を記載してください。<br/>
                    ※クレジットカード決済には対応しておりません。
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">支払時期</td>
                  <td className="py-4">
                    前払い（振込確認後にサービス提供）<br/>
                    ※振込確認後、通常1営業日以内に利用開始のご案内をお送りします。<br/>
                    ※土日祝日の振込確認は翌営業日となります。
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">サービス提供時期</td>
                  <td className="py-4">
                    銀行振込確認後、合言葉を発行し、即時ご利用いただけます。
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">解約・退会方法</td>
                  <td className="py-4">
                    【解約手順】<br/>
                    1. ログイン後、ダッシュボードのメニューから「プラン・お支払い」を選択<br/>
                    2. 「プランを解約する」ボタンをクリック<br/>
                    3. 確認画面で「解約を確定」をクリック<br/><br/>
                    ※解約後も有効期間終了日までサービスをご利用いただけます。<br/>
                    ※解約はいつでも可能で、違約金等は一切発生しません。<br/>
                    ※月額プランは自動更新されません。継続利用には再度お振込みが必要です。<br/><br/>
                    <strong className="text-red-400">【重要な注意事項】</strong><br/>
                    <span className="text-red-300">一度解約すると、親密度・継続特典はリセットされ、最初からのカウントとなります。</span><br/>
                    <span className="text-red-300">当サービスはシステムで全ての利用履歴を管理しており、不正な継続カウントの操作は不可能です。</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">返品・返金</td>
                  <td className="py-4">
                    デジタルコンテンツの性質上、購入後の返金・返品はお受けしておりません。<br/><br/>
                    ただし、以下の場合は返金対応いたします：<br/>
                    ・二重振込等の明らかな誤入金の場合<br/>
                    ・サービス提供前にキャンセルのお申し出があった場合<br/><br/>
                    ※返金時の振込手数料はお客様のご負担となります。
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">免責事項</td>
                  <td className="py-4">
                    <strong>【サービスの性質について】</strong><br/>
                    本サービスは、AI技術を活用したエンターテインメント・娯楽サービスです。
                    AIキャラクターによる対話内容（占い・鑑定を含む）は、
                    すべてAIが生成したフィクションであり、
                    実際の運勢、未来、事実を予測・保証するものではありません。<br/><br/>
                    <strong>【利用上の注意】</strong><br/>
                    ・本サービスは医療、法律、金融等の専門的なアドバイスを提供するものではありません<br/>
                    ・重要な人生の決断については、必ず専門家にご相談ください<br/>
                    ・AIの回答内容に基づいて行動した結果について、当社は一切の責任を負いません<br/>
                    ・本サービスは18歳以上の方を対象としています
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 pr-4 text-gold font-medium whitespace-nowrap align-top">動作環境</td>
                  <td className="py-4">
                    【推奨ブラウザ】<br/>
                    ・Google Chrome（最新版）<br/>
                    ・Safari（最新版）<br/>
                    ・Firefox（最新版）<br/>
                    ・Microsoft Edge（最新版）<br/><br/>
                    【推奨環境】<br/>
                    ・インターネット接続環境<br/>
                    ・JavaScript有効
                  </td>
                </tr>
              </tbody>
            </table>
            
            <p className="text-gray-500 mt-8 text-xs">
              最終更新日：2026年2月4日
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
