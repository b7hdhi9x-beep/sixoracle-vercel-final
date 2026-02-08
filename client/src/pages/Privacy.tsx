import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background mystical-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 mb-8">
          <ArrowLeft className="w-4 h-4" />
          トップに戻る
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-serif gradient-text mb-8">プライバシーポリシー</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">1. はじめに</h2>
            <p className="text-muted-foreground leading-relaxed">
              六神ノ間運営事務局（以下「当社」）は、デジタルコンパニオンサービス「六神ノ間」（以下「本サービス」）を
              ご利用いただくお客様のプライバシーを尊重し、個人情報の保護に努めます。
              本プライバシーポリシーは、本サービスにおける個人情報の取り扱いについて定めるものです。
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">2. 収集する情報</h2>
            <p className="text-muted-foreground leading-relaxed">
              当サービスでは、以下の情報を収集する場合があります：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>アカウント情報（メールアドレス、ユーザー名、生年月日）</li>
              <li>銀行口座情報（出金申請時に必要な振込先情報）</li>
              <li>対話履歴（AIキャラクターとの会話内容）</li>
              <li>利用状況データ（アクセスログ、使用頻度、親密度データ）</li>

              <li>記念日・イベント情報（ユーザーが登録した記念日）</li>
              <li>設定情報（見守りモード設定、通知設定等）</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">3. 情報の利用目的</h2>
            <p className="text-muted-foreground leading-relaxed">
              収集した情報は、以下の目的で利用します：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>デジタルコンパニオンサービスの提供および改善</li>
              <li>AIキャラクターとの対話体験の向上（会話履歴の記憶機能）</li>
              <li>親密度システムの運用と特典の提供</li>
              <li>記念日・重要な暦に合わせたメッセージ配信</li>
              <li>ユーザーサポートの提供</li>
              <li>銀行振込による入金確認および出金処理</li>

              <li>サービスに関する重要なお知らせの送信</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">4. AIによる情報処理について</h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスでは、AIキャラクターとの対話を実現するため、以下の情報処理を行います：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>対話内容のAIによる分析と応答生成</li>
              <li>会話履歴の要約・保存（継続的なサポートのため）</li>
              <li>ユーザーの相談傾向の分析（より適切なサポートのため）</li>
              <li>感情状態の推定（共感的な対話のため）</li>
            </ul>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
              <p className="text-amber-300 font-medium">【重要】</p>
              <p className="text-amber-200 text-sm mt-2">
                AIによる対話内容は、サービス改善の目的で匿名化された形で分析される場合があります。
                個人を特定できる形での第三者への提供は行いません。
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">5. 銀行口座情報の取り扱い</h2>
            <p className="text-muted-foreground leading-relaxed">
              出金申請時にご登録いただく銀行口座情報は、以下のように取り扱います：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>銀行口座情報は、報酬の振込処理のみに使用します</li>
              <li>口座情報は暗号化して保存し、不正アクセスから保護します</li>
              <li>振込処理に必要な範囲でのみ、金融機関に情報を提供します</li>
              <li>お客様のご要望により、いつでも口座情報を変更・削除できます</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">6. 情報の保護</h2>
            <p className="text-muted-foreground leading-relaxed">
              当サービスは、お客様の個人情報を適切に保護するため、以下の措置を講じています：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>SSL/TLS暗号化による通信の保護</li>
              <li>データベースの暗号化</li>
              <li>アクセス制限による不正アクセスの防止</li>
              <li>定期的なセキュリティ監査</li>
              <li>銀行口座情報の厳格なアクセス管理</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">7. 第三者への情報提供</h2>
            <p className="text-muted-foreground leading-relaxed">
              当サービスは、以下の場合を除き、お客様の個人情報を第三者に提供することはありません：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>お客様の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>振込処理に必要な金融機関への提供</li>
              <li>AIサービス提供に必要な範囲での外部サービス利用（対話内容は匿名化処理）</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">8. Cookieの使用</h2>
            <p className="text-muted-foreground leading-relaxed">
              当サービスでは、ユーザー体験の向上のためにCookieを使用しています。
              Cookieは、ログイン状態の維持やサービスの改善に利用されます。
              ブラウザの設定でCookieを無効にすることも可能ですが、一部の機能が制限される場合があります。
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">9. データの保持期間</h2>
            <p className="text-muted-foreground leading-relaxed">
              各種データの保持期間は以下の通りです：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>対話履歴：アカウントが有効な間保持（継続的なサポートのため）</li>
              <li>会話サマリー：アカウントが有効な間保持</li>
              <li>親密度データ：アカウントが有効な間保持</li>
              <li>銀行口座情報：最後の出金処理から1年間保持し、その後削除</li>
              <li>アカウント削除後：法令で定められた期間を除き、速やかに削除</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">10. お客様の権利</h2>
            <p className="text-muted-foreground leading-relaxed">
              お客様は、以下の権利を有しています：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>個人情報の開示請求</li>
              <li>個人情報の訂正・削除請求</li>
              <li>個人情報の利用停止請求</li>
              <li>対話履歴の削除請求</li>
              <li>銀行口座情報の変更・削除</li>
              <li>親密度データのリセット請求</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">11. サービス利用履歴の管理</h2>
            <p className="text-muted-foreground leading-relaxed">
              当サービスでは、以下の情報をシステムで管理しています：
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-4">
              <li>有料会員の継続期間（継続特典の解放判定に使用）</li>
              <li>親密度・ログイン履歴（特典解放の判定に使用）</li>
              <li>解約履歴（継続期間のリセット判定に使用）</li>
            </ul>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
              <p className="text-red-300 font-medium">【重要な注意事項】</p>
              <p className="text-red-200 text-sm mt-2">
                一度解約すると、親密度・継続特典のカウントはリセットされ、最初からのカウントとなります。<br/>
                当サービスはシステムで全ての利用履歴を管理しており、不正な継続カウントの操作は不可能です。
              </p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-serif text-gold mb-4">12. お問い合わせ</h2>
            <p className="text-muted-foreground leading-relaxed">
              プライバシーに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>
          
          <p className="text-sm text-muted-foreground/70 mt-12">
            制定日：2026年1月1日<br/>
            最終更新日：2026年2月4日
          </p>
        </div>
      </div>
    </div>
  );
}
