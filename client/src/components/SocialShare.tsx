import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Share2 } from "lucide-react";

interface SocialShareProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  compact?: boolean;
}

// Twitter/X icon
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// LINE icon
function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

// Facebook icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function SocialShare({ title, text, url, className = "", compact = false }: SocialShareProps) {
  const { t } = useLanguage();
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };
  
  const shareToLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(lineUrl, "_blank", "width=550,height=420");
  };
  
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error, fallback to Twitter
        shareToTwitter();
      }
    } else {
      shareToTwitter();
    }
  };

  // Compact mode: single share button
  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNativeShare}
        className="h-8 px-2 text-muted-foreground hover:text-gold"
        title={t("share", "shareResult")}
      >
        <Share2 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <p className="text-sm text-muted-foreground">{t("share", "shareResult")}</p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={shareToTwitter}
          className="w-12 h-12 rounded-full border-white/20 hover:bg-white/10 hover:border-white/40 transition-all"
          title="Share on X (Twitter)"
        >
          <TwitterIcon className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={shareToLine}
          className="w-12 h-12 rounded-full border-white/20 hover:bg-[#00B900]/20 hover:border-[#00B900]/40 hover:text-[#00B900] transition-all"
          title="Share on LINE"
        >
          <LineIcon className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={shareToFacebook}
          className="w-12 h-12 rounded-full border-white/20 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 hover:text-[#1877F2] transition-all"
          title="Share on Facebook"
        >
          <FacebookIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
