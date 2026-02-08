import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Moon, 
  Check, 
  X, 
  Sparkles, 
  Star, 
  Crown, 
  MessageCircle,
  Image,
  Mic,
  Heart,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// Plan data
const plans = {
  standard: {
    name: {
      ja: "スタンダード",
      en: "Standard",
      zh: "标准版",
      ko: "스탠다드",
      es: "Estándar",
      fr: "Standard",
    },
    price: "¥980",
    period: {
      ja: "/ 月（税込）",
      en: "/ month (tax incl.)",
      zh: "/ 月（含税）",
      ko: "/ 월 (세금 포함)",
      es: "/ mes (imp. incl.)",
      fr: "/ mois (TTC)",
    },
    description: {
      ja: "まずは気軽に始めたい方へ",
      en: "For those who want to start casually",
      zh: "适合想轻松开始的人",
      ko: "가볍게 시작하고 싶은 분께",
      es: "Para quienes quieren empezar casualmente",
      fr: "Pour ceux qui veulent commencer simplement",
    },
    features: [
      { icon: MessageCircle, text: { ja: "1日10回まで鑑定可能", en: "Up to 10 readings per day", zh: "每天最多10次占卜", ko: "하루 10회까지 감정 가능", es: "Hasta 10 lecturas por día", fr: "Jusqu'à 10 lectures par jour" }, included: true },
      { icon: Clock, text: { ja: "毎日0時にリセット", en: "Resets at midnight (JST)", zh: "每天0点重置", ko: "매일 0시에 리셋", es: "Se reinicia a medianoche (JST)", fr: "Réinitialisation à minuit (JST)" }, included: true },
      { icon: Star, text: { ja: "6人の占い師全員に相談可能", en: "Access to all 6 oracles", zh: "可咨询全部6位占卜师", ko: "6명의 점술사 전원 상담 가능", es: "Acceso a los 6 oráculos", fr: "Accès aux 6 oracles" }, included: true },
      { icon: Heart, text: { ja: "親密度システム", en: "Intimacy system", zh: "亲密度系统", ko: "친밀도 시스템", es: "Sistema de intimidad", fr: "Système d'intimité" }, included: true },
      { icon: Image, text: { ja: "画像鑑定（手相占い）", en: "Image reading (palm reading)", zh: "图像占卜（手相）", ko: "이미지 감정 (손금)", es: "Lectura de imágenes (quiromancia)", fr: "Lecture d'images (chiromancie)" }, included: false },
      { icon: Mic, text: { ja: "音声入力", en: "Voice input", zh: "语音输入", ko: "음성 입력", es: "Entrada de voz", fr: "Entrée vocale" }, included: false },
      { icon: Sparkles, text: { ja: "詳細な鑑定結果", en: "Detailed reading results", zh: "详细占卜结果", ko: "상세한 감정 결과", es: "Resultados detallados", fr: "Résultats détaillés" }, included: false },
    ],
    color: "from-slate-500 to-gray-600",
    popular: false,
  },
  premium: {
    name: {
      ja: "プレミアム",
      en: "Premium",
      zh: "高级版",
      ko: "프리미엄",
      es: "Premium",
      fr: "Premium",
    },
    price: "¥1,980",
    period: {
      ja: "/ 月（税込）",
      en: "/ month (tax incl.)",
      zh: "/ 月（含税）",
      ko: "/ 월 (세금 포함)",
      es: "/ mes (imp. incl.)",
      fr: "/ mois (TTC)",
    },
    description: {
      ja: "本格的に運命を知りたい方へ",
      en: "For those who want to know their destiny deeply",
      zh: "适合想深入了解命运的人",
      ko: "본격적으로 운명을 알고 싶은 분께",
      es: "Para quienes quieren conocer su destino profundamente",
      fr: "Pour ceux qui veulent connaître leur destin en profondeur",
    },
    features: [
      { icon: Zap, text: { ja: "鑑定回数無制限", en: "Unlimited readings", zh: "占卜次数无限", ko: "감정 횟수 무제한", es: "Lecturas ilimitadas", fr: "Lectures illimitées" }, included: true },
      { icon: Star, text: { ja: "6人の占い師全員に相談可能", en: "Access to all 6 oracles", zh: "可咨询全部6位占卜师", ko: "6명의 점술사 전원 상담 가능", es: "Acceso a los 6 oráculos", fr: "Accès aux 6 oracles" }, included: true },
      { icon: Heart, text: { ja: "親密度システム", en: "Intimacy system", zh: "亲密度系统", ko: "친밀도 시스템", es: "Sistema de intimidad", fr: "Système d'intimité" }, included: true },
      { icon: Image, text: { ja: "画像鑑定（手相占い）", en: "Image reading (palm reading)", zh: "图像占卜（手相）", ko: "이미지 감정 (손금)", es: "Lectura de imágenes (quiromancia)", fr: "Lecture d'images (chiromancie)" }, included: true },
      { icon: Mic, text: { ja: "音声入力", en: "Voice input", zh: "语音输入", ko: "음성 입력", es: "Entrada de voz", fr: "Entrée vocale" }, included: true },
      { icon: Sparkles, text: { ja: "詳細な鑑定結果", en: "Detailed reading results", zh: "详细占卜结果", ko: "상세한 감정 결과", es: "Resultados detallados", fr: "Résultats détaillés" }, included: true },
      { icon: Crown, text: { ja: "優先サポート", en: "Priority support", zh: "优先支持", ko: "우선 지원", es: "Soporte prioritario", fr: "Support prioritaire" }, included: true },
    ],
    color: "from-amber-500 to-orange-500",
    popular: true,
  },
};

// Comparison table data
const comparisonFeatures = [
  { 
    name: { ja: "鑑定回数", en: "Reading limit", zh: "占卜次数", ko: "감정 횟수", es: "Límite de lecturas", fr: "Limite de lectures" },
    standard: { ja: "1日10回", en: "10/day", zh: "每天10次", ko: "하루 10회", es: "10/día", fr: "10/jour" },
    premium: { ja: "無制限", en: "Unlimited", zh: "无限", ko: "무제한", es: "Ilimitado", fr: "Illimité" },
  },
  { 
    name: { ja: "占い師", en: "Oracles", zh: "占卜师", ko: "점술사", es: "Oráculos", fr: "Oracles" },
    standard: { ja: "6人全員", en: "All 6", zh: "全部6位", ko: "6명 전원", es: "Los 6", fr: "Les 6" },
    premium: { ja: "6人全員", en: "All 6", zh: "全部6位", ko: "6명 전원", es: "Los 6", fr: "Les 6" },
  },
  { 
    name: { ja: "画像鑑定", en: "Image reading", zh: "图像占卜", ko: "이미지 감정", es: "Lectura de imágenes", fr: "Lecture d'images" },
    standard: { ja: "×", en: "×", zh: "×", ko: "×", es: "×", fr: "×" },
    premium: { ja: "○", en: "○", zh: "○", ko: "○", es: "○", fr: "○" },
  },
  { 
    name: { ja: "音声入力", en: "Voice input", zh: "语音输入", ko: "음성 입력", es: "Entrada de voz", fr: "Entrée vocale" },
    standard: { ja: "×", en: "×", zh: "×", ko: "×", es: "×", fr: "×" },
    premium: { ja: "○", en: "○", zh: "○", ko: "○", es: "○", fr: "○" },
  },
  { 
    name: { ja: "詳細な鑑定", en: "Detailed readings", zh: "详细占卜", ko: "상세한 감정", es: "Lecturas detalladas", fr: "Lectures détaillées" },
    standard: { ja: "×", en: "×", zh: "×", ko: "×", es: "×", fr: "×" },
    premium: { ja: "○", en: "○", zh: "○", ko: "○", es: "○", fr: "○" },
  },
  { 
    name: { ja: "親密度システム", en: "Intimacy system", zh: "亲密度系统", ko: "친밀도 시스템", es: "Sistema de intimidad", fr: "Système d'intimité" },
    standard: { ja: "○", en: "○", zh: "○", ko: "○", es: "○", fr: "○" },
    premium: { ja: "○", en: "○", zh: "○", ko: "○", es: "○", fr: "○" },
  },
];

// FAQ data
const pricingFaq = [
  {
    q: {
      ja: "無料で試すことはできますか？",
      en: "Can I try it for free?",
      zh: "可以免费试用吗？",
      ko: "무료로 체험할 수 있나요?",
      es: "¿Puedo probarlo gratis?",
      fr: "Puis-je l'essayer gratuitement ?",
    },
    a: {
      ja: "はい、アカウント登録後、各占い師と3回ずつ無料でお試しいただけます。まずは気になる占い師と会話してみてください。",
      en: "Yes, after registration you can try 3 free readings with each oracle. Start by chatting with an oracle you're interested in.",
      zh: "是的，注册后可以与每位占卜师免费体验3次。先和您感兴趣的占卜师聊聊吧。",
      ko: "네, 계정 등록 후 각 점술사와 3회씩 무료로 체험할 수 있습니다. 먼저 관심 있는 점술사와 대화해 보세요.",
      es: "Sí, después de registrarte puedes probar 3 lecturas gratis con cada oráculo. Comienza chateando con un oráculo que te interese.",
      fr: "Oui, après inscription vous pouvez essayer 3 lectures gratuites avec chaque oracle. Commencez par discuter avec un oracle qui vous intéresse.",
    },
  },
  {
    q: {
      ja: "プランはいつでも変更できますか？",
      en: "Can I change plans anytime?",
      zh: "可以随时更改方案吗？",
      ko: "플랜은 언제든지 변경할 수 있나요?",
      es: "¿Puedo cambiar de plan en cualquier momento?",
      fr: "Puis-je changer de plan à tout moment ?",
    },
    a: {
      ja: "はい、いつでもプランの変更が可能です。アップグレードは即時反映、ダウングレードは次回更新日から適用されます。",
      en: "Yes, you can change plans anytime. Upgrades take effect immediately, downgrades apply from the next renewal date.",
      zh: "是的，可以随时更改方案。升级立即生效，降级从下次续费日开始适用。",
      ko: "네, 언제든지 플랜 변경이 가능합니다. 업그레이드는 즉시 반영되고, 다운그레이드는 다음 갱신일부터 적용됩니다.",
      es: "Sí, puedes cambiar de plan en cualquier momento. Las mejoras se aplican inmediatamente, las degradaciones desde la próxima renovación.",
      fr: "Oui, vous pouvez changer de plan à tout moment. Les mises à niveau prennent effet immédiatement, les rétrogradations à partir du prochain renouvellement.",
    },
  },
  {
    q: {
      ja: "解約はいつでもできますか？",
      en: "Can I cancel anytime?",
      zh: "可以随时取消吗？",
      ko: "언제든지 해지할 수 있나요?",
      es: "¿Puedo cancelar en cualquier momento?",
      fr: "Puis-je annuler à tout moment ?",
    },
    a: {
      ja: "はい、いつでも解約可能です。解約後も有効期間内はサービスをご利用いただけます。ただし、解約すると占い師との親密度がリセットされますのでご注意ください。",
      en: "Yes, you can cancel anytime. You can use the service until your period ends. Note: canceling resets your intimacy levels with oracles.",
      zh: "是的，可以随时取消。取消后在有效期内仍可使用服务。注意：取消会重置与占卜师的亲密度。",
      ko: "네, 언제든지 해지 가능합니다. 해지 후에도 유효 기간 내에는 서비스를 이용할 수 있습니다. 단, 해지하면 점술사와의 친밀도가 리셋되니 주의해 주세요.",
      es: "Sí, puedes cancelar en cualquier momento. Puedes usar el servicio hasta que termine tu período. Nota: cancelar reinicia tu intimidad con los oráculos.",
      fr: "Oui, vous pouvez annuler à tout moment. Vous pouvez utiliser le service jusqu'à la fin de votre période. Note: l'annulation réinitialise votre intimité avec les oracles.",
    },
  },
];

const pageText = {
  title: {
    ja: "料金プラン",
    en: "Pricing Plans",
    zh: "价格方案",
    ko: "요금 플랜",
    es: "Planes de Precios",
    fr: "Plans Tarifaires",
  },
  subtitle: {
    ja: "あなたに合ったプランをお選びください",
    en: "Choose the plan that's right for you",
    zh: "选择适合您的方案",
    ko: "당신에게 맞는 플랜을 선택하세요",
    es: "Elige el plan adecuado para ti",
    fr: "Choisissez le plan qui vous convient",
  },
  popular: {
    ja: "人気",
    en: "Popular",
    zh: "热门",
    ko: "인기",
    es: "Popular",
    fr: "Populaire",
  },
  selectPlan: {
    ja: "このプランを選ぶ",
    en: "Select this plan",
    zh: "选择此方案",
    ko: "이 플랜 선택",
    es: "Seleccionar este plan",
    fr: "Sélectionner ce plan",
  },
  comparison: {
    ja: "プラン比較",
    en: "Plan Comparison",
    zh: "方案比较",
    ko: "플랜 비교",
    es: "Comparación de Planes",
    fr: "Comparaison des Plans",
  },
  feature: {
    ja: "機能",
    en: "Feature",
    zh: "功能",
    ko: "기능",
    es: "Característica",
    fr: "Fonctionnalité",
  },
  faq: {
    ja: "よくある質問",
    en: "FAQ",
    zh: "常见问题",
    ko: "자주 묻는 질문",
    es: "Preguntas Frecuentes",
    fr: "FAQ",
  },
  backToHome: {
    ja: "ホームに戻る",
    en: "Back to Home",
    zh: "返回首页",
    ko: "홈으로 돌아가기",
    es: "Volver al inicio",
    fr: "Retour à l'accueil",
  },
  loginRequired: {
    ja: "ログインして申し込む",
    en: "Login to subscribe",
    zh: "登录后订阅",
    ko: "로그인하여 신청",
    es: "Inicia sesión para suscribirte",
    fr: "Connectez-vous pour vous abonner",
  },
};

export default function Pricing() {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [openFaqItems, setOpenFaqItems] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setOpenFaqItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectPlan = (planType: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLocation(`/subscription?plan=${planType}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-gold" />
            <span className="text-xl font-serif font-bold tracking-widest text-gold">
              {t("common", "siteName")}
            </span>
          </Link>
          <LanguageSwitcher variant="compact" />
        </div>
      </header>

      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold">Six Oracle</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-gold mb-4">
              {pageText.title[language]}
            </h1>
            <p className="text-muted-foreground text-lg">
              {pageText.subtitle[language]}
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {Object.entries(plans).map(([key, plan], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular 
                    ? "border-gold/50 bg-gradient-to-br from-gold/10 to-transparent" 
                    : "border-white/10 hover:border-white/20"
                }`}>
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gold text-black font-bold">
                        <Crown className="w-3 h-3 mr-1" />
                        {pageText.popular[language]}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      {plan.popular ? (
                        <Crown className="w-6 h-6 text-white" />
                      ) : (
                        <Star className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <CardTitle className="text-2xl">{plan.name[language]}</CardTitle>
                    <CardDescription>{plan.description[language]}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period[language]}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <li key={idx} className="flex items-center gap-3">
                            {feature.included ? (
                              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-400" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                                <X className="w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                            <Icon className={`w-4 h-4 ${feature.included ? "text-white" : "text-muted-foreground"}`} />
                            <span className={feature.included ? "text-white" : "text-muted-foreground"}>
                              {feature.text[language]}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      size="lg"
                      onClick={() => handleSelectPlan(key)}
                    >
                      {isAuthenticated ? pageText.selectPlan[language] : pageText.loginRequired[language]}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-serif text-gold text-center mb-8">
              {pageText.comparison[language]}
            </h2>
            <Card className="border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-muted-foreground font-medium">
                        {pageText.feature[language]}
                      </th>
                      <th className="text-center p-4 text-muted-foreground font-medium">
                        {plans.standard.name[language]}
                      </th>
                      <th className="text-center p-4 bg-gold/5">
                        <span className="text-gold font-medium">{plans.premium.name[language]}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="border-b border-white/5">
                        <td className="p-4 text-white">{feature.name[language]}</td>
                        <td className="p-4 text-center text-muted-foreground">
                          {feature.standard[language]}
                        </td>
                        <td className="p-4 text-center bg-gold/5 text-gold font-medium">
                          {feature.premium[language]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-serif text-gold text-center mb-8">
              {pageText.faq[language]}
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {pricingFaq.map((faq, index) => (
                <Collapsible
                  key={index}
                  open={openFaqItems.includes(index)}
                  onOpenChange={() => toggleFaq(index)}
                >
                  <Card className="border-white/10 overflow-hidden">
                    <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                      <span className="font-medium text-white">{faq.q[language]}</span>
                      <ChevronDown className={`w-5 h-5 text-gold transition-transform ${
                        openFaqItems.includes(index) ? "rotate-180" : ""
                      }`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-4 text-muted-foreground">
                        {faq.a[language]}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </motion.div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-white">
                {pageText.backToHome[language]}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-black/20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/50">
            {t("footer", "copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
