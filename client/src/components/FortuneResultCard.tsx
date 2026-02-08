import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Loader2, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useLanguage } from "@/contexts/LanguageContext";

interface FortuneResultCardProps {
  oracleName: string;
  oracleImage: string;
  oracleColor: string;
  content: string;
  date: Date;
  className?: string;
  compact?: boolean;
}

export function FortuneResultCard({
  oracleName,
  oracleImage,
  oracleColor,
  content,
  date,
  className = "",
  compact = false,
}: FortuneResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useLanguage();

  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0f0a1e",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Failed to generate image:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `sixoracle-${oracleName}-${date.toISOString().split("T")[0]}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `sixoracle-${oracleName}.png`, { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: t("common", "siteName"),
          text: t("share", "shareText"),
          files: [file],
        });
      } catch (error) {
        // User cancelled or error
        console.log("Share cancelled or failed:", error);
      }
    } else {
      // Fallback: download the image
      handleDownload();
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      // A4サイズのPDFを作成
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      // ヘッダー背景
      pdf.setFillColor(15, 10, 30);
      pdf.rect(0, 0, pageWidth, 50, "F");

      // タイトル
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(24);
      pdf.text("六神ノ間 - Six Oracle", pageWidth / 2, 25, { align: "center" });

      // 占い師名と日付
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text(`鑑定師: ${oracleName}`, pageWidth / 2, 38, { align: "center" });
      
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text(formatDate(date), pageWidth / 2, 45, { align: "center" });

      yPosition = 60;

      // 区切り線
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // 鑑定内容
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(11);
      
      // テキストを行に分割
      const lines = pdf.splitTextToSize(content, contentWidth);
      const lineHeight = 6;

      for (const line of lines) {
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }

      // フッター
      yPosition = pageHeight - 15;
      pdf.setDrawColor(212, 175, 55);
      pdf.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
      
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text("sixoracle.net", pageWidth / 2, yPosition, { align: "center" });

      // PDFをダウンロード
      pdf.save(`sixoracle-${oracleName}-${date.toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (d: Date) => {
    // 日本時間（JST）で日付と時刻を表示
    const dateStr = d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tokyo",
    });
    const timeStr = d.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });
    return `${dateStr} ${timeStr}`;
  };

  // Truncate content for card display
  const truncatedContent = content.length > 300 ? content.slice(0, 300) + "..." : content;

  // Compact mode: just show action buttons inline
  if (compact) {
    return (
      <>
        {/* Hidden card for image generation */}
        <div
          ref={cardRef}
          className="absolute -left-[9999px] overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #0f0a1e 0%, #1a1333 50%, #0f0a1e 100%)",
            minWidth: "360px",
            maxWidth: "480px",
          }}
        >
          {/* Decorative stars */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  opacity: Math.random() * 0.5 + 0.2,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="relative flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full overflow-hidden border-2"
              style={{ borderColor: "#d4af37" }}
            >
              <img
                src={oracleImage}
                alt={oracleName}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <div className="text-lg font-serif" style={{ color: "#d4af37" }}>
                {oracleName}
              </div>
              <div className="text-xs text-gray-400">{formatDate(date)}</div>
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
              {truncatedContent}
            </p>
          </div>

          {/* Footer */}
          <div className="relative mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-gray-500">六神ノ間 - Six Oracle</div>
            <div className="text-xs" style={{ color: "#d4af37" }}>
              sixoracle.net
            </div>
          </div>
        </div>

        {/* Compact action buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isGenerating}
          className="h-8 px-2 text-muted-foreground hover:text-gold"
          title={t("share", "downloadImage")}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="h-8 px-2 text-muted-foreground hover:text-gold"
          title="PDFでダウンロード"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </Button>
      </>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Card for image generation */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a1333 50%, #0f0a1e 100%)",
          minWidth: "360px",
          maxWidth: "480px",
        }}
      >
        {/* Decorative stars */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full overflow-hidden border-2"
            style={{ borderColor: "#d4af37" }}
          >
            <img
              src={oracleImage}
              alt={oracleName}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <div className="text-lg font-serif" style={{ color: "#d4af37" }}>
              {oracleName}
            </div>
            <div className="text-xs text-gray-400">{formatDate(date)}</div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
            {truncatedContent}
          </p>
        </div>

        {/* Footer */}
        <div className="relative mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-gray-500">六神ノ間 - Six Oracle</div>
          <div className="text-xs" style={{ color: "#d4af37" }}>
            sixoracle.net
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isGenerating}
          className="border-white/20 hover:bg-white/10"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {t("share", "downloadImage")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={isGenerating}
          className="border-white/20 hover:bg-white/10"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4 mr-2" />
          )}
          {t("share", "shareWithImage")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="border-white/20 hover:bg-white/10"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          PDFで保存
        </Button>
      </div>
    </div>
  );
}
