"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsContent() {
  return (
    <div className="min-h-screen mystical-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          トップに戻る
        </Link>
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl md:text-3xl font-serif gradient-text mb-8">利用規約</h1>
          
          {/* 重要な免責事項 - 目立つ位置に配置 */}
          <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
              ⚠️ 重要なお知らせ
            </h2>
            <p className="text-amber-100 leading-relaxed font-medium text-sm">
              本サービスは<strong>娯楽・エンターテインメントを目的としたデジタルコンパニオンサービス</strong>です。
              AIキャラクターによる対話内容（占い・鑑定を含む）は、すべてAIが生成したフィクションであり、
              <strong>実際の運勢や未来を予測・保証するものではありません</strong>。
              重要な人生の決断については、必ず専門家にご相談ください。
            </p>
          </div>
          
          <div className="text-gray-300 space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第1条（適用）</h2>
              <p>
                本規約は、六神ノ間運営事務局（以下「当社」）が提供するデジタルコンパニオンサービス「六神ノ間」
                （以下「本サービス」）の利用条件を定めるものです。
                ユーザーは本規約に同意した上で本サービスを利用するものとします。
              </p>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第2条（サービスの定義）</h2>
              <p>
                本サービスは、AI技術を活用した「デジタルコンパニオン」サービスです。
                個性豊かなAIキャラクター（六神）との対話を通じて、以下の体験を提供します：
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>AIキャラクターとの対話による心理的サポート</li>
                <li>日常の出来事を六神の視点で肯定的に捉え直す機能</li>
                <li>継続利用による親密度システムと特典解放</li>
                <li>重要な暦（節分、新月等）や記念日に合わせたメッセージ配信</li>
                <li>会話履歴の記憶による継続的なサポート</li>
                <li>占い・鑑定風のエンターテインメント体験</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第3条（AI生成コンテンツに関する免責）</h2>
              <p>
                本サービスで提供される対話内容（占い・鑑定を含む）は、人工知能（AI）によって生成されたものです。
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>AI生成コンテンツには、事実と異なる情報（ハルシネーション）が含まれる可能性があります</li>
                <li>占い・鑑定の結果は、AIが生成したフィクションであり、実際の運勢や未来を予測するものではありません</li>
                <li>当社は、AI生成コンテンツの正確性、完全性、有用性について一切の保証を行いません</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第4条（エンターテインメント目的）</h2>
              <p>
                本サービスは娯楽・エンターテインメント目的で提供されるものであり、以下の点にご注意ください：
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>AIキャラクターの発言は、すべてフィクションです</li>
                <li>占い・鑑定の結果は、将来の出来事を確約するものではありません</li>
                <li>対話内容に基づく行動や決定は、ユーザー自身の責任において行ってください</li>
                <li>当社は、対話内容に基づく行動によって生じたいかなる損害についても責任を負いません</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第5条（医療・法律・金融アドバイスの禁止）</h2>
              <p>
                本サービスは、医療、法律、金融に関する専門的なアドバイスを提供するものではありません。
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>健康上の問題については、医師や医療専門家にご相談ください</li>
                <li>法的問題については、弁護士や法律専門家にご相談ください</li>
                <li>投資判断については、ファイナンシャルアドバイザーや金融専門家にご相談ください</li>
                <li>本サービスの対話内容を、専門的なアドバイスの代替として使用しないでください</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第6条（親密度システムと特典）</h2>
              <p>
                本サービスでは、継続利用に応じて親密度が上昇し、特典が解放されるシステムを提供しています。
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>親密度は、ログイン日数や対話回数に応じて上昇します</li>
                <li>親密度レベルに応じて、特別な機能や演出が解放されます</li>
                <li>解約すると、親密度はリセットされます</li>
                <li>親密度システムの仕様は、予告なく変更される場合があります</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第7条（記憶機能について）</h2>
              <p>
                本サービスでは、継続的なサポートのため、AIキャラクターが過去の会話内容を記憶する機能を提供しています。
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>会話履歴は、より良い対話体験のために保存・活用されます</li>
                <li>会話サマリーは、AIによって自動生成されます</li>
                <li>記憶機能の精度は完全ではなく、誤りが含まれる場合があります</li>
                <li>ユーザーは、会話履歴の削除を請求することができます</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第8条（料金および支払い）</h2>
              <p>
                本サービスの料金体系は以下の通りです：
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>月額プラン：1,980円（税込）・対話回数無制限・全占い師（11人以上）に相談可能・全機能利用可能・有効期間：30日間</li>
              </ul>
              <div className="mt-4">
                <strong>支払方法：銀行振込のみ</strong><br/><br/>
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
                振込確認後、合言葉を発行いたします。<br/>
                振込手数料はお客様のご負担となります。<br/>
                月額プランは自動更新されません。継続利用には再度お振込みが必要です。
              </div>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第9条（返金規定）</h2>
              <p>
                本サービスはデジタルコンテンツの性質上、原則として返金には応じかねます。
                ただし、以下の場合は返金対応いたします：
              </p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li>二重振込等の明らかな誤入金の場合</li>
                <li>サービス提供前にキャンセルのお申し出があった場合</li>
                <li>技術的な問題によりサービスが提供できなかった場合</li>
              </ul>
              <p className="mt-3">
                返金時の振込手数料はお客様のご負担となります。
              </p>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第10条（解約）</h2>
              <p>
                ユーザーはいつでもサービスを解約することができます。
                解約後も、有効期間終了日までサービスをご利用いただけます。
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                <p className="text-red-300 font-medium">【重要な注意事項】</p>
                <p className="text-red-200 text-sm mt-2">
                  一度解約すると、以下のデータがリセットされます：<br/>
                  ・親密度（最初からのカウントとなります）<br/>
                  ・継続特典（解放された機能やキャラクター）<br/>
                  <br/>
                  当サービスはシステムで全ての利用履歴を管理しており、不正な継続カウントの操作は不可能です。
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第11条（継続特典）</h2>
              <p>
                有料会員として継続利用されるユーザーには、以下の継続特典が付与されます：
              </p>
              <div className="mt-3">
                <strong>【継続特典の内容（サービス内特典）】</strong>
                <ul className="space-y-2 list-disc list-inside mt-2">
                  <li>AI占い師の精度向上（継続利用に応じてよりパーソナライズされた回答）</li>
                  <li>特別キャラクターの解放（継続期間に応じて新しい占い師が利用可能）</li>
                  <li>親密度システムによる特別機能の解放</li>
                  <li>記念日メッセージや特別イベントへの参加</li>
                </ul>
              </div>
              <p className="mt-3">
                継続特典は<strong>現金ではなく、サービス内での特典</strong>として提供されます。
                解約すると親密度がリセットされるため、継続がお得です。
              </p>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第12条（禁止事項）</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>本サービスの不正利用または悪用</li>
                <li>他のユーザーへの迷惑行為</li>
                <li>本サービスのシステムへの不正アクセス</li>
                <li>本サービスのコンテンツの無断転載・複製</li>
                <li>法令または公序良俗に反する行為</li>
                <li>自動化ツール、bot、スクリプト等を使用したサービスの利用</li>
                <li>短時間での大量リクエストや不自然な利用パターン</li>
                <li>複数アカウントの作成・使用によるサービスの悪用</li>
                <li>APIの不正利用やリバースエンジニアリング</li>
              </ul>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                <p className="text-red-300 font-medium">【重要：不正利用対策について】</p>
                <p className="text-red-200 text-sm mt-2">
                  当サービスでは、不正利用を防止するために利用パターンの監視を実施しています。
                  不正利用が検出された場合、事前の通知なくアカウントを停止する場合があります。
                </p>
              </div>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第13条（年齢制限）</h2>
              <p>
                本サービスは18歳以上の方を対象としています。
                18歳未満の方は、保護者の同意を得た上でご利用ください。
              </p>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第14条（サービスの変更・終了）</h2>
              <p>
                当社は、事前の通知なくサービス内容を変更または終了する場合があります。
                サービスの変更・終了によって生じた損害について、当社は責任を負いません。
              </p>
            </section>
            
            <section>
              <h2 className="text-lg text-gold mt-6 mb-3">第15条（準拠法・管轄裁判所）</h2>
              <p>
                本規約の解釈は日本法に準拠するものとします。
                本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
            
            <p className="text-gray-500 mt-8 text-xs">
              制定日：2026年1月1日<br/>
              最終更新日：2026年2月4日
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
