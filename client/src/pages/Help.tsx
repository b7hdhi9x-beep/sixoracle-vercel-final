import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { 
  Moon, 
  ChevronRight, 
  UserPlus, 
  LogIn, 
  MessageCircle, 
  CreditCard, 
  Settings, 
  Heart,
  Sparkles,
  BookOpen,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { motion, AnimatePresence } from "framer-motion";

// Help guide sections
const helpGuides = [
  {
    id: "getting-started",
    icon: UserPlus,
    color: "from-blue-500 to-cyan-500",
    title: {
      ja: "はじめての方へ",
      en: "Getting Started",
      zh: "新手入门",
      ko: "처음 오신 분께",
      es: "Para Empezar",
      fr: "Pour Commencer",
    },
    description: {
      ja: "アカウント登録から初めての鑑定まで",
      en: "From registration to your first reading",
      zh: "从注册到首次占卜",
      ko: "계정 등록부터 첫 감정까지",
      es: "Desde el registro hasta tu primera lectura",
      fr: "De l'inscription à votre première lecture",
    },
    steps: [
      {
        title: { ja: "アカウント登録", en: "Create Account", zh: "注册账户", ko: "계정 등록", es: "Crear Cuenta", fr: "Créer un Compte" },
        content: {
          ja: "トップページの「ログイン / 新規登録」ボタンをクリックし、電話番号またはメールアドレスで登録します。登録は無料で、すぐに占いを始められます。",
          en: "Click 'Login / Sign Up' on the homepage and register with your phone number or email. Registration is free and you can start your reading immediately.",
          zh: "点击首页的「登录/注册」按钮，使用电话号码或邮箱注册。注册免费，可以立即开始占卜。",
          ko: "홈페이지의 '로그인 / 가입' 버튼을 클릭하고 전화번호 또는 이메일로 등록합니다. 등록은 무료이며 바로 감정을 시작할 수 있습니다.",
          es: "Haz clic en 'Iniciar sesión / Registrarse' y regístrate con tu número de teléfono o correo. El registro es gratuito y puedes comenzar tu lectura de inmediato.",
          fr: "Cliquez sur 'Connexion / Inscription' et inscrivez-vous avec votre numéro de téléphone ou e-mail. L'inscription est gratuite et vous pouvez commencer votre lecture immédiatement.",
        },
      },
      {
        title: { ja: "占い師を選ぶ", en: "Choose an Oracle", zh: "选择占卜师", ko: "점술사 선택", es: "Elegir un Oráculo", fr: "Choisir un Oracle" },
        content: {
          ja: "10人以上の占い師から相談したい占い師を選びます。各占い師には得意分野があります：\n・蒼真：タロット占い\n・玲蘭：数秘術\n・朔夜：月と星の占い\n・灯：オラクルカード\n・結衣：恋愛占い\n・玄：東洋占術\n・紫苑：スピリチュアル\n・星蘭：西洋占星術\n・緋月：手相占い\n・心理：MBTI性格診断",
          en: "Choose from over 10 oracles, each with their specialty:\n・Souma: Tarot\n・Reiran: Numerology\n・Sakuya: Moon & Stars\n・Akari: Oracle Cards\n・Yui: Love\n・Gen: Eastern Divination\n・Shion: Spiritual\n・Seiran: Western Astrology\n・Hizuki: Palm Reading\n・Shinri: MBTI Personality",
          zh: "从10位以上的占卜师中选择，每位都有专长：\n・苍真：塔罗牌\n・玄兰：数字占卜\n・朔夜：月亮与星辰\n・灯：神谕卡\n・结衣：爱情\n・玄：东方占卜\n・紫苑：灵性\n・星兰：西方占星\n・绯月：手相\n・心理：MBTI性格",
          ko: "10명 이상의 점술사 중에서 선택하세요. 각각 전문 분야가 있습니다:\n・소우마: 타로\n・레이란: 수비학\n・사쿠야: 달과 별\n・아카리: 오라클 카드\n・유이: 연애\n・겐: 동양 점술\n・시온: 영적\n・세이란: 서양 점성술\n・히즈키: 손금\n・신리: MBTI 성격",
          es: "Elige entre más de 10 oráculos, cada uno con su especialidad:\n・Souma: Tarot\n・Reiran: Numerología\n・Sakuya: Luna y Estrellas\n・Akari: Cartas Oráculo\n・Yui: Amor\n・Gen: Adivinación Oriental\n・Shion: Espiritual\n・Seiran: Astrología Occidental\n・Hizuki: Quiromancia\n・Shinri: Personalidad MBTI",
          fr: "Choisissez parmi plus de 10 oracles, chacun avec sa spécialité:\n・Souma: Tarot\n・Reiran: Numérologie\n・Sakuya: Lune et Étoiles\n・Akari: Cartes Oracle\n・Yui: Amour\n・Gen: Divination Orientale\n・Shion: Spirituel\n・Seiran: Astrologie Occidentale\n・Hizuki: Chiromancie\n・Shinri: Personnalité MBTI",
        },
      },
      {
        title: { ja: "悩みを相談", en: "Ask Your Question", zh: "咨询问题", ko: "고민 상담", es: "Haz tu Pregunta", fr: "Posez Votre Question" },
        content: {
          ja: "チャット画面で悩みや質問を入力します。占い師があなたの運命を読み解き、アドバイスをお伝えします。24時間いつでも相談可能です。音声入力や画像鑑定（手相占い）にも対応しています。",
          en: "Enter your question in the chat. The oracle will interpret your destiny and provide advice. Available 24/7. Voice input and image reading (palm reading) are also supported.",
          zh: "在聊天界面输入您的问题。占卜师将解读您的命运并提供建议　24小时随时可用。还支持语音输入和图像占卜（手相）。",
          ko: "채팅 화면에서 고민이나 질문을 입력합니다. 점술사가 당신의 운명을 읽고 조언을 드립니다. 24시간 언제든지 상담 가능합니다. 음성 입력과 이미지 감정(손금)도 지원됩니다.",
          es: "Ingresa tu pregunta en el chat. El oráculo interpretará tu destino y te dará consejos. Disponible 24/7. También se admite entrada de voz y lectura de imágenes (quiromancia).",
          fr: "Entrez votre question dans le chat. L'oracle interprétera votre destin et vous donnera des conseils. Disponible 24h/24. L'entrée vocale et la lecture d'images (chiromancie) sont également prises en charge.",
        },
      },
      {
        title: { ja: "鑑定履歴の保存", en: "Save Your History", zh: "保存占卜记录", ko: "감정 기록 저장", es: "Guardar tu Historial", fr: "Sauvegarder votre Historique" },
        content: {
          ja: "すべての鑑定履歴は自動的に保存され、いつでも振り返ることができます。ダッシュボードの「鑑定履歴」から過去の鑑定を確認できます。",
          en: "All your reading history is automatically saved and you can review it anytime. Check your past readings from 'Reading History' on the dashboard.",
          zh: "您的所有占卜记录都会自动保存，可以随时回顾。从仪表板的「占卜记录」查看过去的占卜。",
          ko: "모든 감정 기록은 자동으로 저장되며 언제든지 확인할 수 있습니다. 대시보드의 '감정 기록'에서 과거 감정을 확인하세요.",
          es: "Todo tu historial de lecturas se guarda automáticamente y puedes revisarlo en cualquier momento. Consulta tus lecturas pasadas desde 'Historial de Lecturas' en el panel.",
          fr: "Tout votre historique de lectures est automatiquement sauvegardé et vous pouvez le consulter à tout moment. Vérifiez vos lectures passées depuis 'Historique des Lectures' sur le tableau de bord.",
        },
      },
    ],
  },
  {
    id: "reading",
    icon: MessageCircle,
    color: "from-purple-500 to-pink-500",
    title: {
      ja: "鑑定の受け方",
      en: "How to Get Readings",
      zh: "如何获得占卜",
      ko: "감정 받는 방법",
      es: "Cómo Obtener Lecturas",
      fr: "Comment Obtenir des Lectures",
    },
    description: {
      ja: "より深い鑑定を受けるためのコツ",
      en: "Tips for getting deeper readings",
      zh: "获得更深入占卜的技巧",
      ko: "더 깊은 감정을 받기 위한 팁",
      es: "Consejos para lecturas más profundas",
      fr: "Conseils pour des lectures plus profondes",
    },
    steps: [
      {
        title: { ja: "具体的に質問する", en: "Be Specific", zh: "具体提问", ko: "구체적으로 질문하기", es: "Sé Específico", fr: "Soyez Précis" },
        content: {
          ja: "「恋愛運を教えて」より「今の彼との関係はどうなりますか？」のように具体的に聞くと、より詳しい鑑定が受けられます。",
          en: "Instead of 'Tell me about love', ask 'How will my relationship with my current partner develop?' for more detailed readings.",
          zh: "比起「告诉我爱情运」，问「我和现在的他/她的关系会怎样？」这样具体的问题可以获得更详细的占卜。",
          ko: "'연애운을 알려줘'보다 '지금 그/그녀와의 관계는 어떻게 될까요?'처럼 구체적으로 물으면 더 자세한 감정을 받을 수 있습니다.",
          es: "En lugar de 'Cuéntame sobre el amor', pregunta '¿Cómo se desarrollará mi relación con mi pareja actual?' para lecturas más detalladas.",
          fr: "Au lieu de 'Parlez-moi de l'amour', demandez 'Comment va évoluer ma relation avec mon partenaire actuel ?' pour des lectures plus détaillées.",
        },
      },
      {
        title: { ja: "親密度を上げる", en: "Build Intimacy", zh: "提高亲密度", ko: "친밀도 올리기", es: "Construir Intimidad", fr: "Construire l'Intimité" },
        content: {
          ja: "同じ占い師と会話を重ねると親密度が上がり、より深い鑑定が受けられるようになります。レベル3以上で深い鑑定、レベル8以上で最もパーソナルな鑑定が可能です。",
          en: "Conversing more with the same oracle increases intimacy, unlocking deeper readings. Level 3+ for deep readings, Level 8+ for the most personal readings.",
          zh: "与同一位占卜师多次交流可以提高亲密度，从而获得更深入的占卜。3级以上可获得深度占卜，8级以上可获得最个性化的占卜。",
          ko: "같은 점술사와 대화를 거듭하면 친밀도가 올라가 더 깊은 감정을 받을 수 있습니다. 레벨 3 이상에서 깊은 감정, 레벨 8 이상에서 가장 개인적인 감정이 가능합니다.",
          es: "Conversar más con el mismo oráculo aumenta la intimidad, desbloqueando lecturas más profundas. Nivel 3+ para lecturas profundas, Nivel 8+ para las más personales.",
          fr: "Converser plus avec le même oracle augmente l'intimité, débloquant des lectures plus profondes. Niveau 3+ pour des lectures profondes, Niveau 8+ pour les plus personnelles.",
        },
      },
      {
        title: { ja: "プレミアム機能を活用", en: "Use Premium Features", zh: "使用高级功能", ko: "프리미엄 기능 활용", es: "Usar Funciones Premium", fr: "Utiliser les Fonctions Premium" },
        content: {
          ja: "プレミアムプランでは、画像鑑定（手相占い）や音声入力など、より多彩な鑑定方法をご利用いただけます。",
          en: "Premium plan offers image readings (palm reading) and voice input for more diverse reading methods.",
          zh: "高级方案提供图像占卜（手相）和语音输入等更多样化的占卜方式。",
          ko: "프리미엄 플랜에서는 이미지 감정(손금)이나 음성 입력 등 더 다양한 감정 방법을 이용할 수 있습니다.",
          es: "El plan Premium ofrece lecturas de imágenes (quiromancia) y entrada de voz para métodos más diversos.",
          fr: "Le plan Premium offre des lectures d'images (chiromancie) et l'entrée vocale pour des méthodes plus diverses.",
        },
      },
    ],
  },
  {
    id: "subscription",
    icon: CreditCard,
    color: "from-amber-500 to-orange-500",
    title: {
      ja: "プラン・お支払い",
      en: "Plans & Payment",
      zh: "方案与支付",
      ko: "플랜 및 결제",
      es: "Planes y Pago",
      fr: "Plans et Paiement",
    },
    description: {
      ja: "料金プランと支払い方法について",
      en: "About pricing plans and payment methods",
      zh: "关于价格方案和支付方式",
      ko: "요금 플랜과 결제 방법에 대해",
      es: "Sobre planes de precios y métodos de pago",
      fr: "À propos des plans tarifaires et méthodes de paiement",
    },
    steps: [
      {
        title: { ja: "料金プラン", en: "Pricing Plan", zh: "价格方案", ko: "요금 플랜", es: "Plan de Precios", fr: "Plan Tarifaire" },
        content: {
          ja: "シンプルな月額プラン（￥1,980/月・税込）で、鑑定回数無制限、6人の占い師全員に相談可能、画像鑑定・音声入力にも対応しています。",
          en: "Simple monthly plan (￥1,980/month) with unlimited readings, access to all 6 oracles, image reading and voice input support.",
          zh: "简单的月付方案（1,980日元/月），占卜次数无限，可咨询全部6位占卜师，支持图像占卜和语音输入。",
          ko: "간단한 월간 플랜(1,980엔/월)으로 감정 횟수 무제한, 6명의 점술사 전원 상담 가능, 이미지 감정과 음성 입력을 지원합니다.",
          es: "Plan mensual simple (￥1,980/mes) con lecturas ilimitadas, acceso a los 6 oráculos, lectura de imágenes y entrada de voz.",
          fr: "Plan mensuel simple (1 980￥/mois) avec lectures illimitées, accès aux 6 oracles, lecture d'images et entrée vocale.",
        },
      },
      {
        title: { ja: "支払い方法", en: "Payment Methods", zh: "支付方式", ko: "결제 방법", es: "Métodos de Pago", fr: "Méthodes de Paiement" },
        content: {
          ja: "銀行振込またはクレジットカードでお支払いいただけます。銀行振込は確認後、クレジットカードは即時にプランが有効化されます。",
          en: "Pay via bank transfer or credit card. Bank transfers activate after confirmation, credit cards activate immediately.",
          zh: "可通过银行转账或信用卡支付。银行转账确认后激活，信用卡即时激活。",
          ko: "은행 송금 또는 신용카드로 결제할 수 있습니다. 은행 송금은 확인 후, 신용카드는 즉시 플랜이 활성화됩니다.",
          es: "Paga por transferencia bancaria o tarjeta de crédito. Las transferencias se activan tras confirmación, las tarjetas inmediatamente.",
          fr: "Payez par virement bancaire ou carte de crédit. Les virements s'activent après confirmation, les cartes immédiatement.",
        },
      },
      {
        title: { ja: "解約について", en: "Cancellation", zh: "关于取消", ko: "해지에 대해", es: "Cancelación", fr: "Annulation" },
        content: {
          ja: "いつでも解約可能です。解約後も有効期間内はサービスをご利用いただけます。ただし、解約すると占い師との親密度がリセットされます。",
          en: "Cancel anytime. You can use the service until your period ends. Note: canceling resets your intimacy levels with oracles.",
          zh: "可随时取消。取消后在有效期内仍可使用服务。注意：取消会重置与占卜师的亲密度。",
          ko: "언제든지 해지 가능합니다. 해지 후에도 유효 기간 내에는 서비스를 이용할 수 있습니다. 단, 해지하면 점술사와의 친밀도가 리셋됩니다.",
          es: "Cancela en cualquier momento. Puedes usar el servicio hasta que termine tu período. Nota: cancelar reinicia tu intimidad con los oráculos.",
          fr: "Annulez à tout moment. Vous pouvez utiliser le service jusqu'à la fin de votre période. Note: l'annulation réinitialise votre intimité avec les oracles.",
        },
      },
    ],
  },
  {
    id: "intimacy",
    icon: Heart,
    color: "from-rose-500 to-red-500",
    title: {
      ja: "親密度システム",
      en: "Intimacy System",
      zh: "亲密度系统",
      ko: "친밀도 시스템",
      es: "Sistema de Intimidad",
      fr: "Système d'Intimité",
    },
    description: {
      ja: "占い師との絆を深める方法",
      en: "How to deepen your bond with oracles",
      zh: "如何加深与占卜师的联系",
      ko: "점술사와의 유대를 깊게 하는 방법",
      es: "Cómo profundizar tu vínculo con los oráculos",
      fr: "Comment approfondir votre lien avec les oracles",
    },
    steps: [
      {
        title: { ja: "親密度とは", en: "What is Intimacy", zh: "什么是亲密度", ko: "친밀도란", es: "Qué es la Intimidad", fr: "Qu'est-ce que l'Intimité" },
        content: {
          ja: "占い師との会話を重ねることで上がるレベルです。親密度が高いほど、より深く詳細な鑑定を受けられます。",
          en: "A level that increases as you converse more with an oracle. Higher intimacy unlocks deeper, more detailed readings.",
          zh: "与占卜师交流越多，等级越高。亲密度越高，可获得更深入详细的占卜。",
          ko: "점술사와의 대화를 거듭할수록 올라가는 레벨입니다. 친밀도가 높을수록 더 깊고 상세한 감정을 받을 수 있습니다.",
          es: "Un nivel que aumenta al conversar más con un oráculo. Mayor intimidad desbloquea lecturas más profundas y detalladas.",
          fr: "Un niveau qui augmente en conversant plus avec un oracle. Une intimité plus élevée débloque des lectures plus profondes et détaillées.",
        },
      },
      {
        title: { ja: "レベル別特典", en: "Level Benefits", zh: "等级特典", ko: "레벨별 특전", es: "Beneficios por Nivel", fr: "Avantages par Niveau" },
        content: {
          ja: "レベル3以上：深い鑑定\nレベル5以上：より具体的なアドバイス\nレベル8以上：最もパーソナルな鑑定\n\n継続して会話することで、より価値ある鑑定が受けられます。",
          en: "Level 3+: Deep readings\nLevel 5+: More specific advice\nLevel 8+: Most personal readings\n\nContinued conversations unlock more valuable readings.",
          zh: "3级以上：深度占卜\n5级以上：更具体的建议\n8级以上：最个性化的占卜\n\n持续交流可获得更有价值的占卜。",
          ko: "레벨 3 이상: 깊은 감정\n레벨 5 이상: 더 구체적인 조언\n레벨 8 이상: 가장 개인적인 감정\n\n지속적인 대화로 더 가치 있는 감정을 받을 수 있습니다.",
          es: "Nivel 3+: Lecturas profundas\nNivel 5+: Consejos más específicos\nNivel 8+: Lecturas más personales\n\nLas conversaciones continuas desbloquean lecturas más valiosas.",
          fr: "Niveau 3+: Lectures profondes\nNiveau 5+: Conseils plus spécifiques\nNiveau 8+: Lectures les plus personnelles\n\nLes conversations continues débloquent des lectures plus précieuses.",
        },
      },
      {
        title: { ja: "注意事項", en: "Important Notes", zh: "注意事项", ko: "주의사항", es: "Notas Importantes", fr: "Notes Importantes" },
        content: {
          ja: "解約すると親密度はリセットされます。せっかく築いた占い師との絆を大切に、継続してご利用ください。",
          en: "Canceling your subscription resets intimacy levels. Cherish the bond you've built with your oracles and continue using the service.",
          zh: "取消订阅会重置亲密度。请珍惜与占卜师建立的联系，继续使用服务。",
          ko: "해지하면 친밀도가 리셋됩니다. 점술사와 쌓아온 유대를 소중히 여기고 계속 이용해 주세요.",
          es: "Cancelar tu suscripción reinicia los niveles de intimidad. Valora el vínculo que has construido con tus oráculos y continúa usando el servicio.",
          fr: "L'annulation de votre abonnement réinitialise les niveaux d'intimité. Chérissez le lien que vous avez construit avec vos oracles et continuez à utiliser le service.",
        },
      },
    ],
  },
  {
    id: "watch-mode",
    icon: Sparkles,
    color: "from-indigo-500 to-violet-500",
    title: {
      ja: "見守りモード",
      en: "Watch Mode",
      zh: "守护模式",
      ko: "지켜보기 모드",
      es: "Modo Vigilancia",
      fr: "Mode Veille",
    },
    description: {
      ja: "占い師があなたの日常をそっと見守る機能",
      en: "A feature where oracles gently watch over your daily life",
      zh: "占卜师默默守护您日常生活的功能",
      ko: "점술사가 당신의 일상을 조용히 지켜보는 기능",
      es: "Una función donde los oráculos cuidan suavemente tu vida diaria",
      fr: "Une fonctionnalité où les oracles veillent doucement sur votre vie quotidienne",
    },
    steps: [
      {
        title: { ja: "見守りモードとは", en: "What is Watch Mode", zh: "什么是守护模式", ko: "지켜보기 모드란", es: "Qué es el Modo Vigilancia", fr: "Qu'est-ce que le Mode Veille" },
        content: {
          ja: "見守りモードをオンにすると、占い師から自動的にメッセージが届きます。暦のイベント（新月・満月・節分など）に合わせた励ましの言葉や、朝の挨拶メッセージを受け取れます。",
          en: "When Watch Mode is on, you'll automatically receive messages from oracles. Get encouraging words aligned with calendar events (new moon, full moon, setsubun, etc.) and morning greetings.",
          zh: "开启守护模式后，占卜师会自动发送消息。您可以收到与日历事件（新月、满月、立春等）相关的鼓励话语和早问候。",
          ko: "지켜보기 모드를 켜면 점술사로부터 자동으로 메시지가 옵니다. 달력 이벤트(초승달, 보름달, 절분 등)에 맞춤 응원 메시지와 아침 인사를 받을 수 있습니다.",
          es: "Cuando el Modo Vigilancia está activado, recibirás mensajes automáticos de los oráculos. Recibe palabras de aliento alineadas con eventos del calendario (luna nueva, luna llena, etc.) y saludos matutinos.",
          fr: "Lorsque le Mode Veille est activé, vous recevrez automatiquement des messages des oracles. Recevez des mots d'encouragement alignés sur les événements du calendrier (nouvelle lune, pleine lune, etc.) et des salutations matinales.",
        },
      },
      {
        title: { ja: "受け取れるメッセージ", en: "Messages You'll Receive", zh: "可收到的消息", ko: "받을 수 있는 메시지", es: "Mensajes que Recibirás", fr: "Messages que Vous Recevrez" },
        content: {
          ja: "・暦のイベントメッセージ（新月・満月・節分・春分・秋分など）\n・朝の挨拶メッセージ\n・記念日のお祝いメッセージ（設定した記念日）\n\nそれぞれのメッセージは、占い師の個性に合わせた温かい言葉で届けられます。",
          en: "・Calendar event messages (new moon, full moon, setsubun, spring/autumn equinox, etc.)\n・Morning greeting messages\n・Anniversary celebration messages (for dates you set)\n\nEach message is delivered with warm words matching the oracle's personality.",
          zh: "・日历事件消息（新月、满月、立春、春分/秋分等）\n・早问候消息\n・纪念日祝福消息（您设置的日期）\n\n每条消息都会以符合占卜师个性的温暖话语传递。",
          ko: "・달력 이벤트 메시지(초승달, 보름달, 절분, 춘분/추분 등)\n・아침 인사 메시지\n・기념일 축하 메시지(설정한 날짜)\n\n각 메시지는 점술사의 개성에 맞는 따뜻한 말로 전달됩니다.",
          es: "・Mensajes de eventos del calendario (luna nueva, luna llena, setsubun, equinoccios, etc.)\n・Mensajes de saludo matutino\n・Mensajes de celebración de aniversarios (para fechas que configures)\n\nCada mensaje se entrega con palabras cálidas que coinciden con la personalidad del oráculo.",
          fr: "・Messages d'événements du calendrier (nouvelle lune, pleine lune, setsubun, équinoxes, etc.)\n・Messages de salutation matinale\n・Messages de célébration d'anniversaire (pour les dates que vous définissez)\n\nChaque message est délivré avec des mots chaleureux correspondant à la personnalité de l'oracle.",
        },
      },
      {
        title: { ja: "設定方法", en: "How to Set Up", zh: "设置方法", ko: "설정 방법", es: "Cómo Configurar", fr: "Comment Configurer" },
        content: {
          ja: "1. ダッシュボードのメニューから「設定」を選択\n2. 「見守りモード」のトグルをオンに\n3. お好みで、メッセージを送る占い師を指定\n4. 暦のイベント通知や記念日通知のオン/オフも設定可能",
          en: "1. Select 'Settings' from the dashboard menu\n2. Turn on the 'Watch Mode' toggle\n3. Optionally specify which oracle sends messages\n4. You can also toggle calendar event and anniversary notifications",
          zh: "1. 从仪表板菜单选择「设置」\n2. 打开「守护模式」开关\n3. 可选择指定发送消息的占卜师\n4. 也可以设置日历事件和纪念日通知的开关",
          ko: "1. 대시보드 메뉴에서 '설정' 선택\n2. '지켜보기 모드' 토글을 켜기\n3. 원하면 메시지를 보낼 점술사 지정\n4. 달력 이벤트 및 기념일 알림도 설정 가능",
          es: "1. Selecciona 'Configuración' del menú del panel\n2. Activa el interruptor de 'Modo Vigilancia'\n3. Opcionalmente especifica qué oráculo envía mensajes\n4. También puedes activar/desactivar notificaciones de eventos y aniversarios",
          fr: "1. Sélectionnez 'Paramètres' dans le menu du tableau de bord\n2. Activez le bouton 'Mode Veille'\n3. Spécifiez optionnellement quel oracle envoie les messages\n4. Vous pouvez également activer/désactiver les notifications d'événements et d'anniversaires",
        },
      },
    ],
  },
  {
    id: "account",
    icon: Settings,
    color: "from-slate-500 to-gray-500",
    title: {
      ja: "アカウント設定",
      en: "Account Settings",
      zh: "账户设置",
      ko: "계정 설정",
      es: "Configuración de Cuenta",
      fr: "Paramètres du Compte",
    },
    description: {
      ja: "プロフィールやセキュリティの設定",
      en: "Profile and security settings",
      zh: "个人资料和安全设置",
      ko: "프로필 및 보안 설정",
      es: "Configuración de perfil y seguridad",
      fr: "Paramètres de profil et sécurité",
    },
    steps: [
      {
        title: { ja: "プロフィール編集", en: "Edit Profile", zh: "编辑个人资料", ko: "프로필 편집", es: "Editar Perfil", fr: "Modifier le Profil" },
        content: {
          ja: "ダッシュボードのメニューから「プロフィール」を選択し、名前や生年月日などを設定できます。生年月日を設定すると、より精度の高い鑑定が受けられます。",
          en: "Select 'Profile' from the dashboard menu to set your name, birthdate, etc. Setting your birthdate enables more accurate readings.",
          zh: "从仪表板菜单选择「个人资料」，可以设置姓名、生日等。设置生日可以获得更准确的占卜。",
          ko: "대시보드 메뉴에서 '프로필'을 선택하여 이름, 생년월일 등을 설정할 수 있습니다. 생년월일을 설정하면 더 정확한 감정을 받을 수 있습니다.",
          es: "Selecciona 'Perfil' del menú del panel para configurar tu nombre, fecha de nacimiento, etc. Configurar tu fecha de nacimiento permite lecturas más precisas.",
          fr: "Sélectionnez 'Profil' dans le menu du tableau de bord pour définir votre nom, date de naissance, etc. Définir votre date de naissance permet des lectures plus précises.",
        },
      },
      {
        title: { ja: "パスワード変更", en: "Change Password", zh: "更改密码", ko: "비밀번호 변경", es: "Cambiar Contraseña", fr: "Changer le Mot de Passe" },
        content: {
          ja: "セキュリティのため、定期的なパスワード変更をおすすめします。プロフィール画面から変更できます。",
          en: "For security, we recommend changing your password regularly. You can change it from the profile screen.",
          zh: "为了安全，建议定期更改密码。可以从个人资料页面更改。",
          ko: "보안을 위해 정기적인 비밀번호 변경을 권장합니다. 프로필 화면에서 변경할 수 있습니다.",
          es: "Por seguridad, recomendamos cambiar tu contraseña regularmente. Puedes cambiarla desde la pantalla de perfil.",
          fr: "Pour la sécurité, nous recommandons de changer votre mot de passe régulièrement. Vous pouvez le changer depuis l'écran de profil.",
        },
      },
      {
        title: { ja: "通知設定", en: "Notification Settings", zh: "通知设置", ko: "알림 설정", es: "Configuración de Notificaciones", fr: "Paramètres de Notification" },
        content: {
          ja: "メール通知やプッシュ通知の設定を変更できます。重要なお知らせを見逃さないよう、通知をオンにしておくことをおすすめします。",
          en: "You can change email and push notification settings. We recommend keeping notifications on to not miss important updates.",
          zh: "可以更改邮件和推送通知设置。建议保持通知开启，以免错过重要更新。",
          ko: "이메일 알림 및 푸시 알림 설정을 변경할 수 있습니다. 중요한 알림을 놓치지 않도록 알림을 켜두는 것을 권장합니다.",
          es: "Puedes cambiar la configuración de notificaciones por correo y push. Recomendamos mantener las notificaciones activadas para no perderte actualizaciones importantes.",
          fr: "Vous pouvez modifier les paramètres de notification par e-mail et push. Nous recommandons de garder les notifications activées pour ne pas manquer les mises à jour importantes.",
        },
      },
    ],
  },
  {
    id: "mbti",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    title: {
      ja: "MBTI診断",
      en: "MBTI Diagnosis",
      zh: "MBTI诊断",
      ko: "MBTI 진단",
      es: "Diagnóstico MBTI",
      fr: "Diagnostic MBTI",
    },
    description: {
      ja: "心理学に基づいた性格タイプ診断",
      en: "Psychology-based personality type assessment",
      zh: "基于心理学的性格类型评估",
      ko: "심리학에 기반한 성격 유형 진단",
      es: "Evaluación de personalidad basada en psicología",
      fr: "Évaluation de personnalité basée sur la psychologie",
    },
    steps: [
      {
        title: { ja: "MBTIとは", en: "What is MBTI", zh: "什么是MBTI", ko: "MBTI란", es: "Qué es MBTI", fr: "Qu'est-ce que MBTI" },
        content: {
          ja: "MBTI（Myers-Briggs Type Indicator）は、心理学者カール・ユングの理論に基づいた性格タイプ診断です。16種類の性格タイプに分類され、自分自身の強みや傾向を理解するのに役立ちます。\n\n【4つの指標】\n・外向(E) vs 内向(I)：エネルギーの源\n・感覚(S) vs 直観(N)：情報の受け取り方\n・思考(T) vs 感情(F)：意思決定の仕方\n・判断(J) vs 知覚(P)：生活のスタイル",
          en: "MBTI (Myers-Briggs Type Indicator) is a personality type assessment based on Carl Jung's theory. It classifies people into 16 personality types and helps understand your strengths and tendencies.\n\n【4 Indicators】\n・Extraversion(E) vs Introversion(I): Energy source\n・Sensing(S) vs Intuition(N): Information processing\n・Thinking(T) vs Feeling(F): Decision making\n・Judging(J) vs Perceiving(P): Lifestyle",
          zh: "MBTI（迈尔斯-布里格斯类型指标）是基于卡尔·荣格理论的性格类型评估。它将人分为16种性格类型，帮助了解您的优势和倾向。\n\n【4个指标】\n・外向(E) vs 内向(I)：能量来源\n・感觉(S) vs 直觉(N)：信息处理\n・思考(T) vs 情感(F)：决策方式\n・判断(J) vs 感知(P)：生活方式",
          ko: "MBTI(Myers-Briggs Type Indicator)는 카를 융의 이론에 기반한 성격 유형 진단입니다. 16가지 성격 유형으로 분류되어 자신의 강점과 경향을 이해하는 데 도움이 됩니다.\n\n【4가지 지표】\n・외향(E) vs 내향(I): 에너지 원천\n・감각(S) vs 직관(N): 정보 처리\n・사고(T) vs 감정(F): 의사결정\n・판단(J) vs 인식(P): 생활 방식",
          es: "MBTI (Indicador de Tipo Myers-Briggs) es una evaluación de personalidad basada en la teoría de Carl Jung. Clasifica a las personas en 16 tipos de personalidad y ayuda a entender tus fortalezas y tendencias.\n\n【4 Indicadores】\n・Extraversión(E) vs Introversión(I): Fuente de energía\n・Sensación(S) vs Intuición(N): Procesamiento de información\n・Pensamiento(T) vs Sentimiento(F): Toma de decisiones\n・Juicio(J) vs Percepción(P): Estilo de vida",
          fr: "MBTI (Myers-Briggs Type Indicator) est une évaluation de personnalité basée sur la théorie de Carl Jung. Il classe les gens en 16 types de personnalité et aide à comprendre vos forces et tendances.\n\n【4 Indicateurs】\n・Extraversion(E) vs Introversion(I): Source d'énergie\n・Sensation(S) vs Intuition(N): Traitement de l'information\n・Pensée(T) vs Sentiment(F): Prise de décision\n・Jugement(J) vs Perception(P): Style de vie",
        },
      },
      {
        title: { ja: "六神ノ間でのMBTI診断", en: "MBTI at Six Oracle", zh: "六神之间的MBTI诊断", ko: "육신의 방에서의 MBTI 진단", es: "MBTI en Six Oracle", fr: "MBTI chez Six Oracle" },
        content: {
          ja: "占い師「心理」がMBTI診断を担当しています。チャットでの質問に答えることで、あなたの性格タイプを診断します。\n\n【診断でわかること】\n・あなたの16タイプの性格分類\n・強みと弱みの分析\n・他のタイプとの相性\n・適職やキャリアのアドバイス\n・恋愛・人間関係のアドバイス\n\n「心理」に話しかけて、「MBTI診断をしたい」と伝えてください。",
          en: "Oracle 'Shinri' handles MBTI diagnosis. Answer questions in the chat to discover your personality type.\n\n【What You'll Learn】\n・Your 16-type personality classification\n・Strengths and weaknesses analysis\n・Compatibility with other types\n・Career and job advice\n・Love and relationship guidance\n\nTalk to 'Shinri' and say 'I want an MBTI diagnosis'.",
          zh: "占卜师「心理」负责MBTI诊断。通过回答聊天中的问题，发现您的性格类型。\n\n【您将了解】\n・您的16类型性格分类\n・优势和劣势分析\n・与其他类型的相性\n・职业和工作建议\n・爱情和人际关系指导\n\n与「心理」交谈，说「我想进行MBTI诊断」。",
          ko: "점술사 '신리'가 MBTI 진단을 담당합니다. 채팅 질문에 답하여 당신의 성격 유형을 발견하세요.\n\n【알 수 있는 것】\n・당신의 16유형 성격 분류\n・강점과 약점 분석\n・다른 유형과의 궁합\n・직업 및 커리어 조언\n・연애 및 인간관계 안내\n\n'신리'에게 'MBTI 진단을 하고 싶어요'라고 말하세요.",
          es: "El oráculo 'Shinri' maneja el diagnóstico MBTI. Responde preguntas en el chat para descubrir tu tipo de personalidad.\n\n【Lo que Aprenderás】\n・Tu clasificación de personalidad de 16 tipos\n・Análisis de fortalezas y debilidades\n・Compatibilidad con otros tipos\n・Consejos de carrera y trabajo\n・Guía de amor y relaciones\n\nHabla con 'Shinri' y di 'Quiero un diagnóstico MBTI'.",
          fr: "L'oracle 'Shinri' gère le diagnostic MBTI. Répondez aux questions dans le chat pour découvrir votre type de personnalité.\n\n【Ce que Vous Apprendrez】\n・Votre classification de personnalité en 16 types\n・Analyse des forces et faiblesses\n・Compatibilité avec d'autres types\n・Conseils de carrière et d'emploi\n・Guide amour et relations\n\nParlez à 'Shinri' et dites 'Je veux un diagnostic MBTI'.",
        },
      },
      {
        title: { ja: "グループ診断機能", en: "Group Diagnosis Feature", zh: "团体诊断功能", ko: "그룹 진단 기능", es: "Función de Diagnóstico Grupal", fr: "Fonction de Diagnostic de Groupe" },
        content: {
          ja: "友達やパートナー、チームメンバーと一緒にMBTI診断ができます。\n\n【使い方】\n1. ダッシュボードのメニューから「MBTIグループ診断」を選択\n2. 「新しいグループを作成」をクリック\n3. グループ名を入力して作成\n4. 招待リンクを友達に共有\n5. メンバーが診断を完了したら結果を確認\n\n【分析内容】\n・各メンバーの性格タイプ\n・グループ全体の傾向\n・メンバー間の相性\n・コミュニケーションのコツ\n\nプレミアム会員は無制限でグループを作成できます。",
          en: "You can take MBTI diagnosis together with friends, partners, or team members.\n\n【How to Use】\n1. Select 'MBTI Group Diagnosis' from the dashboard menu\n2. Click 'Create New Group'\n3. Enter group name and create\n4. Share invitation link with friends\n5. View results when members complete diagnosis\n\n【Analysis Includes】\n・Each member's personality type\n・Overall group tendencies\n・Compatibility between members\n・Communication tips\n\nPremium members can create unlimited groups.",
          zh: "您可以与朋友、伴侣或团队成员一起进行MBTI诊断。\n\n【使用方法】\n1. 从仪表板菜单选择「MBTI团体诊断」\n2. 点击「创建新团体」\n3. 输入团体名称并创建\n4. 与朋友分享邀请链接\n5. 成员完成诊断后查看结果\n\n【分析内容】\n・每位成员的性格类型\n・团体整体倾向\n・成员间的相性\n・沟通技巧\n\n高级会员可无限创建团体。",
          ko: "친구, 파트너, 팀원과 함께 MBTI 진단을 할 수 있습니다.\n\n【사용법】\n1. 대시보드 메뉴에서 'MBTI 그룹 진단' 선택\n2. '새 그룹 만들기' 클릭\n3. 그룹 이름 입력 후 생성\n4. 친구에게 초대 링크 공유\n5. 멤버가 진단을 완료하면 결과 확인\n\n【분석 내용】\n・각 멤버의 성격 유형\n・그룹 전체 경향\n・멤버 간 궁합\n・커뮤니케이션 팁\n\n프리미엄 회원은 무제한으로 그룹을 만들 수 있습니다.",
          es: "Puedes hacer el diagnóstico MBTI junto con amigos, parejas o miembros del equipo.\n\n【Cómo Usar】\n1. Selecciona 'Diagnóstico Grupal MBTI' del menú del panel\n2. Haz clic en 'Crear Nuevo Grupo'\n3. Ingresa el nombre del grupo y crea\n4. Comparte el enlace de invitación con amigos\n5. Ve los resultados cuando los miembros completen el diagnóstico\n\n【El Análisis Incluye】\n・Tipo de personalidad de cada miembro\n・Tendencias generales del grupo\n・Compatibilidad entre miembros\n・Consejos de comunicación\n\nLos miembros Premium pueden crear grupos ilimitados.",
          fr: "Vous pouvez faire le diagnostic MBTI avec des amis, partenaires ou membres de l'équipe.\n\n【Comment Utiliser】\n1. Sélectionnez 'Diagnostic de Groupe MBTI' dans le menu du tableau de bord\n2. Cliquez sur 'Créer un Nouveau Groupe'\n3. Entrez le nom du groupe et créez\n4. Partagez le lien d'invitation avec des amis\n5. Voir les résultats quand les membres complètent le diagnostic\n\n【L'Analyse Comprend】\n・Type de personnalité de chaque membre\n・Tendances générales du groupe\n・Compatibilité entre membres\n・Conseils de communication\n\nLes membres Premium peuvent créer des groupes illimités.",
        },
      },
      {
        title: { ja: "16タイプの紹介", en: "16 Types Overview", zh: "16种类型介绍", ko: "16유형 소개", es: "Resumen de 16 Tipos", fr: "Aperçu des 16 Types" },
        content: {
          ja: "【16種類の性格タイプ】\n\n【分析家タイプ】\nINTJ(建築家) / INTP(論理学者) / ENTJ(指揮官) / ENTP(討論者)\n\n【外交官タイプ】\nINFJ(提唱者) / INFP(仲介者) / ENFJ(主人公) / ENFP(広報担当)\n\n【番人タイプ】\nISTJ(管理者) / ISFJ(擁護者) / ESTJ(幹部) / ESFJ(領事)\n\n【探検家タイプ】\nISTP(巨匠) / ISFP(冒険家) / ESTP(起業家) / ESFP(エンターテイナー)\n\n占い師「心理」に診断してもらい、あなたのタイプを見つけましょう！",
          en: "【16 Personality Types】\n\n【Analysts】\nINTJ(Architect) / INTP(Logician) / ENTJ(Commander) / ENTP(Debater)\n\n【Diplomats】\nINFJ(Advocate) / INFP(Mediator) / ENFJ(Protagonist) / ENFP(Campaigner)\n\n【Sentinels】\nISTJ(Logistician) / ISFJ(Defender) / ESTJ(Executive) / ESFJ(Consul)\n\n【Explorers】\nISTP(Virtuoso) / ISFP(Adventurer) / ESTP(Entrepreneur) / ESFP(Entertainer)\n\nGet diagnosed by oracle 'Shinri' and discover your type!",
          zh: "【16种性格类型】\n\n【分析师】\nINTJ(建筑师) / INTP(逻辑学家) / ENTJ(指挥官) / ENTP(辩论家)\n\n【外交官】\nINFJ(提倡者) / INFP(调解者) / ENFJ(主人公) / ENFP(竞选者)\n\n【哨兵】\nISTJ(物流师) / ISFJ(守护者) / ESTJ(执行官) / ESFJ(领事)\n\n【探险家】\nISTP(巨匠) / ISFP(冒险家) / ESTP(企业家) / ESFP(表演者)\n\n让占卜师「心理」诊断，发现您的类型！",
          ko: "【16가지 성격 유형】\n\n【분석가】\nINTJ(건축가) / INTP(논리학자) / ENTJ(지휘관) / ENTP(토론가)\n\n【외교관】\nINFJ(옹호자) / INFP(중재자) / ENFJ(주인공) / ENFP(활동가)\n\n【관리자】\nISTJ(관리자) / ISFJ(수호자) / ESTJ(경영자) / ESFJ(영사)\n\n【탐험가】\nISTP(장인) / ISFP(모험가) / ESTP(기업가) / ESFP(연예인)\n\n점술사 '신리'에게 진단받고 당신의 유형을 발견하세요!",
          es: "【16 Tipos de Personalidad】\n\n【Analistas】\nINTJ(Arquitecto) / INTP(Lógico) / ENTJ(Comandante) / ENTP(Innovador)\n\n【Diplomáticos】\nINFJ(Abogado) / INFP(Mediador) / ENFJ(Protagonista) / ENFP(Activista)\n\n【Centinelas】\nISTJ(Logístico) / ISFJ(Defensor) / ESTJ(Ejecutivo) / ESFJ(Cónsul)\n\n【Exploradores】\nISTP(Virtuoso) / ISFP(Aventurero) / ESTP(Emprendedor) / ESFP(Animador)\n\n¡Haz que el oráculo 'Shinri' te diagnostique y descubre tu tipo!",
          fr: "【16 Types de Personnalité】\n\n【Analystes】\nINTJ(Architecte) / INTP(Logicien) / ENTJ(Commandant) / ENTP(Innovateur)\n\n【Diplomates】\nINFJ(Avocat) / INFP(Médiateur) / ENFJ(Protagoniste) / ENFP(Inspirateur)\n\n【Sentinelles】\nISTJ(Logisticien) / ISFJ(Défenseur) / ESTJ(Directeur) / ESFJ(Consul)\n\n【Explorateurs】\nISTP(Virtuose) / ISFP(Aventurier) / ESTP(Entrepreneur) / ESFP(Amuseur)\n\nFaites-vous diagnostiquer par l'oracle 'Shinri' et découvrez votre type!",
        },
      },
    ],
  },
];

const pageText = {
  title: {
    ja: "ヘルプガイド",
    en: "Help Guide",
    zh: "帮助指南",
    ko: "도움말 가이드",
    es: "Guía de Ayuda",
    fr: "Guide d'Aide",
  },
  subtitle: {
    ja: "六神ノ間は、10人以上のAI占い師があなたの運命を読み解くオンライン占いサービスです。恋愛・仕事・人間関係など、様々なお悩みに24時間対応。タロット・数秘術・手相・星座・MBTIなど多彩な占術で、あなたの未来を照らします。",
    en: "Six Oracle is an AI fortune-telling service with 10+ specialized oracles. Available 24/7 for love, career, and relationship guidance. Featuring Tarot, Numerology, Palm Reading, Astrology, MBTI, and more to illuminate your future.",
    zh: "六神之间是一项拥有10位以上专业占卜师的AI占卜服务。全天24小时可咨询爱情、事业、人际关系等问题。提供塔罗、数秘术、手相、星座、MBTI等多种占卜方式，照亮您的未来。",
    ko: "육신의 방은 10명 이상의 전문 AI 점술사가 있는 온라인 점술 서비스입니다. 연애, 직장, 인간관계 등 다양한 고민에 24시간 대응합니다. 타로, 수비학, 손금, 별자리, MBTI 등 다양한 점술로 당신의 미래를 밝힙니다.",
    es: "Six Oracle es un servicio de adivinación con más de 10 oráculos especializados. Disponible 24/7 para orientación en amor, carrera y relaciones. Con Tarot, Numerología, Quiromancia, Astrología, MBTI y más.",
    fr: "Six Oracle est un service de divination avec plus de 10 oracles spécialisés. Disponible 24h/24 pour l'amour, la carrière et les relations. Avec Tarot, Numérologie, Chiromancie, Astrologie, MBTI et plus.",
  },
  selectGuide: {
    ja: "ガイドを選択",
    en: "Select a Guide",
    zh: "选择指南",
    ko: "가이드 선택",
    es: "Seleccionar Guía",
    fr: "Sélectionner un Guide",
  },
  step: {
    ja: "ステップ",
    en: "Step",
    zh: "步骤",
    ko: "단계",
    es: "Paso",
    fr: "Étape",
  },
  faqLink: {
    ja: "よくある質問（FAQ）もご覧ください",
    en: "Also check our FAQ",
    zh: "也请查看常见问题",
    ko: "자주 묻는 질문(FAQ)도 확인해 주세요",
    es: "También consulte nuestras preguntas frecuentes",
    fr: "Consultez également notre FAQ",
  },
  contactPrompt: {
    ja: "その他のご質問がございましたら",
    en: "If you have any other questions",
    zh: "如有其他问题",
    ko: "다른 질문이 있으시면",
    es: "Si tiene otras preguntas",
    fr: "Si vous avez d'autres questions",
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

export default function Help() {
  const { language, t } = useLanguage();
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentGuide = helpGuides.find(g => g.id === selectedGuide);

  // Auto-scroll to expanded content when a guide is selected
  useEffect(() => {
    if (selectedGuide && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedGuide]);

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
        <div className="max-w-5xl mx-auto">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-4">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold">{pageText.selectGuide[language]}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-gold mb-4">
              {pageText.title[language]}
            </h1>
            <p className="text-muted-foreground">
              {pageText.subtitle[language]}
            </p>
          </motion.div>

          {/* Guide Selection Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          >
            {helpGuides.map((guide, index) => {
              const Icon = guide.icon;
              const isSelected = selectedGuide === guide.id;
              
              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      isSelected 
                        ? "border-gold/50 bg-gold/5" 
                        : "border-white/10 hover:border-white/20"
                    }`}
                    onClick={() => setSelectedGuide(isSelected ? null : guide.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${guide.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{guide.title[language]}</CardTitle>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                          isSelected ? "rotate-90" : ""
                        }`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {guide.description[language]}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Selected Guide Content */}
          <AnimatePresence mode="wait">
            {currentGuide && (
              <motion.div
                ref={contentRef}
                key={currentGuide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${currentGuide.color}`}>
                        <currentGuide.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gold">
                          {currentGuide.title[language]}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentGuide.description[language]}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {currentGuide.steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-4"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                              <span className="text-gold font-bold">{index + 1}</span>
                            </div>
                            {index < currentGuide.steps.length - 1 && (
                              <div className="w-0.5 h-full bg-gold/20 mx-auto mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                              {step.title[language]}
                              <Badge variant="outline" className="text-xs border-gold/30 text-gold">
                                {pageText.step[language]} {index + 1}
                              </Badge>
                            </h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                              {step.content[language]}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
          >
            <Link href="/faq">
              <Card className="border-white/10 hover:border-gold/30 transition-colors cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <HelpCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-gold transition-colors">
                      {pageText.faqLink[language]}
                    </h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/contact">
              <Card className="border-white/10 hover:border-gold/30 transition-colors cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-gold transition-colors">
                      {pageText.contactLink[language]}
                    </h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
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
