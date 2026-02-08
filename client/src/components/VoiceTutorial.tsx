import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Volume2, VolumeX, ChevronRight, ChevronLeft, Play, RotateCcw, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Supported languages
type Language = "ja" | "en" | "zh";

interface TutorialStep {
  id: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  voiceText: Record<Language, string>;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: {
      ja: "ようこそ！",
      en: "Welcome!",
      zh: "欢迎！",
    },
    description: {
      ja: "かんたん占いへようこそ。使い方をご説明します。",
      en: "Welcome to Easy Fortune. Let me explain how to use it.",
      zh: "欢迎使用简易占卜。让我来说明使用方法。",
    },
    voiceText: {
      ja: "かんたん占いへようこそ。これから使い方をご説明します。とても簡単ですので、ご安心ください。",
      en: "Welcome to Easy Fortune. I will explain how to use it. It's very simple, so don't worry.",
      zh: "欢迎使用简易占卜。我来说明使用方法。非常简单，请放心。",
    },
  },
  {
    id: 2,
    title: {
      ja: "占い師を選ぶ",
      en: "Choose a Fortune Teller",
      zh: "选择占卜师",
    },
    description: {
      ja: "まず、相談したい占い師の名前をタップしてください。",
      en: "First, tap the name of the fortune teller you want to consult.",
      zh: "首先，点击您想咨询的占卜师的名字。",
    },
    voiceText: {
      ja: "まず、画面に表示されている占い師の名前をタップしてください。電話をかけるように、タップするだけで占い師とつながります。",
      en: "First, tap the fortune teller's name shown on the screen. Just like making a phone call, simply tap to connect with the fortune teller.",
      zh: "首先，点击屏幕上显示的占卜师名字。就像打电话一样，只需点击即可与占卜师连接。",
    },
    highlight: "oracle-selection",
  },
  {
    id: 3,
    title: {
      ja: "話しかける",
      en: "Speak",
      zh: "说话",
    },
    description: {
      ja: "緑色の大きなボタンを押して、話しかけてください。",
      en: "Press the large green button and speak.",
      zh: "按下绿色的大按钮，然后说话。",
    },
    voiceText: {
      ja: "占い師を選んだら、画面の真ん中にある緑色の大きなボタンを押してください。ボタンを押したら、マイクに向かって話しかけてください。",
      en: "After selecting a fortune teller, press the large green button in the center of the screen. After pressing the button, speak into the microphone.",
      zh: "选择占卜师后，按下屏幕中央的绿色大按钮。按下按钮后，对着麦克风说话。",
    },
    highlight: "mic-button",
  },
  {
    id: 4,
    title: {
      ja: "話し終わったら",
      en: "When You're Done Speaking",
      zh: "说完之后",
    },
    description: {
      ja: "話し終わったら、もう一度ボタンを押してください。",
      en: "When you're done speaking, press the button again.",
      zh: "说完后，再次按下按钮。",
    },
    voiceText: {
      ja: "話し終わったら、もう一度同じボタンを押してください。すると、あなたの声が文字に変わり、占い師が答えてくれます。",
      en: "When you're done speaking, press the same button again. Your voice will be converted to text, and the fortune teller will respond.",
      zh: "说完后，再次按下同一个按钮。您的声音会转换成文字，占卜师会给您回复。",
    },
    highlight: "mic-button",
  },
  {
    id: 5,
    title: {
      ja: "回答を聞く",
      en: "Listen to the Response",
      zh: "听取回答",
    },
    description: {
      ja: "占い師の回答は自動で読み上げられます。",
      en: "The fortune teller's response will be read aloud automatically.",
      zh: "占卜师的回答会自动朗读出来。",
    },
    voiceText: {
      ja: "占い師の回答は、自動的に音声で読み上げられます。文字を読む必要はありません。ゆっくりお聞きください。",
      en: "The fortune teller's response will be automatically read aloud. You don't need to read the text. Please listen carefully.",
      zh: "占卜师的回答会自动用语音朗读。您不需要阅读文字。请慢慢听。",
    },
  },
  {
    id: 6,
    title: {
      ja: "終了する",
      en: "End Session",
      zh: "结束",
    },
    description: {
      ja: "終わりたいときは、赤いボタンを押してください。",
      en: "When you want to end, press the red button.",
      zh: "想结束时，按下红色按钮。",
    },
    voiceText: {
      ja: "相談が終わったら、画面の下にある赤いボタンを押してください。これで終了です。いつでも何度でもご利用いただけます。",
      en: "When you're done consulting, press the red button at the bottom of the screen. That's it. You can use this service anytime, as many times as you like.",
      zh: "咨询结束后，按下屏幕底部的红色按钮。这样就结束了。您可以随时多次使用。",
    },
    highlight: "end-button",
  },
  {
    id: 7,
    title: {
      ja: "準備完了！",
      en: "Ready!",
      zh: "准备好了！",
    },
    description: {
      ja: "さあ、占いを始めましょう！",
      en: "Let's start the fortune telling!",
      zh: "让我们开始占卜吧！",
    },
    voiceText: {
      ja: "以上で説明は終わりです。さあ、占いを始めましょう。何かわからないことがあれば、いつでもこのガイドを見ることができます。",
      en: "That's the end of the explanation. Let's start the fortune telling. If you have any questions, you can view this guide anytime.",
      zh: "说明到此结束。让我们开始占卜吧。如果有任何不明白的地方，您可以随时查看这个指南。",
    },
  },
];

// Language display names and voice settings
const languageConfig: Record<Language, { name: string; voiceLang: string; rate: number }> = {
  ja: { name: "日本語", voiceLang: "ja-JP", rate: 0.8 },
  en: { name: "English", voiceLang: "en-US", rate: 0.85 },
  zh: { name: "中文", voiceLang: "zh-CN", rate: 0.85 },
};

interface VoiceTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function VoiceTutorial({ isOpen, onClose, onComplete }: VoiceTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<Language>("ja");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasSpokenRef = useRef(false);

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('tutorial-language') as Language;
    if (savedLang && languageConfig[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  // Save language preference
  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tutorial-language', lang);
    setShowLanguageMenu(false);
    // Re-speak current step in new language
    hasSpokenRef.current = false;
  }, []);

  // Speak the current step
  const speakStep = useCallback((stepIndex: number) => {
    if (!('speechSynthesis' in window) || isMuted) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const step = tutorialSteps[stepIndex];
    const config = languageConfig[language];
    const utterance = new SpeechSynthesisUtterance(step.voiceText[language]);
    utteranceRef.current = utterance;

    utterance.lang = config.voiceLang;
    utterance.rate = config.rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Find appropriate voice for the language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(language));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, language]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Auto-speak when step changes
  useEffect(() => {
    if (isOpen && !hasSpokenRef.current) {
      // Wait for voices to load
      const speakWithDelay = () => {
        setTimeout(() => {
          speakStep(currentStep);
        }, 500);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        speakWithDelay();
      } else {
        window.speechSynthesis.onvoiceschanged = speakWithDelay;
      }
      hasSpokenRef.current = true;
    }
  }, [isOpen, currentStep, speakStep]);

  // Reset hasSpoken when step or language changes
  useEffect(() => {
    hasSpokenRef.current = false;
  }, [currentStep, language]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    stopSpeaking();
    setShowLanguageMenu(false);
    onClose();
  }, [stopSpeaking, onClose]);

  // Go to next step
  const nextStep = useCallback(() => {
    stopSpeaking();
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
      handleClose();
    }
  }, [currentStep, stopSpeaking, onComplete, handleClose]);

  // Go to previous step
  const prevStep = useCallback(() => {
    stopSpeaking();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, stopSpeaking]);

  // Replay current step
  const replayStep = useCallback(() => {
    speakStep(currentStep);
  }, [currentStep, speakStep]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(prev => !prev);
  }, [isMuted, stopSpeaking]);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  // UI text translations
  const uiText = {
    reading: { ja: "読み上げ中...", en: "Reading...", zh: "朗读中..." },
    back: { ja: "戻る", en: "Back", zh: "返回" },
    again: { ja: "もう一度", en: "Again", zh: "再听一次" },
    next: { ja: "次へ", en: "Next", zh: "下一步" },
    start: { ja: "始める", en: "Start", zh: "开始" },
    skip: { ja: "スキップする", en: "Skip", zh: "跳过" },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 rounded-3xl max-w-lg w-full p-8 border-2 border-amber-400/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{currentStep + 1}</span>
            </div>
            <span className="text-lg text-amber-400">/ {tutorialSteps.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="text-white hover:bg-white/10"
              >
                <Globe className="w-6 h-6" />
              </Button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 top-full mt-2 bg-indigo-800 rounded-lg shadow-xl border border-white/20 overflow-hidden z-10">
                  {(Object.keys(languageConfig) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={cn(
                        "w-full px-4 py-3 text-left text-lg hover:bg-white/10 transition-colors",
                        language === lang ? "bg-amber-500/20 text-amber-400" : "text-white"
                      )}
                    >
                      {languageConfig[lang].name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/10"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">{step.title[language]}</h2>
          <p className="text-xl text-gray-300 leading-relaxed">{step.description[language]}</p>
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex items-center justify-center gap-2 mb-6 text-amber-400">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <span className="text-lg">{uiText.reading[language]}</span>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentStep
                  ? "bg-amber-400 w-8"
                  : index < currentStep
                  ? "bg-amber-400/50"
                  : "bg-white/20"
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={prevStep}
            disabled={isFirstStep}
            className={cn(
              "text-lg px-6 py-6 rounded-full border-2",
              isFirstStep
                ? "opacity-50 cursor-not-allowed"
                : "border-white/30 text-white hover:bg-white/10"
            )}
          >
            <ChevronLeft className="w-6 h-6 mr-1" />
            {uiText.back[language]}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={replayStep}
            disabled={isSpeaking}
            className="text-amber-400 hover:bg-amber-400/10"
          >
            {isSpeaking ? (
              <Volume2 className="w-6 h-6 animate-pulse" />
            ) : (
              <>
                <RotateCcw className="w-5 h-5 mr-2" />
                {uiText.again[language]}
              </>
            )}
          </Button>

          <Button
            size="lg"
            onClick={nextStep}
            className={cn(
              "text-lg px-6 py-6 rounded-full",
              isLastStep
                ? "bg-green-500 hover:bg-green-400"
                : "bg-amber-500 hover:bg-amber-400"
            )}
          >
            {isLastStep ? uiText.start[language] : uiText.next[language]}
            {!isLastStep && <ChevronRight className="w-6 h-6 ml-1" />}
            {isLastStep && <Play className="w-6 h-6 ml-1" />}
          </Button>
        </div>

        {/* Skip button */}
        <div className="text-center mt-6">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-lg underline"
          >
            {uiText.skip[language]}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage tutorial state with localStorage
export function useVoiceTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  useEffect(() => {
    // Check if user has completed the tutorial before
    const completed = localStorage.getItem('simple-mode-tutorial-completed');
    setHasCompletedTutorial(completed === 'true');
    
    // Show tutorial automatically for first-time users
    if (!completed) {
      // Small delay to let the page render first
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  }, []);

  const openTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  const completeTutorial = useCallback(() => {
    localStorage.setItem('simple-mode-tutorial-completed', 'true');
    setHasCompletedTutorial(true);
    setShowTutorial(false);
  }, []);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem('simple-mode-tutorial-completed');
    setHasCompletedTutorial(false);
  }, []);

  return {
    showTutorial,
    hasCompletedTutorial,
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
  };
}
