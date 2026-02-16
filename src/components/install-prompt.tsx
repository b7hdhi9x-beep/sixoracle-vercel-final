"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="glass-card rounded-xl p-4 flex items-center gap-3 shadow-2xl border-[#d4af37]/30">
        <div className="text-2xl">✨</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#d4af37]">
            アプリをインストール
          </p>
          <p className="text-xs text-[#9ca3af]">
            ホーム画面に追加してすぐにアクセス
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-[#9ca3af] text-xs px-2"
          >
            閉じる
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="bg-[#d4af37] hover:bg-[#f4d03f] text-[#0a0a1a] text-xs font-bold"
          >
            追加
          </Button>
        </div>
      </div>
    </div>
  );
}
