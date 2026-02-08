import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock, Trash2, ChevronDown, ChevronUp, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceHistoryItem {
  id: string;
  text: string;
  timestamp: Date;
}

interface VoiceHistoryProps {
  onSelect: (text: string) => void;
  className?: string;
}

const STORAGE_KEY = "voice_history";
const MAX_HISTORY_ITEMS = 10;

export function VoiceHistory({ onSelect, className }: VoiceHistoryProps) {
  const [history, setHistory] = useState<VoiceHistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (err) {
      console.error("Failed to load voice history:", err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save voice history:", err);
    }
  }, [history]);

  const deleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <History className="w-3 h-3" />
        <span>履歴 ({history.length})</span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </Button>

      {isExpanded && (
        <div className="absolute bottom-full left-0 mb-2 w-72 glass-card rounded-lg border border-border/30 shadow-xl z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
            <span className="text-xs font-medium text-muted-foreground">音声入力履歴</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              全削除
            </Button>
          </div>
          
          <ScrollArea className="max-h-48">
            <div className="p-2 space-y-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start gap-2 p-2 rounded-md hover:bg-white/5 transition-colors"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelect(item.text)}
                    className="h-6 w-6 shrink-0 hover:bg-primary/20"
                    title="入力欄に追加"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate" title={item.text}>
                      {item.text}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.timestamp)}</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteItem(item.id)}
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                    title="削除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Helper function to add item to history (to be called from VoiceInput)
export function addToVoiceHistory(text: string) {
  if (!text.trim()) return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let history: VoiceHistoryItem[] = stored ? JSON.parse(stored) : [];
    
    // Add new item at the beginning
    const newItem: VoiceHistoryItem = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date()
    };
    
    // Remove duplicates
    history = history.filter(item => item.text !== text.trim());
    
    // Add to beginning and limit size
    history = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Failed to add to voice history:", err);
  }
}
