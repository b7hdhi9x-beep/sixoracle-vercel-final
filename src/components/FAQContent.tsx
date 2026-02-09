"use client";
import { useState } from "react";
import { StarField } from "@/components/StarField";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, ChevronDown, HelpCircle, CreditCard, Shield, Users, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";

type Category = "all" | "general" | "payment" | "oracle" | "account" | "technical";

interface FAQItem {
  question: string;
  answer: string;
  category: Category;
}

const categories: { id: Category; label: string; icon: any }[] = [
  { id: "all", label: "すべて", icon: HelpCircle },
  { id: "general", label: "一般", icon: Sparkles },
  { id: "payment", label: "料金・お支払い", icon: CreditCard },
  { id: "oracle", label: "占い師", icon: Users },
  { id: "account", label: "アカウント", icon: Shield },
  { id: "technical", label: "技術的な質問", icon: MessageSquare },
];

const faqItems: FAQItem[] = [
  // 一般
  {
    question: "六神ノ間とは何ですか？",
    answer: "六神ノ間（Six Oracle）は、AI技術を活用した占いエンターテインメントサービスです。個性豊かな11人以上のAI占い師が、恋愛・仕事・人間関係・健康など、様々な悩みに対して多角的な視点からアドバイスを提供します。",
    category: "general",
  },
  {
    question: "AI占いとは何ですか？",
    answer: "AI占いとは、最新のAI技術を活用した占いサービスです。各占い師はそれぞれ独自の専門分野と性格を持ち、タロット、西洋占星術、数秘術、風水、心理分析など、多様な占術を用いてあなたの悩みに寄り添います。24時間いつでも相談可能で、待ち時間なく鑑定を受けられます。",
    category: "general",
  },
  {
    question: "占いの精度はどのくらいですか？",
    answer: "本サービスはAI技術を活用したエンターテインメントサービスです。占い結果は参考情報としてお楽しみください。医療・法律・金融等の専門的なアドバイスに代わるものではありません。重要な決断の際は、必ず専門家にご相談ください。",
    category: "general",
  },
  {
    question: "新しく占い師を追加しました！",
    answer: "創設時の6人に加え、新たに5人の占い師が加わりました！手相・人相の「掌月（しょうげつ）」、ペット占いの「猫宮みたま」、夢占いの「夢路うつつ」、数秘術の「数織かずは」、心理占いの「心読あきら」が新登場。それぞれの専門分野で、より多角的な鑑定が可能になりました。",
    category: "general",
  },
  // 料金・お支払い
  {
    question: "料金はいくらですか？",
    answer: "月額プラン ¥1,980（税込）/ 月でご利用いただけます。全11人以上のAI占い師への鑑定回数無制限、鑑定履歴の保存等の機能がご利用いただけます。",
    category: "payment",
  },
  {
    question: "支払い方法は何がありますか？",
    answer: "現在、お支払いは銀行振込のみ対応しております。クレジットカード決済には対応しておりません。振込先口座情報は、特定商取引法に基づく表記ページでご確認いただけます。",
    category: "payment",
  },
  {
    question: "解約はいつでもできますか？",
    answer: "はい、いつでも解約可能です。解約後も、お支払い済みの期間が終了するまではサービスをご利用いただけます。月額プランは自動更新されませんので、継続利用には再度お振込みが必要です。日割り返金はございません。",
    category: "payment",
  },
  {
    question: "無料で利用できますか？",
    answer: "基本的な機能は無料でお試しいただけます。プレミアムプランに登録すると、全占い師への無制限相談、鑑定履歴の保存、親密度システムなどの全機能をご利用いただけます。",
    category: "payment",
  },
  {
    question: "返金はできますか？",
    answer: "デジタルコンテンツの性質上、サービス提供開始後の返金には原則として応じかねます。ただし、システム障害等によりサービスが利用できなかった場合は、個別に対応させていただきます。",
    category: "payment",
  },
  // 占い師
  {
    question: "どの占い師に相談すればいいですか？",
    answer: "各占い師にはそれぞれ得意分野があります。恋愛相談なら「愛染花」、仕事・キャリアなら「時雨蒼」、人間関係なら「月詠静」、健康なら「陽炎翠」、人生の転機なら「闇夜紫」、守護・厄除けなら「天照金」がおすすめです。新しい占い師として、手相・人相の「掌月」、ペット占いの「猫宮みたま」、夢占いの「夢路うつつ」、数秘術の「数織かずは」、心理占いの「心読あきら」も加わりました。迷ったら、まずは気になる占い師に相談してみてください。",
    category: "oracle",
  },
  {
    question: "占い師の性格や特徴はどこで確認できますか？",
    answer: "トップページの「導き手たち」セクションで各占い師の概要を確認できます。また、各占い師のカードにある「詳しく見る」をクリックすると、詳細なプロフィール（得意な相談内容、鑑定スタイル、口癖、好きなもの等）をご覧いただけます。",
    category: "oracle",
  },
  {
    question: "親密度とは何ですか？",
    answer: "親密度は、占い師との会話を重ねることで上がるシステムです。親密度が上がると、占い師がより親しみを込めた対応をしてくれるようになり、特別なアドバイスや深い洞察を得られるようになります。継続的に利用することで、より充実した鑑定体験をお楽しみいただけます。",
    category: "oracle",
  },
  // アカウント
  {
    question: "アカウントの作成方法は？",
    answer: "電話番号を使って簡単にアカウントを作成できます。ログインページで電話番号を入力し、認証コードを入力するだけでご利用開始いただけます。",
    category: "account",
  },
  {
    question: "パスワードを忘れた場合は？",
    answer: "本サービスは電話番号認証を使用しているため、パスワードはありません。ログインページで電話番号を入力し、認証コードを受け取ってログインしてください。",
    category: "account",
  },
  {
    question: "アカウントを削除したい場合は？",
    answer: "アカウントの削除をご希望の場合は、お問い合わせページからご連絡ください。削除処理後、全てのデータ（鑑定履歴、親密度等）は完全に削除され、復元できませんのでご注意ください。",
    category: "account",
  },
  // 技術的な質問
  {
    question: "推奨ブラウザは何ですか？",
    answer: "最新版のChrome、Safari、Firefox、Edgeを推奨しております。Internet Explorerには対応しておりません。スマートフォンでもPCでも快適にご利用いただけます。",
    category: "technical",
  },
  {
    question: "チャット履歴は保存されますか？",
    answer: "プレミアム会員の方は、鑑定履歴がサーバーに保存されます。無料会員の方は、ブラウザのLocalStorageに保存されるため、ブラウザのデータを消去すると履歴も消えてしまいます。大切な鑑定結果はスクリーンショット等で保存することをお勧めします。",
    category: "technical",
  },
  {
    question: "通信が途切れた場合はどうなりますか？",
    answer: "通信が途切れた場合、再接続後に会話を続けることができます。ただし、長時間の切断の場合はセッションがリセットされることがあります。その場合は、新しい会話として再度ご相談ください。",
    category: "technical",
  },
];

export default function FAQContent() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const filteredFAQs = faqItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
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
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gold" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-4">
            よくある質問
          </h1>
          <p className="text-gray-400">
            サービスに関するよくある質問をまとめました
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="質問を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gold text-black font-medium"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFAQs.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 ${
                    openItems.has(index) ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openItems.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>該当する質問が見つかりませんでした</p>
          </div>
        )}

        {/* Contact Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center glass-card rounded-xl p-8"
        >
          <p className="text-gray-400 mb-4">
            お探しの回答が見つかりませんか？
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-black font-medium rounded-full transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            お問い合わせはこちら
          </Link>
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
