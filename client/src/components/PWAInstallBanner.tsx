import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    
    if (dismissedTime > threeDaysAgo) {
      return; // Don't show if dismissed within last 3 days
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show banner after delay
    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 1000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install prompt error:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Top Banner - More prominent */}
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black px-4 py-3">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm md:text-base">
                  📱 アプリで快適に占い体験！
                </p>
                <p className="text-xs md:text-sm opacity-80">
                  ホーム画面に追加してワンタップでアクセス
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-black text-white hover:bg-black/80 font-bold whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-1" />
                {isIOS ? "追加方法" : "追加する"}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full border border-primary/30 animate-in zoom-in-95 duration-200">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              📱 ホーム画面に追加する方法
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-amber-400">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">共有ボタンをタップ</p>
                  <p className="text-sm text-muted-foreground">
                    画面下部の <span className="inline-block px-1.5 py-0.5 bg-white/10 rounded text-xs">↑</span> ボタンをタップ
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-amber-400">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">「ホーム画面に追加」を選択</p>
                  <p className="text-sm text-muted-foreground">
                    メニューをスクロールして「ホーム画面に追加」をタップ
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-amber-400">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">「追加」をタップ</p>
                  <p className="text-sm text-muted-foreground">
                    右上の「追加」ボタンをタップして完了！
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              className="w-full mt-6 btn-primary"
            >
              わかりました！
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
