import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, FileDown, Wand2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { SocialShare } from "@/components/SocialShare";
import { TextToSpeech } from "@/components/TextToSpeech";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { OracleVoiceSettings } from "@/lib/oracles";

interface FortuneResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  oracleName: string;
  oracleImage: string;
  oracleColor: string;
  oracleVoiceSettings?: OracleVoiceSettings;
  timestamp: Date;
  messageId: number;
  oracleId: string;
  onGenerateCertificate?: () => void;
  onGenerateOmamori?: () => void;
  isGeneratingCertificate?: boolean;
  isGeneratingOmamori?: boolean;
}

/**
 * 鑑定結果のセクションヘッダーをMarkdownの見出しに変換
 */
function formatFortuneContent(content: string): string {
  return content.replace(/═{3,}\s*([^═]+?)\s*═{3,}/g, (_, sectionName) => {
    const trimmedName = sectionName.trim();
    return `\n\n## ${trimmedName}\n\n`;
  });
}

export function FortuneResultModal({
  isOpen,
  onClose,
  content,
  oracleName,
  oracleImage,
  oracleColor,
  oracleVoiceSettings,
  timestamp,
  messageId,
  oracleId,
  onGenerateCertificate,
  onGenerateOmamori,
  isGeneratingCertificate,
  isGeneratingOmamori,
}: FortuneResultModalProps) {
  const { t } = useLanguage();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-user-primary/20 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 md:p-6 pb-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-user-primary/30">
                <AvatarImage src={oracleImage} alt={oracleName} />
              </Avatar>
              <div>
                <DialogTitle className="text-lg font-serif text-white">
                  {oracleName}の鑑定結果
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(timestamp)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-4 md:p-6">
            <div className="prose prose-invert max-w-none">
              <Streamdown className="text-gray-200 leading-relaxed">
                {formatFortuneContent(content)}
              </Streamdown>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 pt-0 border-t border-white/10 bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left side: Utility buttons */}
            <div className="flex items-center gap-2">
              <FavoriteButton
                messageId={messageId}
                oracleId={oracleId}
                content={content}
              />
              <TextToSpeech
                text={content}
                className="opacity-70 hover:opacity-100 transition-opacity"
                voiceSettings={oracleVoiceSettings}
                oracleName={oracleName}
              />
              <SocialShare
                title={t("common", "siteName")}
                text={t("share", "shareText")}
                url="https://sixoracle.net"
                compact={true}
              />
            </div>

            {/* Right side: Download buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-user-primary/30 hover:bg-user-primary/10"
                onClick={onGenerateCertificate}
                disabled={isGeneratingCertificate}
              >
                <FileDown className="w-4 h-4" />
                {isGeneratingCertificate ? "生成中..." : "鑑定書"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-amber-400/30 hover:bg-amber-400/10 text-amber-400"
                onClick={onGenerateOmamori}
                disabled={isGeneratingOmamori}
              >
                <Wand2 className="w-4 h-4" />
                {isGeneratingOmamori ? "生成中..." : "お守り"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
