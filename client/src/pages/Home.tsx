import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations, Language } from "@/lib/i18n/translations";
import { oracles } from "@/lib/oracles";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Heart, Calculator, Lightbulb, Moon, Shield, Star, Sparkles, Check, ChevronDown, Hand, Droplet, Cat, Brain } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl, getDashboardUrl } from "@/const";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain
};

function StarField() {
  return (
    <div className="star-field">
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            opacity: Math.random() * 0.7 + 0.3,
            animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out ${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
}

// Helper to get oracle translations
function getOracleTranslation(oracleId: string, field: string, lang: Language): string {
  const oracleKey = oracleId as keyof typeof translations.oracles;
  const oracleData = translations.oracles[oracleKey];
  if (!oracleData) return "";
  const fieldData = oracleData[field as keyof typeof oracleData];
  if (!fieldData || typeof fieldData !== "object") return "";
  return (fieldData as Record<Language, string>)[lang] || "";
}

// Helper to get FAQ translations
function getFaqTranslation(index: number, type: "q" | "a", lang: Language): string {
  const faqItem = translations.faq.questions[index];
  if (!faqItem) return "";
  const item = type === "q" ? faqItem.q : faqItem.a;
  return (item as Record<Language, string>)[lang] || "";
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();

  // SEO: Set page title (30-60 characters)
  useEffect(() => {
    const titles: Record<Language, string> = {
      ja: "六神ノ間 - AI占いサブスク | 6人の占い師が24時間対応",
      en: "Six Oracle - AI Fortune Telling | 6 Oracles Available 24/7",
      ko: "Six Oracle - AI 점술 구독 | 6명의 점술사가 24시간 대응",
      zh: "Six Oracle - AI占卜订阅 | 6位占卜师24小时在线",
      es: "Six Oracle - Suscripción de Adivinación IA | 24/7",
      fr: "Six Oracle - Abonnement Voyance IA | 24h/24"
    };
    document.title = titles[language] || titles.ja;
  }, [language]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative mystical-bg">
      {/* PWA Install Banner */}
      <PWAInstallBanner />
      
      <StarField />
      
      {/* Language Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher variant="compact" />
      </div>
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8"
          >
            <img 
              src="/logo.webp" 
              alt={t("home", "heroTitle")} 
              className="w-full max-w-md md:max-w-lg mx-auto shadow-2xl"
              loading="eager"
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-4 gradient-text font-serif"
          >
            {t("home", "heroTitle")}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gold mb-4"
          >
            {t("common", "siteTagline")}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto whitespace-pre-line"
          >
            {t("home", "heroSubtitle")}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              className="btn-primary text-lg px-8 py-6 rounded-full"
              onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t("home", "viewMenu")}
            </Button>

          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-gold/50" />
        </motion.div>
      </section>


      {/* Oracles Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4 gradient-text">{t("home", "oraclesTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto whitespace-pre-line">
              {t("home", "oraclesSubtitle")}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {oracles.map((oracle, index) => {
              const Icon = iconMap[oracle.icon];
              return (
                <motion.div
                  key={oracle.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="oracle-card h-full overflow-hidden">
                    <div className="relative">
                      <img 
                        src={oracle.image} 
                        alt={getOracleTranslation(oracle.id, "name", language)}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-baseline gap-3 mb-2">
                        <h3 className="text-2xl font-serif text-gold">{getOracleTranslation(oracle.id, "name", language)}</h3>
                        <span className="text-sm text-muted-foreground">{getOracleTranslation(oracle.id, "englishName", language)}</span>
                      </div>
                      <p className="text-sm font-medium text-primary mb-3">{getOracleTranslation(oracle.id, "role", language)}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {getOracleTranslation(oracle.id, "description", language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4 gradient-text">
              {language === 'ja' ? '的中体験' : language === 'en' ? 'Success Stories' : language === 'zh' ? '成功案例' : language === 'ko' ? '적중 체험' : language === 'es' ? 'Historias de Éxito' : 'Témoignages'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'ja' ? '実際に鑑定を受けた方々の声をご紹介します' : language === 'en' ? 'Real experiences from our users' : language === 'zh' ? '来自用户的真实体验' : language === 'ko' ? '실제 사용자들의 경험' : language === 'es' ? 'Experiencias reales de nuestros usuarios' : 'Expériences réelles de nos utilisateurs'}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    {language === 'ja' ? '「恋愛の悩みで相談したら、結月さんのアドバイス通りに行動したら、本当に彼と付き合えました！」' : language === 'en' ? '"I consulted about love troubles, and following Yuzuki\'s advice, I actually started dating him!"' : language === 'zh' ? '「我咨询了恋爱烦恼，按照结月的建议行动后，真的和他在一起了！」' : language === 'ko' ? '"연애 고민으로 상담했는데, 유즈키의 조언대로 행동했더니 정말 그와 사귀게 되었어요!"' : language === 'es' ? '"Consulté sobre problemas amorosos, y siguiendo el consejo de Yuzuki, ¡realmente empecé a salir con él!"' : '"J\'ai consulté pour des problèmes amoureux, et en suivant les conseils de Yuzuki, j\'ai vraiment commencé à sortir avec lui!"'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{language === 'ja' ? 'M.Kさん' : 'M.K'}</p>
                      <p className="text-xs text-muted-foreground">{language === 'ja' ? '20代女性' : language === 'en' ? 'Woman, 20s' : language === 'zh' ? '20多岁女性' : language === 'ko' ? '20대 여성' : language === 'es' ? 'Mujer, 20s' : 'Femme, 20 ans'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    {language === 'ja' ? '「転職のタイミングを時流さんに相談。言われた通り3ヶ月待ったら、理想の会社からオファーが！」' : language === 'en' ? '"I consulted Jiryu about job change timing. After waiting 3 months as advised, I got an offer from my dream company!"' : language === 'zh' ? '「我向时流咨询了跳槽时机。按建议等了3个月后，理想的公司给我发了offer！」' : language === 'ko' ? '"이직 타이밍을 지류에게 상담했어요. 조언대로 3개월 기다렸더니 꿈의 회사에서 오퍼가 왔어요!"' : language === 'es' ? '"Consulté a Jiryu sobre el momento de cambiar de trabajo. Después de esperar 3 meses como me aconsejó, ¡recibí una oferta de la empresa de mis sueños!"' : '"J\'ai consulté Jiryu sur le moment de changer d\'emploi. Après avoir attendu 3 mois comme conseillé, j\'ai reçu une offre de l\'entreprise de mes rêves!"'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{language === 'ja' ? 'T.Sさん' : 'T.S'}</p>
                      <p className="text-xs text-muted-foreground">{language === 'ja' ? '30代男性' : language === 'en' ? 'Man, 30s' : language === 'zh' ? '30多岁男性' : language === 'ko' ? '30대 남성' : language === 'es' ? 'Hombre, 30s' : 'Homme, 30 ans'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    {language === 'ja' ? '「数秘さんに起業の相談。教えてもらったラッキーナンバーを使ったら、初月から黒字に！」' : language === 'en' ? '"I consulted Kazuhi about starting a business. Using the lucky numbers I was given, I was profitable from the first month!"' : language === 'zh' ? '「我向数秘咨询了创业。使用他给的幸运数字，第一个月就盈利了！」' : language === 'ko' ? '"카즈히에게 창업 상담을 했어요. 알려준 행운의 숫자를 사용했더니 첫 달부터 흑자였어요!"' : language === 'es' ? '"Consulté a Kazuhi sobre iniciar un negocio. ¡Usando los números de la suerte que me dieron, fui rentable desde el primer mes!"' : '"J\'ai consulté Kazuhi pour créer une entreprise. En utilisant les numéros porte-bonheur qu\'on m\'a donnés, j\'ai été rentable dès le premier mois!"'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{language === 'ja' ? 'A.Yさん' : 'A.Y'}</p>
                      <p className="text-xs text-muted-foreground">{language === 'ja' ? '40代男性' : language === 'en' ? 'Man, 40s' : language === 'zh' ? '40多岁男性' : language === 'ko' ? '40대 남성' : language === 'es' ? 'Hombre, 40s' : 'Homme, 40 ans'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs text-muted-foreground/50 mt-8"
          >
            {language === 'ja' ? '※ 個人の感想であり、効果を保証するものではありません' : language === 'en' ? '* Individual experiences, results may vary' : language === 'zh' ? '※ 个人感受，结果可能因人而异' : language === 'ko' ? '※ 개인적인 경험이며, 결과는 다를 수 있습니다' : language === 'es' ? '* Experiencias individuales, los resultados pueden variar' : '* Expériences individuelles, les résultats peuvent varier'}
          </motion.p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 bg-gradient-to-b from-transparent via-background/50 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4 gradient-text">{t("home", "pricingTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto whitespace-pre-line">
              {t("home", "pricingSubtitle")}
            </p>
          </motion.div>
          
          {/* Monthly Plan Only - Bank Transfer */}
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Monthly Plan */}
              <Card className="glass-card overflow-hidden relative border-gold/50">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-sm text-gold mb-4">
                      {language === 'ja' ? '月額プラン' : language === 'en' ? 'Monthly Plan' : language === 'zh' ? '月付计划' : language === 'ko' ? '월간 플랜' : language === 'es' ? 'Plan Mensual' : 'Plan Mensuel'}
                    </span>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">¥1,980</span>
                      <span className="text-sm text-muted-foreground">{t("home", "pricePerMonth")}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                      <span>{language === 'ja' ? '鑑定回数無制限' : 'Unlimited readings'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                      <span>{t("home", "feature1")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                      <span>{language === 'ja' ? '音声・画像機能' : 'Voice & Image'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                      <span>{t("home", "feature4")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                      <span>{language === 'ja' ? '鑑定履歴保存' : 'History storage'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full py-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
                    onClick={() => {
                      if (isAuthenticated) {
                        window.location.href = getDashboardUrl();
                      } else {
                        window.location.href = '/login';
                      }
                    }}
                  >
                    {isAuthenticated ? t("common", "dashboard") : t("home", "subscribeNow")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    {language === 'ja' ? 'お支払い方法：銀行振込のみ' : 'Payment: Bank transfer only'}
                  </p>
                  <p className="text-center text-xs text-muted-foreground mt-1">
                    {t("home", "cancelAnytime")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <p className="text-center text-xs text-muted-foreground/70 mt-6 max-w-2xl mx-auto">
            {t("home", "domainNotice")} <Link href="/faq" className="text-gold/70 hover:text-gold underline">FAQ</Link>
          </p>
          
          {/* Plan Comparison Table - Single vs Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-16"
          >
            <h3 className="text-2xl font-serif text-center mb-4 gradient-text">
              {language === 'ja' ? '単発鑑定 vs 月額プラン' : language === 'en' ? 'Single Reading vs Monthly Plan' : language === 'zh' ? '单次占卜 vs 月付计划' : language === 'ko' ? '개별 감정 vs 월간 플랜' : language === 'es' ? 'Lectura Única vs Plan Mensual' : 'Lecture Unique vs Plan Mensuel'}
            </h3>
            <p className="text-center text-muted-foreground mb-8 text-sm">
              {language === 'ja' ? '※単発鑑定は一般的な占いサービスの相場です' : 'Single reading prices are typical market rates'}
            </p>
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-left text-muted-foreground font-medium">
                      {language === 'ja' ? '機能' : 'Feature'}
                    </th>
                    <th className="p-4 text-center bg-gray-500/10">
                      <span className="text-gray-400 font-semibold">
                        {language === 'ja' ? '単発鑑定' : 'Single'}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">{language === 'ja' ? '一般的な相場' : 'Market Rate'}</div>
                    </th>
                    <th className="p-4 text-center bg-gold/10 relative">
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
                        <span className="inline-block px-2 py-0.5 rounded-b bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-bold">
                          {language === 'ja' ? 'おすすめ' : 'RECOMMENDED'}
                        </span>
                      </div>
                      <span className="text-gold font-semibold">
                        {language === 'ja' ? '月額プラン' : 'Monthly'}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">¥1,980/{language === 'ja' ? '月' : 'mo'}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="p-4">{language === 'ja' ? '1回の鑑定料金' : 'Per Reading Cost'}</td>
                    <td className="p-4 text-center bg-gray-500/5 text-gray-400">¥3,000～¥10,000</td>
                    <td className="p-4 text-center bg-gold/5 text-gold font-bold">{language === 'ja' ? '実質無料' : 'Essentially Free'}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4">{language === 'ja' ? '鑑定回数' : 'Readings'}</td>
                    <td className="p-4 text-center bg-gray-500/5 text-gray-400">1{language === 'ja' ? '回' : ''}</td>
                    <td className="p-4 text-center bg-gold/5 text-gold font-bold">{language === 'ja' ? '無制限' : 'Unlimited'}</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4">{language === 'ja' ? '占い師全員指名可能' : 'All Oracles'}</td>
                    <td className="p-4 text-center bg-gray-500/5"><span className="text-gray-500">✕</span></td>
                    <td className="p-4 text-center bg-gold/5"><Check className="w-5 h-5 text-gold mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4">{language === 'ja' ? '音声通話モード' : 'Voice Mode'}</td>
                    <td className="p-4 text-center bg-gray-500/5"><span className="text-gray-500">✕</span></td>
                    <td className="p-4 text-center bg-gold/5"><Check className="w-5 h-5 text-gold mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4">{language === 'ja' ? '画像鑑定（手相等）' : 'Image Reading'}</td>
                    <td className="p-4 text-center bg-gray-500/5"><span className="text-gray-500">✕</span></td>
                    <td className="p-4 text-center bg-gold/5"><Check className="w-5 h-5 text-gold mx-auto" /></td>
                  </tr>

                  <tr className="border-b border-white/5">
                    <td className="p-4">{language === 'ja' ? '鑑定履歴保存' : 'History Storage'}</td>
                    <td className="p-4 text-center bg-gray-500/5"><span className="text-gray-500">✕</span></td>
                    <td className="p-4 text-center bg-gold/5"><Check className="w-5 h-5 text-gold mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4">{language === 'ja' ? '24時間いつでも相談' : '24/7 Availability'}</td>
                    <td className="p-4 text-center bg-gray-500/5"><span className="text-gray-500">✕</span></td>
                    <td className="p-4 text-center bg-gold/5"><Check className="w-5 h-5 text-gold mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                    <td className="p-4 font-medium">{language === 'ja' ? '月あたりの料金' : 'Monthly Cost'}</td>
                    <td className="p-4 text-center bg-gray-500/5">
                      <span className="text-gray-400 line-through">¥3,000～</span>
                    </td>
                    <td className="p-4 text-center bg-gold/5 font-bold text-gold">¥1,980</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">{language === 'ja' ? '単発比節約率' : 'Savings vs Single'}</td>
                    <td className="p-4 text-center bg-gray-500/5 text-gray-500">-</td>
                    <td className="p-4 text-center bg-gold/5">
                      <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-gold font-bold text-sm">
                        {language === 'ja' ? '最大98%OFF' : 'Up to 98% OFF'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Value Highlight Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-8 p-6 glass-card rounded-xl border border-gold/30 bg-gradient-to-r from-gold/5 via-transparent to-gold/5"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-gold font-semibold mb-1">
                    {language === 'ja' ? '💡 単発鑑定1回分の料金で、1ヶ月間使い放題！' : '💡 Get unlimited readings for the price of one single reading!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ja' ? '一般的な占いサービスでは1回￥3,000～￥10,000。Six Oracleなら鑑定回数無制限で使い放題！' : 'Typical fortune-telling services charge ￥3,000-￥10,000 per session. With Six Oracle, enjoy unlimited readings!'}
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="shrink-0 px-8 py-5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
                  onClick={() => {
                    if (isAuthenticated) {
                      window.location.href = getDashboardUrl();
                    } else {
                      window.location.href = '/login';
                    }
                  }}
                >
                  {language === 'ja' ? 'ログイン' : 'Login'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4 gradient-text">{t("faq", "title")}</h2>
            <p className="text-muted-foreground">{t("faq", "subtitle")}</p>
          </motion.div>
          
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {getFaqTranslation(index, "q", language)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {getFaqTranslation(index, "a", language)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  {t("footer", "faq")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-border/20 bg-black/30 backdrop-blur-lg">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src="/logo.webp" alt={t("common", "siteName")} className="w-12 h-12" loading="lazy" />
            <span className="text-xl font-serif font-bold gradient-text">{t("common", "siteName")}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground mb-8">
            <Link href="/terms" className="hover:text-gold transition-colors">{t("footer", "terms")}</Link>
            <Link href="/privacy" className="hover:text-gold transition-colors">{t("footer", "privacy")}</Link>
            <Link href="/legal" className="hover:text-gold transition-colors">{t("footer", "legal")}</Link>
            <Link href="/faq" className="hover:text-gold transition-colors">{t("footer", "faq")}</Link>
            <Link href="/contact" className="hover:text-gold transition-colors">{t("footer", "contact")}</Link>
            <Link href="/feedback" className="hover:text-gold transition-colors">{t("footer", "feedback")}</Link>
            <Link href="/help" className="hover:text-gold transition-colors">{t("footer", "help")}</Link>
          </div>
          <p className="text-xs text-muted-foreground/50">
            {t("footer", "copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
