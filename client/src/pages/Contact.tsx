import { useState } from "react";
import { Link } from "wouter";
import { Moon, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const pageText: Record<string, Record<Language, string>> = {
  title: {
    ja: "お問い合わせ",
    en: "Contact Us",
    zh: "联系我们",
    ko: "문의하기",
    es: "Contáctenos",
    fr: "Contactez-nous",
  },
  subtitle: {
    ja: "ご質問やご意見がございましたら、お気軽にお問い合わせください",
    en: "If you have any questions or feedback, please feel free to contact us",
    zh: "如有任何问题或意见，请随时与我们联系",
    ko: "질문이나 의견이 있으시면 언제든지 문의해 주세요",
    es: "Si tiene alguna pregunta o comentario, no dude en contactarnos",
    fr: "Si vous avez des questions ou des commentaires, n'hésitez pas à nous contacter",
  },
  nameLabel: {
    ja: "お名前",
    en: "Name",
    zh: "姓名",
    ko: "이름",
    es: "Nombre",
    fr: "Nom",
  },
  namePlaceholder: {
    ja: "山田 太郎",
    en: "John Doe",
    zh: "张三",
    ko: "홍길동",
    es: "Juan García",
    fr: "Jean Dupont",
  },
  emailLabel: {
    ja: "メールアドレス",
    en: "Email Address",
    zh: "电子邮箱",
    ko: "이메일 주소",
    es: "Correo electrónico",
    fr: "Adresse e-mail",
  },
  emailPlaceholder: {
    ja: "example@email.com",
    en: "example@email.com",
    zh: "example@email.com",
    ko: "example@email.com",
    es: "ejemplo@email.com",
    fr: "exemple@email.com",
  },
  categoryLabel: {
    ja: "お問い合わせ種別",
    en: "Category",
    zh: "咨询类别",
    ko: "문의 유형",
    es: "Categoría",
    fr: "Catégorie",
  },
  categoryPlaceholder: {
    ja: "選択してください",
    en: "Select a category",
    zh: "请选择",
    ko: "선택해 주세요",
    es: "Seleccione una categoría",
    fr: "Sélectionnez une catégorie",
  },
  messageLabel: {
    ja: "お問い合わせ内容",
    en: "Message",
    zh: "咨询内容",
    ko: "문의 내용",
    es: "Mensaje",
    fr: "Message",
  },
  messagePlaceholder: {
    ja: "お問い合わせ内容をご記入ください...",
    en: "Please describe your inquiry...",
    zh: "请描述您的问题...",
    ko: "문의 내용을 입력해 주세요...",
    es: "Por favor, describa su consulta...",
    fr: "Veuillez décrire votre demande...",
  },
  submitButton: {
    ja: "送信する",
    en: "Send Message",
    zh: "发送",
    ko: "보내기",
    es: "Enviar mensaje",
    fr: "Envoyer le message",
  },
  submitting: {
    ja: "送信中...",
    en: "Sending...",
    zh: "发送中...",
    ko: "전송 중...",
    es: "Enviando...",
    fr: "Envoi en cours...",
  },
  successTitle: {
    ja: "送信完了",
    en: "Message Sent",
    zh: "发送成功",
    ko: "전송 완료",
    es: "Mensaje enviado",
    fr: "Message envoyé",
  },
  successMessage: {
    ja: "お問い合わせを受け付けました。通常2〜3営業日以内にご返信いたします。",
    en: "Your inquiry has been received. We will respond within 2-3 business days.",
    zh: "我们已收到您的咨询。我们将在2-3个工作日内回复。",
    ko: "문의가 접수되었습니다. 2-3 영업일 이내에 답변 드리겠습니다.",
    es: "Su consulta ha sido recibida. Responderemos en 2-3 días hábiles.",
    fr: "Votre demande a été reçue. Nous vous répondrons sous 2-3 jours ouvrables.",
  },
  sendAnother: {
    ja: "別のお問い合わせを送る",
    en: "Send Another Inquiry",
    zh: "发送另一个咨询",
    ko: "다른 문의 보내기",
    es: "Enviar otra consulta",
    fr: "Envoyer une autre demande",
  },
  backToHome: {
    ja: "ホームに戻る",
    en: "Back to Home",
    zh: "返回首页",
    ko: "홈으로 돌아가기",
    es: "Volver al inicio",
    fr: "Retour à l'accueil",
  },
  faqPrompt: {
    ja: "よくある質問もご確認ください",
    en: "Please also check our FAQ",
    zh: "请同时查看我们的常见问题",
    ko: "자주 묻는 질문도 확인해 주세요",
    es: "Por favor, consulte también nuestras preguntas frecuentes",
    fr: "Veuillez également consulter notre FAQ",
  },
  faqLink: {
    ja: "FAQページへ",
    en: "Go to FAQ",
    zh: "前往常见问题",
    ko: "FAQ 페이지로",
    es: "Ir a FAQ",
    fr: "Aller à la FAQ",
  },
  required: {
    ja: "必須",
    en: "Required",
    zh: "必填",
    ko: "필수",
    es: "Requerido",
    fr: "Requis",
  },
  languageNote: {
    ja: "※日本語以外でのお問い合わせも受け付けております",
    en: "* We accept inquiries in multiple languages",
    zh: "* 我们接受多种语言的咨询",
    ko: "* 다국어 문의를 받습니다",
    es: "* Aceptamos consultas en varios idiomas",
    fr: "* Nous acceptons les demandes en plusieurs langues",
  },
  errorMessage: {
    ja: "送信に失敗しました。もう一度お試しください。",
    en: "Failed to send. Please try again.",
    zh: "发送失败。请重试。",
    ko: "전송에 실패했습니다. 다시 시도해 주세요.",
    es: "Error al enviar. Por favor, inténtelo de nuevo.",
    fr: "Échec de l'envoi. Veuillez réessayer.",
  },
  successToast: {
    ja: "お問い合わせを送信しました",
    en: "Inquiry submitted successfully",
    zh: "咨询已成功提交",
    ko: "문의가 성공적으로 제출되었습니다",
    es: "Consulta enviada con éxito",
    fr: "Demande envoyée avec succès",
  },
};

const categories: Record<string, Record<Language, string>> = {
  general: {
    ja: "一般的なお問い合わせ",
    en: "General Inquiry",
    zh: "一般咨询",
    ko: "일반 문의",
    es: "Consulta general",
    fr: "Demande générale",
  },
  payment: {
    ja: "お支払いについて",
    en: "Payment Issues",
    zh: "支付问题",
    ko: "결제 관련",
    es: "Problemas de pago",
    fr: "Problèmes de paiement",
  },
  subscription: {
    ja: "サブスクリプションについて",
    en: "Subscription",
    zh: "订阅相关",
    ko: "구독 관련",
    es: "Suscripción",
    fr: "Abonnement",
  },
  technical: {
    ja: "技術的な問題",
    en: "Technical Issues",
    zh: "技术问题",
    ko: "기술적 문제",
    es: "Problemas técnicos",
    fr: "Problèmes techniques",
  },
  feedback: {
    ja: "ご意見・ご要望",
    en: "Feedback & Suggestions",
    zh: "意见与建议",
    ko: "피드백 및 제안",
    es: "Comentarios y sugerencias",
    fr: "Commentaires et suggestions",
  },
  other: {
    ja: "その他",
    en: "Other",
    zh: "其他",
    ko: "기타",
    es: "Otro",
    fr: "Autre",
  },
};

type CategoryType = "general" | "payment" | "subscription" | "technical" | "feedback" | "other";

export default function Contact() {
  const { language, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<CategoryType | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitInquiry = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success(pageText.successToast[language]);
    },
    onError: () => {
      toast.error(pageText.errorMessage[language]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category === "") return;
    submitInquiry.mutate({
      name,
      email,
      category,
      message,
      language,
    });
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setCategory("");
    setMessage("");
    setIsSubmitted(false);
  };

  if (isSubmitted) {
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

        {/* Success Message */}
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="glass-card rounded-lg p-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-serif text-gold mb-4">
                {pageText.successTitle[language]}
              </h1>
              <p className="text-muted-foreground mb-8">
                {pageText.successMessage[language]}
              </p>
              <div className="flex flex-col gap-4">
                <Button onClick={resetForm} className="btn-primary">
                  {pageText.sendAnother[language]}
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full border-gold/30 hover:bg-gold/10">
                    {pageText.backToHome[language]}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif text-gold text-center mb-4">
            {pageText.title[language]}
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            {pageText.subtitle[language]}
          </p>
          <p className="text-sm text-muted-foreground/70 text-center mb-8">
            {pageText.languageNote[language]}
          </p>

          {/* FAQ Link */}
          <div className="glass-card rounded-lg p-4 mb-8 text-center">
            <span className="text-muted-foreground">
              {pageText.faqPrompt[language]}{" "}
            </span>
            <Link href="/faq" className="text-gold hover:text-gold/80 underline">
              {pageText.faqLink[language]}
            </Link>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="glass-card rounded-lg p-8 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                {pageText.nameLabel[language]}
                <span className="text-xs text-red-400">
                  {pageText.required[language]}
                </span>
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={pageText.namePlaceholder[language]}
                required
                className="bg-white/5 border-white/10"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                {pageText.emailLabel[language]}
                <span className="text-xs text-red-400">
                  {pageText.required[language]}
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={pageText.emailPlaceholder[language]}
                required
                className="bg-white/5 border-white/10"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                {pageText.categoryLabel[language]}
                <span className="text-xs text-red-400">
                  {pageText.required[language]}
                </span>
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as CategoryType)} required>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder={pageText.categoryPlaceholder[language]} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, labels]) => (
                    <SelectItem key={key} value={key}>
                      {labels[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                {pageText.messageLabel[language]}
                <span className="text-xs text-red-400">
                  {pageText.required[language]}
                </span>
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={pageText.messagePlaceholder[language]}
                required
                rows={6}
                className="bg-white/5 border-white/10 resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={submitInquiry.isPending || !category}
            >
              {submitInquiry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {pageText.submitting[language]}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {pageText.submitButton[language]}
                </>
              )}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline" className="border-gold/30 hover:bg-gold/10">
                {pageText.backToHome[language]}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/50">
            {t("footer", "copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
