"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareDialogProps {
  sessionId: string | null;
}

export function ShareDialog({ sessionId }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateLink() {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.shareToken) {
        setShareUrl(`${window.location.origin}/shared/${data.shareToken}`);
        setOpen(true);
      }
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={generateLink}
        disabled={!sessionId || loading}
        className="text-[#9ca3af] hover:text-[#d4af37] transition-colors p-2 disabled:opacity-30"
        title="共有"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-xl p-6 w-full max-w-md mx-4 border border-[rgba(212,175,55,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#d4af37] font-[var(--font-noto-serif-jp)]">
                鑑定を共有
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-[#9ca3af] hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-xs text-[#9ca3af] mb-4">
              以下のリンクを共有すると、鑑定内容を閲覧できます（30日間有効）
            </p>

            <div className="flex gap-2">
              <input
                value={shareUrl}
                readOnly
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(212,175,55,0.2)] rounded-lg px-3 py-2 text-xs text-white"
              />
              <Button
                onClick={copyUrl}
                size="sm"
                className="bg-[#d4af37] hover:bg-[#f4d03f] text-[#0a0a1a] font-bold shrink-0"
              >
                {copied ? "コピー済" : "コピー"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
