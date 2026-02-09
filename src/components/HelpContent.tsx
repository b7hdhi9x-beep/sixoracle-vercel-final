"use client";
import { useState } from "react";
import { StarField } from "@/components/StarField";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, MessageCircle, CreditCard, Shield,
  Users, Sparkles, ChevronDown, Heart, Star, Zap, HelpCircle,
  Clock, Target, Brain, Lightbulb,
} from "lucide-react";
import Link from "next/link";

interface HelpSection {
  id: string;
  title: string;
  icon: any;
  content: {
    subtitle: string;
    text: string;
  }[];
}

const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "はじめに",
    icon: BookOpen,
    content: [
      {
        subtitle: "六神ノ間とは？",
        text: "六神ノ間（Six Oracle）は、AI技術を活用した占いエンターテインメントサービスです。11人以上の個性豊かなAI占い師が、あなたの悩みに寄り添い、多角的な視点からアドバイスを提供します。",
      },
      {
        subtitle: "アカウント作成",
        text: "電話番号を使って簡単にアカウントを作成できます。ログインページで電話番号を入力し、認証コードを入力するだけでご利用開始いただけます。パスワードの設定は不要です。",
      },
      {
        subtitle: "初めての鑑定",
        text: "ログイン後、ダッシュボードから好きな占い師を選んで「鑑定を開始」をタップするだけで、すぐに占い相談を始められます。初めての方は、まず気になる占い師のプロフィールを確認してみてください。",
      },
    ],
  },
  {
    id: "oracles",
    title: "占い師について",
    icon: Users,
    content: [
      {
        subtitle: "占い師の選び方",
        text: "各占い師にはそれぞれ得意分野があります。恋愛相談なら「愛染花」、仕事・キャリアなら「時雨蒼」、人間関係なら「月詠静」、健康なら「陽炎翠」、人生の転機なら「闇夜紫」、守護・厄除けなら「天照金」がおすすめです。新しい占い師も続々追加中です。",
      },
      {
        subtitle: "新しい占い師たち",
        text: "創設時の6人に加え、手相・人相の「掌月（しょうげつ）」、ペット占いの「猫宮みたま」、夢占いの「夢路うつつ」、数秘術の「数織かずは」、心理占いの「心読あきら」が新たに加わりました。それぞれの専門分野で、より多角的な鑑定が可能になりました。",
      },
      {
        subtitle: "占い師のプロフィール",
        text: "各占い師のカードにある「詳しく見る」をクリックすると、詳細なプロフィール（得意な相談内容、鑑定スタイル、口癖、好きなもの、趣味等）をご覧いただけます。相性の良い占い師を見つけてみてください。",
      },
    ],
  },
  {
    id: "features",
    title: "主な機能",
    icon: Sparkles,
    content: [
      {
        subtitle: "AI鑑定チャット",
        text: "各占い師との1対1のチャット形式で鑑定を受けられます。テキストで悩みを入力すると、占い師がそれぞれの専門分野と占術に基づいたアドバイスを返してくれます。24時間いつでも利用可能です。",
      },
      {
        subtitle: "親密度システム",
        text: "占い師との会話を重ねることで「親密度」が上がります。親密度が上がると、占い師がより親しみを込めた対応をしてくれるようになり、特別なアドバイスや深い洞察を得られるようになります。",
      },
      {
        subtitle: "記憶機能",
        text: "プレミアム会員の方は、占い師があなたとの過去の会話を記憶します。前回の相談内容を踏まえた、より深い鑑定を受けることができます。",
      },
      {
        subtitle: "鑑定履歴",
        text: "プレミアム会員の方は、過去の鑑定履歴をいつでも振り返ることができます。大切なアドバイスを後から確認したい時に便利です。",
      },
      {
        subtitle: "多言語対応",
        text: "日本語・英語・中国語・韓国語・スペイン語・フランス語の6言語に対応しています。お好みの言語でサービスをご利用いただけます。",
      },
    ],
  },
  {
    id: "premium",
    title: "プレミアムプラン",
    icon: CreditCard,
    content: [
      {
        subtitle: "プランの内容",
        text: "月額 ¥1,980（税込）で、全11人以上のAI占い師への鑑定回数無制限、鑑定履歴の保存、親密度システム、記憶機能等の全機能をご利用いただけます。",
      },
      {
        subtitle: "お支払い方法",
        text: "現在、お支払いは銀行振込のみ対応しております。振込先口座情報は、特定商取引法に基づく表記ページでご確認いただけます。お振込み確認後、管理者がプレミアム機能を有効化いたします。",
      },
      {
        subtitle: "プレミアムの有効化",
        text: "お振込み確認後、管理者から「合言葉」をお伝えします。ダッシュボードの「プレミアムに登録」ボタンから合言葉を入力すると、プレミアム機能が有効化されます。",
      },
      {
        subtitle: "解約について",
        text: "いつでも解約可能です。月額プランは自動更新されませんので、継続利用には再度お振込みが必要です。解約後も、お支払い済みの期間が終了するまではサービスをご利用いただけます。",
      },
    ],
  },
  {
    id: "tips",
    title: "鑑定のコツ",
    icon: Lightbulb,
    content: [
      {
        subtitle: "具体的に相談する",
        text: "「恋愛運を教えて」よりも「最近気になる人がいるのですが、どうアプローチすればいいですか？」のように、具体的な状況を伝えるとより的確なアドバイスが得られます。",
      },
      {
        subtitle: "複数の占い師に相談する",
        text: "同じ悩みでも、占い師によって異なる視点からアドバイスが得られます。複数の占い師に相談することで、より多角的な理解が深まります。",
      },
      {
        subtitle: "継続的に相談する",
        text: "一度きりではなく、定期的に相談することで親密度が上がり、より深い鑑定を受けられるようになります。状況の変化を占い師に伝えることで、的確なフォローアップアドバイスも得られます。",
      },
      {
        subtitle: "占い結果の活用",
        text: "占い結果はあくまで参考情報です。最終的な判断はご自身で行ってください。占い師のアドバイスをヒントに、自分自身で考え、行動することが大切です。",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "トラブルシューティング",
    icon: Shield,
    content: [
      {
        subtitle: "ログインできない場合",
        text: "電話番号が正しく入力されているか確認してください。認証コードが届かない場合は、しばらく待ってから再度お試しください。それでも解決しない場合は、お問い合わせページからご連絡ください。",
      },
      {
        subtitle: "チャットが表示されない場合",
        text: "ブラウザのキャッシュをクリアし、ページを再読み込みしてください。推奨ブラウザ（Chrome、Safari、Firefox、Edge）の最新版をご利用ください。",
      },
      {
        subtitle: "鑑定履歴が消えた場合",
        text: "無料会員の方の鑑定履歴はブラウザのLocalStorageに保存されています。ブラウザのデータを消去すると履歴も消えてしまいます。プレミアム会員の方はサーバーに保存されるため、この問題は発生しません。",
      },
      {
        subtitle: "その他の問題",
        text: "上記で解決しない場合は、お問い合わせページからご連絡ください。できるだけ詳しい状況（使用デバイス、ブラウザ、発生した問題の詳細）をお伝えいただけると、迅速に対応できます。",
      },
    ],
  },
];

export default function HelpContent() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["getting-started"]));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white relative overflow-hidden">
      <StarField />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0a1e]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            トップに戻る
          </Link>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gold" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-4">
            ヘルプガイド
          </h1>
          <p className="text-gray-400">
            六神ノ間の使い方・機能について詳しくご案内します
          </p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-8"
        >
          <h2 className="text-sm font-medium text-gold mb-4">目次</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {helpSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setOpenSections((prev) => new Set([...prev, section.id]));
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-gold flex-shrink-0" />
                  {section.title}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Help Sections */}
        <div className="space-y-4">
          {helpSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            const isOpen = openSections.has(section.id);
            return (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * sectionIndex }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-lg font-medium">{section.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-6 border-t border-white/5 pt-4">
                        {section.content.map((item, itemIndex) => (
                          <div key={itemIndex}>
                            <h3 className="text-gold font-medium mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                              {item.subtitle}
                            </h3>
                            <p className="text-gray-400 leading-relaxed pl-4">
                              {item.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center glass-card rounded-xl p-8"
        >
          <p className="text-gray-400 mb-2">
            まだ解決しない場合は
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              よくある質問
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-black font-medium rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              お問い合わせ
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">© 2026 Six Oracle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
