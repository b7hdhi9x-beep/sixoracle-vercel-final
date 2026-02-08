import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandableMessageProps {
  content: string;
  maxLines?: number;
  className?: string;
  children?: ReactNode;
  /** デフォルトで展開するかどうか（trueの場合、最初から全文表示） */
  defaultExpanded?: boolean;
  /** 折りたたみ機能を無効にするかどうか（trueの場合、常に全文表示） */
  disableCollapse?: boolean;
}

/**
 * 長いメッセージを折りたたみ表示するコンポーネント
 * 指定した行数を超える場合、「続きを読む」ボタンを表示
 * 
 * モバイルでの読みやすさを考慮し、デフォルトで展開表示も可能
 */
export function ExpandableMessage({ 
  content, 
  maxLines = 8, 
  className = "",
  children,
  defaultExpanded = true,  // デフォルトで展開状態に変更
  disableCollapse = false  // 折りたたみ機能を無効化するオプション
}: ExpandableMessageProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // コンテンツの実際の高さと制限高さを比較
    if (measureRef.current && contentRef.current) {
      const lineHeight = parseFloat(getComputedStyle(measureRef.current).lineHeight) || 24;
      const maxHeight = lineHeight * maxLines;
      const actualHeight = measureRef.current.scrollHeight;
      
      setNeedsExpansion(actualHeight > maxHeight + 10); // 10pxのマージン
    }
  }, [content, maxLines]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 折りたたみが無効の場合は常に展開
  const shouldShowExpanded = disableCollapse || isExpanded;

  // 行数制限のスタイル
  const collapsedStyle = {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  };

  return (
    <div className={`relative overflow-hidden max-w-full ${className}`} style={{ maxWidth: '100%' }}>
      {/* 実際の高さを測定するための非表示要素 */}
      <div 
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none"
        style={{ visibility: 'hidden', position: 'absolute', top: 0, left: 0, right: 0, wordBreak: 'break-word', overflowWrap: 'break-word' }}
        aria-hidden="true"
      >
        {children || content}
      </div>

      {/* 表示用コンテンツ */}
      <div
        ref={contentRef}
        className="break-words"
        style={!shouldShowExpanded && needsExpansion ? { ...collapsedStyle, wordBreak: 'break-word', overflowWrap: 'break-word' } : { wordBreak: 'break-word', overflowWrap: 'break-word' }}
      >
        {children || content}
      </div>

      {/* 折りたたみ/展開ボタン - 折りたたみが有効で、かつ折りたたみが必要な場合のみ表示 */}
      {!disableCollapse && needsExpansion && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 gap-1 px-4 py-2 rounded-full border border-amber-400/30 transition-all duration-200"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>閉じる</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>続きを読む</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ExpandableMessage;
