import { useState, useEffect } from "react";
import { X, Share, Plus, Smartphone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const translations = {
  title: {
    ja: "アプリをホーム画面に追加",
    en: "Add to Home Screen",
    zh: "添加到主屏幕",
    ko: "홈 화면에 추가",
    es: "Añadir a pantalla de inicio",
    fr: "Ajouter à l'écran d'accueil",
  },
  description: {
    ja: "ホーム画面に追加すると、いつでもすぐにアクセスできます",
    en: "Add to your home screen for quick access anytime",
    zh: "添加到主屏幕，随时快速访问",
    ko: "홈 화면에 추가하면 언제든지 빠르게 접근할 수 있습니다",
    es: "Añade a tu pantalla de inicio para acceso rápido",
    fr: "Ajoutez à votre écran d'accueil pour un accès rapide",
  },
  addButton: {
    ja: "ホーム画面に追加",
    en: "Add to Home Screen",
    zh: "添加到主屏幕",
    ko: "홈 화면에 추가",
    es: "Añadir",
    fr: "Ajouter",
  },
  later: {
    ja: "あとで",
    en: "Later",
    zh: "稍后",
    ko: "나중에",
    es: "Más tarde",
    fr: "Plus tard",
  },
  iosInstructions: {
    ja: "Safari のメニューから「ホーム画面に追加」をタップしてください",
    en: "Tap the Share button, then 'Add to Home Screen'",
    zh: "点击分享按钮，然后选择「添加到主屏幕」",
    ko: "공유 버튼을 탭한 다음 '홈 화면에 추가'를 선택하세요",
    es: "Toca el botón Compartir, luego 'Añadir a pantalla de inicio'",
    fr: "Appuyez sur Partager, puis 'Sur l'écran d'accueil'",
  },
  step1: {
    ja: "1. 下部の共有ボタンをタップ",
    en: "1. Tap the Share button below",
    zh: "1. 点击下方的分享按钮",
    ko: "1. 하단의 공유 버튼을 탭",
    es: "1. Toca el botón Compartir abajo",
    fr: "1. Appuyez sur le bouton Partager ci-dessous",
  },
  step2: {
    ja: "2.「ホーム画面に追加」を選択",
    en: "2. Select 'Add to Home Screen'",
    zh: "2. 选择「添加到主屏幕」",
    ko: "2. '홈 화면에 추가' 선택",
    es: "2. Selecciona 'Añadir a pantalla de inicio'",
    fr: "2. Sélectionnez 'Sur l'écran d'accueil'",
  },
  step3: {
    ja: "3.「追加」をタップ",
    en: "3. Tap 'Add'",
    zh: "3. 点击「添加」",
    ko: "3. '추가' 탭",
    es: "3. Toca 'Añadir'",
    fr: "3. Appuyez sur 'Ajouter'",
  },
  gotIt: {
    ja: "わかりました",
    en: "Got it",
    zh: "知道了",
    ko: "알겠습니다",
    es: "Entendido",
    fr: "Compris",
  },
};

const STORAGE_KEY = "pwa-prompt-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function AddToHomeScreenPrompt() {
  const { language } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // For iOS, show prompt after a delay
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // For Android/Chrome, listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShowPrompt(false);
    setShowIosInstructions(false);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="border-gold/30 bg-background/95 backdrop-blur-lg shadow-2xl">
          <CardContent className="p-4">
            {!showIosInstructions ? (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gold/20">
                    <Smartphone className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {translations.title[language]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {translations.description[language]}
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-1 border-white/10"
                  >
                    {translations.later[language]}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1 bg-gold hover:bg-gold/90 text-black"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {translations.addButton[language]}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-white">
                    {translations.title[language]}
                  </h3>
                  <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Share className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-muted-foreground">
                      {translations.step1[language]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-muted-foreground">
                      {translations.step2[language]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <ChevronDown className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-muted-foreground">
                      {translations.step3[language]}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleDismiss}
                  className="w-full bg-gold hover:bg-gold/90 text-black"
                >
                  {translations.gotIt[language]}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
