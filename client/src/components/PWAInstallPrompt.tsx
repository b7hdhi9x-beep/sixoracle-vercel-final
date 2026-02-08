import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
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

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    if (dismissedTime > oneDayAgo) {
      return; // Don't show if dismissed within last 24 hours
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show custom guide after delay
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 2000);
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
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
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install prompt error:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* Main Install Prompt */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="glass-card rounded-2xl p-4 border border-primary/30 shadow-xl">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-1">アプリとして追加</h3>
              <p className="text-sm text-muted-foreground mb-3">
                ホーム画面に追加すると、いつでもワンタップで占いができます
              </p>
              
              <Button
                onClick={handleInstall}
                className="w-full btn-primary"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {isIOS ? "追加方法を見る" : "ホーム画面に追加"}
              </Button>
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
              ホーム画面に追加する方法
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">共有ボタンをタップ</p>
                  <p className="text-sm text-muted-foreground">
                    画面下部の <span className="inline-block px-1 py-0.5 bg-white/10 rounded text-xs">↑</span> ボタンをタップ
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">「ホーム画面に追加」を選択</p>
                  <p className="text-sm text-muted-foreground">
                    メニューをスクロールして「ホーム画面に追加」をタップ
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">「追加」をタップ</p>
                  <p className="text-sm text-muted-foreground">
                    右上の「追加」ボタンをタップして完了
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              className="w-full mt-6"
              variant="outline"
            >
              閉じる
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
