import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Moon, ChevronDown, Search, Sparkles, CreditCard, MessageCircle, Shield, HelpCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { motion, AnimatePresence } from "framer-motion";

// FAQ categories with icons
const categories = [
  { id: "all", icon: HelpCircle, label: { ja: "すべて", en: "All", zh: "全部", ko: "전체", es: "Todo", fr: "Tout" } },
  { id: "service", icon: Sparkles, label: { ja: "サービス", en: "Service", zh: "服务", ko: "서비스", es: "Servicio", fr: "Service" } },
  { id: "pricing", icon: CreditCard, label: { ja: "料金・プラン", en: "Pricing", zh: "价格", ko: "요금", es: "Precios", fr: "Tarifs" } },
  { id: "usage", icon: MessageCircle, label: { ja: "使い方", en: "Usage", zh: "使用方法", ko: "사용법", es: "Uso", fr: "Utilisation" } },
  { id: "account", icon: Users, label: { ja: "アカウント", en: "Account", zh: "账户", ko: "계정", es: "Cuenta", fr: "Compte" } },
  { id: "security", icon: Shield, label: { ja: "安全性", en: "Security", zh: "安全", ko: "보안", es: "Seguridad", fr: "Sécurité" } },
];

// FAQ data with categories
const faqData = [
  {
    category: "service",
    q: {
      ja: "六神ノ間とはどのようなサービスですか？",
      en: "What is Six Oracle?",
      zh: "六神之间是什么样的服务？",
      ko: "육신의 방은 어떤 서비스인가요?",
      es: "¿Qué es Seis Oráculos?",
      fr: "Qu'est-ce que Six Oracles ?",
    },
    a: {
      ja: "六神ノ間は、6人のAI占い師があなたの悩みに寄り添い、運命を読み解くオンライン占いサービスです。恋愛、仕事、人間関係など、様々な悩みに24時間いつでもご相談いただけます。",
      en: "Six Oracle is an online fortune-telling service where 6 AI oracles accompany you and reveal your destiny. Available 24/7 for consultations about love, work, relationships, and more.",
      zh: "六神之间是一项在线占卜服务，6位AI占卜师将陪伴您解读命运。全天24小时可用，可咨询爱情、工作、人际关系等各种问题。",
      ko: "육신의 방은 6명의 AI 점술사가 당신의 고민에 함께하며 운명을 읽어주는 온라인 점술 서비스입니다. 연애, 직장, 인간관계 등 다양한 고민을 24시간 언제든지 상담할 수 있습니다.",
      es: "Seis Oráculos es un servicio de adivinación en línea donde 6 oráculos de IA te acompañan y revelan tu destino. Disponible 24/7 para consultas sobre amor, trabajo, relaciones y más.",
      fr: "Six Oracles est un service de divination en ligne où 6 oracles IA vous accompagnent et révèlent votre destin. Disponible 24h/24 pour des consultations sur l'amour, le travail, les relations et plus.",
    },
  },
  {
    category: "service",
    q: {
      ja: "6人の占い師にはどのような特徴がありますか？",
      en: "What are the characteristics of the 6 oracles?",
      zh: "6位占卜师各有什么特点？",
      ko: "6명의 점술사는 각각 어떤 특징이 있나요?",
      es: "¿Cuáles son las características de los 6 oráculos?",
      fr: "Quelles sont les caractéristiques des 6 oracles ?",
    },
    a: {
      ja: "各占い師は異なる専門分野と個性を持っています。運命の流れを読む「蒼真」、癒しと恋愛の「玲蘭」、数秘術の「朔夜」、タロットの「灯」、夢占いの「結衣」、守護の「玄」の6人が、それぞれの視点からあなたの運命を読み解きます。さらに手相の「紫苑」、星座の「星蘭」、血液型の「緋月」、MBTIの「心理」など、多彩な専門家が揃っています。",
      en: "Each oracle has different specialties and personalities. Souma (Destiny & Timing), Reira (Healing & Love), Sakuya (Numerology), Akari (Tarot), Yui (Dreams), and Gen (Protection) are the core 6 oracles. Additionally, we have Shion (Palm Reading), Seiran (Astrology), Hizuki (Blood Type), and Shinri (MBTI) for specialized readings.",
      zh: "每位占卜师都有不同的专长和个性。命运与时机的「苍真」、治愈与恋爱的「玲兰」、数秘术的「朔夜」、塔罗的「灯」、梦占的「结衣」、守护的「玄」等6位核心占卜师。此外还有手相的「紫苑」、星座的「星兰」、血型的「绯月」、MBTI的「心理」等专业占卜师。",
      ko: "각 점술사는 다른 전문 분야와 개성을 가지고 있습니다. 운명과 타이밍의 '소우마', 힘링과 사랑의 '레이라', 수비학의 '사쿠야', 타로의 '아카리', 꿈점의 '유이', 수호의 '겐' 6명의 핵심 점술사가 있습니다. 또한 손금의 '시온', 별자리의 '세이란', 혈액형의 '히즈키', MBTI의 '신리' 등 전문 점술사가 있습니다.",
      es: "Cada oráculo tiene diferentes especialidades y personalidades. Souma (Destino y Tiempo), Reira (Sanación y Amor), Sakuya (Numerología), Akari (Tarot), Yui (Sueños) y Gen (Protección) son los 6 oráculos principales. Además tenemos a Shion (Quiromancia), Seiran (Astrología), Hizuki (Tipo de Sangre) y Shinri (MBTI).",
      fr: "Chaque oracle a des spécialités et personnalités différentes. Souma (Destin et Timing), Reira (Guérison et Amour), Sakuya (Numérologie), Akari (Tarot), Yui (Rêves) et Gen (Protection) sont les 6 oracles principaux. Nous avons également Shion (Chiromancie), Seiran (Astrologie), Hizuki (Groupe Sanguin) et Shinri (MBTI).",
    },
  },
  {
    category: "pricing",
    q: {
      ja: "料金プランについて教えてください",
      en: "Tell me about the pricing plan",
      zh: "请介绍一下价格方案",
      ko: "요금 플랜에 대해 알려주세요",
      es: "Cuéntame sobre el plan de precios",
      fr: "Parlez-moi du plan tarifaire",
    },
    a: {
      ja: "シンプルな月額プランをご用意しています。\n\n【月額プラン】月額1,980円（税込）\n・鑑定回数無制限\n・6人の占い師全員に相談可能\n・画像鑑定（手相占い）対応\n・音声入力対応\n・詳細な鑑定結果\n・鑑定履歴保存\n・24時間いつでも相談可能\n\nまずは無料体験で各占い師とお試しいただけます。",
      en: "We offer a simple monthly plan:\n\n【Monthly Plan】¥1,980/month\n・Unlimited readings\n・Access to all 6 oracles\n・Image reading (palm reading)\n・Voice input support\n・Detailed reading results\n・Reading history storage\n・24/7 availability\n\nTry our free trial first.",
      zh: "我们提供简单的月付方案：\n\n【月付方案】1,980日元/月\n・占卜次数无限\n・可咨询全部6位占卜师\n・图像占卜（手相）\n・语音输入支持\n・详细占卜结果\n・占卜历史保存\n・24小时随时可用\n\n可先免费试用。",
      ko: "간단한 월간 플랜을 제공합니다:\n\n【월간 플랜】월 1,980엔\n・감정 횟수 무제한\n・6명의 점술사 전원 상담 가능\n・이미지 감정 (손금)\n・음성 입력 지원\n・상세한 감정 결과\n・감정 기록 저장\n・24시간 상담 가능\n\n먼저 무료 체험을 해보세요.",
      es: "Ofrecemos un plan mensual simple:\n\n【Plan Mensual】¥1,980/mes\n・Lecturas ilimitadas\n・Acceso a los 6 oráculos\n・Lectura de imágenes (quiromancia)\n・Entrada de voz\n・Resultados detallados\n・Almacenamiento de historial\n・Disponible 24/7\n\nPrueba gratis primero.",
      fr: "Nous proposons un plan mensuel simple:\n\n【Plan Mensuel】1 980¥/mois\n・Lectures illimitées\n・Accès aux 6 oracles\n・Lecture d'images (chiromancie)\n・Entrée vocale\n・Résultats détaillés\n・Stockage de l'historique\n・Disponible 24h/24\n\nEssayez d'abord gratuitement.",
    },
  },
  {
    category: "pricing",
    q: {
      ja: "支払い方法は何がありますか？",
      en: "What payment methods are available?",
      zh: "有哪些支付方式？",
      ko: "어떤 결제 방법이 있나요?",
      es: "¿Qué métodos de pago están disponibles?",
      fr: "Quels modes de paiement sont disponibles ?",
    },
    a: {
      ja: "現在、銀行振込とクレジットカード決済に対応しています。銀行振込の場合は、振込確認後にプランが有効化されます。クレジットカード決済は即時反映されます。",
      en: "We currently accept bank transfers and credit card payments. For bank transfers, your plan will be activated after payment confirmation. Credit card payments are processed immediately.",
      zh: "目前支持银行转账和信用卡支付。银行转账确认后，方案将被激活。信用卡支付即时生效。",
      ko: "현재 은행 송금과 신용카드 결제를 지원합니다. 은행 송금의 경우 입금 확인 후 플랜이 활성화됩니다. 신용카드 결제는 즉시 반영됩니다.",
      es: "Actualmente aceptamos transferencias bancarias y pagos con tarjeta de crédito. Para transferencias, tu plan se activará después de la confirmación. Los pagos con tarjeta se procesan inmediatamente.",
      fr: "Nous acceptons actuellement les virements bancaires et les paiements par carte de crédit. Pour les virements, votre plan sera activé après confirmation. Les paiements par carte sont traités immédiatement.",
    },
  },
  {
    category: "pricing",
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
      en: "Yes, you can cancel anytime. You can continue using the service until your current period ends. Note that canceling will reset your intimacy levels with the oracles.",
      zh: "是的，您可以随时取消。取消后，在有效期内仍可使用服务。请注意，取消后与占卜师的亲密度将被重置。",
      ko: "네, 언제든지 해지 가능합니다. 해지 후에도 유효 기간 내에는 서비스를 이용하실 수 있습니다. 단, 해지하면 점술사와의 친밀도가 리셋되니 주의해 주세요.",
      es: "Sí, puedes cancelar en cualquier momento. Puedes seguir usando el servicio hasta que termine tu período actual. Ten en cuenta que cancelar reiniciará tus niveles de intimidad con los oráculos.",
      fr: "Oui, vous pouvez annuler à tout moment. Vous pouvez continuer à utiliser le service jusqu'à la fin de votre période actuelle. Notez que l'annulation réinitialisera vos niveaux d'intimité avec les oracles.",
    },
  },
  {
    category: "usage",
    q: {
      ja: "どのように占いを始めればいいですか？",
      en: "How do I start a reading?",
      zh: "如何开始占卜？",
      ko: "어떻게 점을 시작하나요?",
      es: "¿Cómo empiezo una lectura?",
      fr: "Comment commencer une lecture ?",
    },
    a: {
      ja: "1. ログイン後、ダッシュボードで占い師を選択\n2. チャット画面で悩みや質問を入力\n3. 占い師からの回答を受け取る\n\nまずは気になる占い師を選んで、気軽に話しかけてみてください。",
      en: "1. After logging in, select an oracle from the dashboard\n2. Enter your question in the chat\n3. Receive the oracle's response\n\nStart by choosing an oracle you're interested in and feel free to ask anything.",
      zh: "1. 登录后，在仪表板选择占卜师\n2. 在聊天界面输入您的问题\n3. 接收占卜师的回答\n\n首先选择您感兴趣的占卜师，随意提问即可。",
      ko: "1. 로그인 후 대시보드에서 점술사를 선택\n2. 채팅 화면에서 고민이나 질문을 입력\n3. 점술사의 답변을 받음\n\n먼저 관심 있는 점술사를 선택하고 편하게 말을 걸어보세요.",
      es: "1. Después de iniciar sesión, selecciona un oráculo del panel\n2. Ingresa tu pregunta en el chat\n3. Recibe la respuesta del oráculo\n\nComienza eligiendo un oráculo que te interese y pregunta lo que quieras.",
      fr: "1. Après connexion, sélectionnez un oracle depuis le tableau de bord\n2. Entrez votre question dans le chat\n3. Recevez la réponse de l'oracle\n\nCommencez par choisir un oracle qui vous intéresse et posez vos questions librement.",
    },
  },
  {
    category: "usage",
    q: {
      ja: "親密度とは何ですか？",
      en: "What is the intimacy system?",
      zh: "亲密度是什么？",
      ko: "친밀도란 무엇인가요?",
      es: "¿Qué es el sistema de intimidad?",
      fr: "Qu'est-ce que le système d'intimité ?",
    },
    a: {
      ja: "占い師との会話を重ねることで親密度が上がります。親密度が高くなると、より深く詳細な鑑定を受けられるようになります。レベル3以上で深い鑑定、レベル5以上でより具体的なアドバイス、レベル8以上で最もパーソナルな鑑定が受けられます。",
      en: "Your intimacy level increases as you have more conversations with an oracle. Higher intimacy unlocks deeper, more detailed readings. Level 3+ for deep readings, Level 5+ for specific advice, Level 8+ for the most personal readings.",
      zh: "与占卜师交流越多，亲密度越高。亲密度越高，可以获得更深入详细的占卜。3级以上可获得深度占卜，5级以上可获得更具体的建议，8级以上可获得最个性化的占卜。",
      ko: "점술사와의 대화를 거듭할수록 친밀도가 올라갑니다. 친밀도가 높아지면 더 깊고 상세한 감정을 받을 수 있습니다. 레벨 3 이상에서 깊은 감정, 레벨 5 이상에서 더 구체적인 조언, 레벨 8 이상에서 가장 개인적인 감정을 받을 수 있습니다.",
      es: "Tu nivel de intimidad aumenta a medida que conversas más con un oráculo. Mayor intimidad desbloquea lecturas más profundas y detalladas. Nivel 3+ para lecturas profundas, Nivel 5+ para consejos específicos, Nivel 8+ para las lecturas más personales.",
      fr: "Votre niveau d'intimité augmente avec plus de conversations avec un oracle. Une intimité plus élevée débloque des lectures plus profondes et détaillées. Niveau 3+ pour des lectures profondes, Niveau 5+ pour des conseils spécifiques, Niveau 8+ pour les lectures les plus personnelles.",
    },
  },
  {
    category: "usage",
    q: {
      ja: "鑑定履歴は確認できますか？",
      en: "Can I view my reading history?",
      zh: "可以查看占卜历史吗？",
      ko: "감정 기록을 확인할 수 있나요?",
      es: "¿Puedo ver mi historial de lecturas?",
      fr: "Puis-je voir mon historique de lectures ?",
    },
    a: {
      ja: "はい、ダッシュボードの「鑑定履歴」から過去の鑑定内容を確認できます。全ての履歴が無期限で保存されます。",
      en: "Yes, you can view past readings from 'Reading History' in the dashboard. All history is stored indefinitely.",
      zh: "是的，可以从仪表板的「占卜历史」查看过去的占卜内容。所有历史记录将永久保存。",
      ko: "네, 대시보드의 '감정 기록'에서 과거 감정 내용을 확인할 수 있습니다. 모든 기록이 무기한 저장됩니다.",
      es: "Sí, puedes ver lecturas pasadas desde 'Historial de Lecturas' en el panel. Todo el historial se almacena indefinidamente.",
      fr: "Oui, vous pouvez voir les lectures passées depuis 'Historique des Lectures' dans le tableau de bord. Tout l'historique est stocké indéfiniment.",
    },
  },
  {
    category: "account",
    q: {
      ja: "アカウントの登録方法を教えてください",
      en: "How do I register an account?",
      zh: "如何注册账户？",
      ko: "계정 등록 방법을 알려주세요",
      es: "¿Cómo registro una cuenta?",
      fr: "Comment créer un compte ?",
    },
    a: {
      ja: "トップページの「ログイン / 新規登録」ボタンから、メールアドレスとパスワードで簡単に登録できます。パスワードは12文字以上で、文字・数字・記号を含める必要があります。",
      en: "Click 'Login / Sign Up' on the homepage to register with your email and password. Password must be at least 12 characters including letters, numbers, and symbols.",
      zh: "点击首页的「登录/注册」按钮，使用邮箱和密码即可轻松注册。密码必须至少12个字符，包含字母、数字和符号。",
      ko: "홈페이지의 '로그인 / 가입' 버튼을 클릭하여 이메일과 비밀번호로 간단히 등록할 수 있습니다. 비밀번호는 12자 이상이어야 하며, 문자・숫자・기호를 포함해야 합니다.",
      es: "Haz clic en 'Iniciar sesión / Registrarse' en la página principal para registrarte con tu correo y contraseña. La contraseña debe tener al menos 12 caracteres incluyendo letras, números y símbolos.",
      fr: "Cliquez sur 'Connexion / Inscription' sur la page d'accueil pour vous inscrire avec votre e-mail et mot de passe. Le mot de passe doit comporter au moins 12 caractères incluant lettres, chiffres et symboles.",
    },
  },
  {
    category: "account",
    q: {
      ja: "パスワードを忘れた場合はどうすればいいですか？",
      en: "What if I forgot my password?",
      zh: "忘记密码怎么办？",
      ko: "비밀번호를 잊어버렸을 때는 어떻게 하나요?",
      es: "¿Qué hago si olvidé mi contraseña?",
      fr: "Que faire si j'ai oublié mon mot de passe ?",
    },
    a: {
      ja: "ログインページの「パスワードを忘れた方」をクリックし、登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。",
      en: "Click 'Forgot Password' on the login page and enter your registered email. We'll send you a password reset link.",
      zh: "点击登录页面的「忘记密码」，输入注册邮箱。我们将发送密码重置链接。",
      ko: "로그인 페이지의 '비밀번호 찾기'를 클릭하고 등록한 이메일 주소를 입력하세요. 비밀번호 재설정 링크를 보내드립니다.",
      es: "Haz clic en '¿Olvidaste tu contraseña?' en la página de inicio de sesión e ingresa tu correo registrado. Te enviaremos un enlace para restablecer tu contraseña.",
      fr: "Cliquez sur 'Mot de passe oublié' sur la page de connexion et entrez votre e-mail enregistré. Nous vous enverrons un lien de réinitialisation.",
    },
  },
  {
    category: "security",
    q: {
      ja: "個人情報は安全に管理されていますか？",
      en: "Is my personal information secure?",
      zh: "个人信息安全吗？",
      ko: "개인정보는 안전하게 관리되나요?",
      es: "¿Está segura mi información personal?",
      fr: "Mes informations personnelles sont-elles sécurisées ?",
    },
    a: {
      ja: "はい、お客様の個人情報は厳重に管理しています。SSL暗号化通信を使用し、第三者への提供は行いません。詳しくはプライバシーポリシーをご確認ください。",
      en: "Yes, your personal information is strictly protected. We use SSL encryption and do not share data with third parties. Please see our Privacy Policy for details.",
      zh: "是的，您的个人信息受到严格保护。我们使用SSL加密，不会向第三方提供数据。详情请参阅隐私政策。",
      ko: "네, 고객님의 개인정보는 엄격하게 관리됩니다. SSL 암호화 통신을 사용하며, 제3자에게 제공하지 않습니다. 자세한 내용은 개인정보 처리방침을 확인해 주세요.",
      es: "Sí, tu información personal está estrictamente protegida. Usamos encriptación SSL y no compartimos datos con terceros. Consulta nuestra Política de Privacidad para más detalles.",
      fr: "Oui, vos informations personnelles sont strictement protégées. Nous utilisons le cryptage SSL et ne partageons pas les données avec des tiers. Consultez notre Politique de Confidentialité pour plus de détails.",
    },
  },
  {
    category: "usage",
    q: {
      ja: "見守りモードとは何ですか？",
      en: "What is Watch Mode?",
      zh: "什么是守护模式？",
      ko: "지켜보기 모드란 무엇인가요?",
      es: "¿Qué es el Modo Vigilancia?",
      fr: "Qu'est-ce que le Mode Veille ?",
    },
    a: {
      ja: "見守りモードは、占い師があなたの日常をそっと見守る機能です。\n\n【主な機能】\n・暦のイベント（新月・満月・節分など）に合わせたメッセージ\n・朝の挨拶メッセージ\n・記念日のお祝いメッセージ\n\n設定画面からオン/オフを切り替えられます。お好みの占い師を指定することもできます。",
      en: "Watch Mode is a feature where oracles gently watch over your daily life.\n\n【Main Features】\n・Messages aligned with calendar events (new moon, full moon, setsubun, etc.)\n・Morning greeting messages\n・Anniversary celebration messages\n\nYou can toggle it on/off from settings. You can also specify your preferred oracle.",
      zh: "守护模式是占卜师默默守护您日常生活的功能。\n\n【主要功能】\n・根据日历事件（新月、满月、立春等）发送消息\n・早问候消息\n・纪念日祝福消息\n\n可以在设置中开关。也可以指定您喜欢的占卜师。",
      ko: "지켜보기 모드는 점술사가 당신의 일상을 조용히 지켜보는 기능입니다.\n\n【주요 기능】\n・달력 이벤트(초승달, 보름달, 절분 등)에 맞춤 메시지\n・아침 인사 메시지\n・기념일 축하 메시지\n\n설정에서 켜고 끌 수 있습니다. 선호하는 점술사를 지정할 수도 있습니다.",
      es: "El Modo Vigilancia es una función donde los oráculos cuidan suavemente tu vida diaria.\n\n【Características Principales】\n・Mensajes alineados con eventos del calendario (luna nueva, luna llena, etc.)\n・Mensajes de saludo matutino\n・Mensajes de celebración de aniversarios\n\nPuedes activarlo/desactivarlo desde la configuración. También puedes especificar tu oráculo preferido.",
      fr: "Le Mode Veille est une fonctionnalité où les oracles veillent doucement sur votre vie quotidienne.\n\n【Fonctionnalités Principales】\n・Messages alignés sur les événements du calendrier (nouvelle lune, pleine lune, etc.)\n・Messages de salutation matinale\n・Messages de célébration d'anniversaire\n\nVous pouvez l'activer/désactiver depuis les paramètres. Vous pouvez également spécifier votre oracle préféré.",
    },
  },
  {
    category: "usage",
    q: {
      ja: "MBTI診断とは何ですか？",
      en: "What is MBTI diagnosis?",
      zh: "什么是MBTI诊断？",
      ko: "MBTI 진단이란 무엇인가요?",
      es: "¿Qué es el diagnóstico MBTI?",
      fr: "Qu'est-ce que le diagnostic MBTI ?",
    },
    a: {
      ja: "MBTI（Myers-Briggs Type Indicator）は、心理学に基づいた性格タイプ診断です。16種類の性格タイプに分類され、自分自身の強みや傾向を理解するのに役立ちます。\n\n【六神ノ間でのMBTI診断】\n・占い師「心理」がMBTI診断を担当\n・チャットでの質問に答えることで診断\n・診断結果に基づいた詳細なアドバイス\n・相性診断や適職診断も可能\n\n【グループ診断機能】\n・友達やパートナーと一緒に診断可能\n・グループ内の相性分析\n・チームの強み・弱みの把握\n・招待リンクで簡単に参加\n\n占い師「心理」に話しかけて、あなたの性格タイプを診断してみましょう。",
      en: "MBTI (Myers-Briggs Type Indicator) is a psychology-based personality type assessment. It classifies people into 16 personality types and helps understand your strengths and tendencies.\n\n【MBTI at Six Oracle】\n・Oracle 'Shinri' handles MBTI diagnosis\n・Diagnose through chat questions\n・Detailed advice based on results\n・Compatibility and career guidance available\n\n【Group Diagnosis Feature】\n・Diagnose together with friends or partners\n・Group compatibility analysis\n・Understand team strengths and weaknesses\n・Easy to join via invitation link\n\nTalk to oracle 'Shinri' to discover your personality type.",
      zh: "MBTI（迈尔斯-布里格斯类型指标）是基于心理学的性格类型评估。它将人分为16种性格类型，帮助了解您的优势和倾向。\n\n【六神之间的MBTI诊断】\n・占卜师「心理」负责MBTI诊断\n・通过聊天问答进行诊断\n・基于结果提供详细建议\n・可进行相性诊断和职业指导\n\n【团体诊断功能】\n・可与朋友或伴侣一起诊断\n・团体相性分析\n・了解团队优势和劣势\n・通过邀请链接轻松加入\n\n与占卜师「心理」交谈，发现您的性格类型。",
      ko: "MBTI(Myers-Briggs Type Indicator)는 심리학에 기반한 성격 유형 진단입니다. 16가지 성격 유형으로 분류되어 자신의 강점과 경향을 이해하는 데 도움이 됩니다.\n\n【육신의 방에서의 MBTI 진단】\n・점술사 '신리'가 MBTI 진단 담당\n・채팅 질문에 답하여 진단\n・결과에 기반한 상세한 조언\n・궁합 진단 및 적성 진단 가능\n\n【그룹 진단 기능】\n・친구나 파트너와 함께 진단 가능\n・그룹 내 궁합 분석\n・팀의 강점・약점 파악\n・초대 링크로 쉽게 참여\n\n점술사 '신리'에게 말을 걸어 당신의 성격 유형을 진단해 보세요.",
      es: "MBTI (Indicador de Tipo Myers-Briggs) es una evaluación de personalidad basada en psicología. Clasifica a las personas en 16 tipos de personalidad y ayuda a entender tus fortalezas y tendencias.\n\n【MBTI en Six Oracle】\n・El oráculo 'Shinri' maneja el diagnóstico MBTI\n・Diagnóstico a través de preguntas en el chat\n・Consejos detallados basados en resultados\n・Compatibilidad y orientación profesional disponibles\n\n【Función de Diagnóstico Grupal】\n・Diagnóstico junto con amigos o parejas\n・Análisis de compatibilidad grupal\n・Entender fortalezas y debilidades del equipo\n・Fácil unirse mediante enlace de invitación\n\nHabla con el oráculo 'Shinri' para descubrir tu tipo de personalidad.",
      fr: "MBTI (Myers-Briggs Type Indicator) est une évaluation de personnalité basée sur la psychologie. Il classe les gens en 16 types de personnalité et aide à comprendre vos forces et tendances.\n\n【MBTI chez Six Oracle】\n・L'oracle 'Shinri' gère le diagnostic MBTI\n・Diagnostic par questions dans le chat\n・Conseils détaillés basés sur les résultats\n・Compatibilité et orientation de carrière disponibles\n\n【Fonction de Diagnostic de Groupe】\n・Diagnostic avec amis ou partenaires\n・Analyse de compatibilité de groupe\n・Comprendre les forces et faiblesses de l'équipe\n・Rejoindre facilement via lien d'invitation\n\nParlez à l'oracle 'Shinri' pour découvrir votre type de personnalité.",
    },
  },
  {
    category: "usage",
    q: {
      ja: "MBTIグループ診断はどうやって使いますか？",
      en: "How do I use MBTI group diagnosis?",
      zh: "如何使用MBTI团体诊断？",
      ko: "MBTI 그룹 진단은 어떻게 사용하나요?",
      es: "¿Cómo uso el diagnóstico grupal MBTI?",
      fr: "Comment utiliser le diagnostic de groupe MBTI ?",
    },
    a: {
      ja: "MBTIグループ診断は、友達やチームメンバーと一緒に性格診断を行い、グループ全体の相性や特徴を分析できる機能です。\n\n【使い方】\n1. ダッシュボードのメニューから「MBTIグループ診断」を選択\n2. 「新しいグループを作成」をクリック\n3. グループ名を入力して作成\n4. 招待リンクをコピーして友達に共有\n5. メンバーが参加したら「結果を見る」で分析\n\n【分析内容】\n・各メンバーの性格タイプ\n・グループ全体の傾向\n・メンバー間の相性\n・コミュニケーションのコツ\n\nプレミアム会員は無制限でグループを作成できます。",
      en: "MBTI group diagnosis allows you to take personality tests with friends or team members and analyze the group's overall compatibility and characteristics.\n\n【How to Use】\n1. Select 'MBTI Group Diagnosis' from the dashboard menu\n2. Click 'Create New Group'\n3. Enter group name and create\n4. Copy invitation link and share with friends\n5. View analysis when members join\n\n【Analysis Includes】\n・Each member's personality type\n・Overall group tendencies\n・Compatibility between members\n・Communication tips\n\nPremium members can create unlimited groups.",
      zh: "MBTI团体诊断允许您与朋友或团队成员一起进行性格测试，分析团体的整体相性和特征。\n\n【使用方法】\n1. 从仪表板菜单选择「MBTI团体诊断」\n2. 点击「创建新团体」\n3. 输入团体名称并创建\n4. 复制邀请链接分享给朋友\n5. 成员加入后查看分析\n\n【分析内容】\n・每位成员的性格类型\n・团体整体倾向\n・成员间的相性\n・沟通技巧\n\n高级会员可无限创建团体。",
      ko: "MBTI 그룹 진단은 친구나 팀원과 함께 성격 진단을 하고 그룹 전체의 궁합과 특징을 분석할 수 있는 기능입니다.\n\n【사용법】\n1. 대시보드 메뉴에서 'MBTI 그룹 진단' 선택\n2. '새 그룹 만들기' 클릭\n3. 그룹 이름 입력 후 생성\n4. 초대 링크를 복사하여 친구에게 공유\n5. 멤버가 참여하면 분석 보기\n\n【분석 내용】\n・각 멤버의 성격 유형\n・그룹 전체 경향\n・멤버 간 궁합\n・커뮤니케이션 팁\n\n프리미엄 회원은 무제한으로 그룹을 만들 수 있습니다.",
      es: "El diagnóstico grupal MBTI te permite hacer pruebas de personalidad con amigos o miembros del equipo y analizar la compatibilidad y características del grupo.\n\n【Cómo Usar】\n1. Selecciona 'Diagnóstico Grupal MBTI' del menú del panel\n2. Haz clic en 'Crear Nuevo Grupo'\n3. Ingresa el nombre del grupo y crea\n4. Copia el enlace de invitación y comparte\n5. Ve el análisis cuando los miembros se unan\n\n【El Análisis Incluye】\n・Tipo de personalidad de cada miembro\n・Tendencias generales del grupo\n・Compatibilidad entre miembros\n・Consejos de comunicación\n\nLos miembros Premium pueden crear grupos ilimitados.",
      fr: "Le diagnostic de groupe MBTI vous permet de faire des tests de personnalité avec des amis ou des membres de l'équipe et d'analyser la compatibilité et les caractéristiques du groupe.\n\n【Comment Utiliser】\n1. Sélectionnez 'Diagnostic de Groupe MBTI' dans le menu du tableau de bord\n2. Cliquez sur 'Créer un Nouveau Groupe'\n3. Entrez le nom du groupe et créez\n4. Copiez le lien d'invitation et partagez\n5. Voir l'analyse quand les membres rejoignent\n\n【L'Analyse Comprend】\n・Type de personnalité de chaque membre\n・Tendances générales du groupe\n・Compatibilité entre membres\n・Conseils de communication\n\nLes membres Premium peuvent créer des groupes illimités.",
    },
  },
  {
    category: "security",
    q: {
      ja: "鑑定内容は他の人に見られますか？",
      en: "Can others see my readings?",
      zh: "其他人能看到我的占卜内容吗？",
      ko: "다른 사람이 제 감정 내용을 볼 수 있나요?",
      es: "¿Pueden otros ver mis lecturas?",
      fr: "D'autres peuvent-ils voir mes lectures ?",
    },
    a: {
      ja: "いいえ、鑑定内容は完全にプライベートです。あなたと占い師の間でのみ共有され、他のユーザーや第三者が閲覧することはできません。",
      en: "No, your readings are completely private. They are shared only between you and the oracle, and cannot be viewed by other users or third parties.",
      zh: "不能，您的占卜内容完全私密。仅在您和占卜师之间共享，其他用户或第三方无法查看。",
      ko: "아니요, 감정 내용은 완전히 비공개입니다. 당신과 점술사 사이에서만 공유되며, 다른 사용자나 제3자가 열람할 수 없습니다.",
      es: "No, tus lecturas son completamente privadas. Se comparten solo entre tú y el oráculo, y no pueden ser vistas por otros usuarios o terceros.",
      fr: "Non, vos lectures sont complètement privées. Elles sont partagées uniquement entre vous et l'oracle, et ne peuvent pas être vues par d'autres utilisateurs ou tiers.",
    },
  },
];

const pageText = {
  title: {
    ja: "よくある質問",
    en: "Frequently Asked Questions",
    zh: "常见问题",
    ko: "자주 묻는 질문",
    es: "Preguntas Frecuentes",
    fr: "Questions Fréquentes",
  },
  subtitle: {
    ja: "ご不明な点がございましたら、まずはこちらをご確認ください",
    en: "Please check here first if you have any questions",
    zh: "如有疑问，请先查看此处",
    ko: "궁금한 점이 있으시면 먼저 여기를 확인해 주세요",
    es: "Por favor, consulte aquí primero si tiene alguna pregunta",
    fr: "Veuillez d'abord consulter ici si vous avez des questions",
  },
  searchPlaceholder: {
    ja: "質問を検索...",
    en: "Search questions...",
    zh: "搜索问题...",
    ko: "질문 검색...",
    es: "Buscar preguntas...",
    fr: "Rechercher des questions...",
  },
  noResults: {
    ja: "該当する質問が見つかりませんでした",
    en: "No matching questions found",
    zh: "未找到匹配的问题",
    ko: "일치하는 질문을 찾을 수 없습니다",
    es: "No se encontraron preguntas coincidentes",
    fr: "Aucune question correspondante trouvée",
  },
  contactPrompt: {
    ja: "お探しの回答が見つかりませんでしたか？",
    en: "Couldn't find the answer you're looking for?",
    zh: "没有找到您需要的答案？",
    ko: "찾으시는 답변을 찾지 못하셨나요?",
    es: "¿No encontró la respuesta que buscaba?",
    fr: "Vous n'avez pas trouvé la réponse que vous cherchiez ?",
  },
  contactLink: {
    ja: "お問い合わせフォームからご連絡ください",
    en: "Please contact us through our inquiry form",
    zh: "请通过咨询表单联系我们",
    ko: "문의 양식을 통해 연락해 주세요",
    es: "Por favor, contáctenos a través de nuestro formulario",
    fr: "Veuillez nous contacter via notre formulaire",
  },
  backToHome: {
    ja: "ホームに戻る",
    en: "Back to Home",
    zh: "返回首页",
    ko: "홈으로 돌아가기",
    es: "Volver al inicio",
    fr: "Retour à l'accueil",
  },
};

export default function FAQ() {
  const { language, t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        faq.q[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a[language].toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, language]);

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
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-serif text-gold mb-4">
              {pageText.title[language]}
            </h1>
            <p className="text-muted-foreground">
              {pageText.subtitle[language]}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={pageText.searchPlaceholder[language]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 bg-white/5 border-white/10 focus:border-gold/50 rounded-xl text-lg"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8 justify-center"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? "bg-gold/20 text-gold border border-gold/50"
                      : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.label[language]}</span>
                </button>
              );
            })}
          </motion.div>

          {/* FAQ List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredFaqs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{pageText.noResults[language]}</p>
                </motion.div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const originalIndex = faqData.indexOf(faq);
                  const category = categories.find(c => c.id === faq.category);
                  const CategoryIcon = category?.icon || HelpCircle;
                  
                  return (
                    <motion.div
                      key={originalIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Collapsible
                        open={openItems.includes(originalIndex)}
                        onOpenChange={() => toggleItem(originalIndex)}
                      >
                        <div className="glass-card rounded-xl overflow-hidden border border-white/5 hover:border-gold/20 transition-colors">
                          <CollapsibleTrigger className="w-full px-6 py-5 flex items-start gap-4 text-left hover:bg-white/5 transition-colors">
                            <div className={`p-2 rounded-lg ${
                              openItems.includes(originalIndex) ? "bg-gold/20" : "bg-white/5"
                            }`}>
                              <CategoryIcon className={`w-5 h-5 ${
                                openItems.includes(originalIndex) ? "text-gold" : "text-muted-foreground"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-white leading-relaxed">
                                {faq.q[language]}
                              </span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gold flex-shrink-0 mt-1 transition-transform duration-300 ${
                              openItems.includes(originalIndex) ? "rotate-180" : ""
                            }`} />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-6 pb-5 pl-[4.5rem] text-muted-foreground leading-relaxed whitespace-pre-line">
                              {faq.a[language]}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contact Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center glass-card rounded-xl p-8 border border-gold/20"
          >
            <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {pageText.contactPrompt[language]}
            </p>
            <Link href="/contact">
              <Button variant="outline" className="border-gold/30 hover:bg-gold/10 text-gold">
                {pageText.contactLink[language]}
              </Button>
            </Link>
          </motion.div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-white">
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
