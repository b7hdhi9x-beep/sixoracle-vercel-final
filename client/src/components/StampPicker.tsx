import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Star, Heart, Sparkles, Moon, Sun, Cloud, Zap, Flame, Snowflake, Music, Coffee, Gift, Crown, ThumbsUp, PartyPopper } from "lucide-react";

// 占い風のスタンプ・絵文字データ
const stamps = [
  // 基本の絵文字
  { id: "thumbsup", emoji: "👍", label: "いいね" },
  { id: "heart", emoji: "❤️", label: "ハート" },
  { id: "sparkles", emoji: "✨", label: "キラキラ" },
  { id: "star", emoji: "⭐", label: "スター" },
  { id: "moon", emoji: "🌙", label: "月" },
  { id: "sun", emoji: "☀️", label: "太陽" },
  { id: "crystal", emoji: "🔮", label: "水晶" },
  { id: "pray", emoji: "🙏", label: "お願い" },
  
  // 感情表現
  { id: "smile", emoji: "😊", label: "笑顔" },
  { id: "happy", emoji: "😄", label: "嬉しい" },
  { id: "love", emoji: "🥰", label: "大好き" },
  { id: "think", emoji: "🤔", label: "考え中" },
  { id: "surprise", emoji: "😲", label: "驚き" },
  { id: "cry", emoji: "😢", label: "悲しい" },
  { id: "relieved", emoji: "😌", label: "安心" },
  { id: "excited", emoji: "🤩", label: "興奮" },
  
  // 占い・スピリチュアル系
  { id: "zodiac", emoji: "♈", label: "牡羊座" },
  { id: "tarot", emoji: "🃏", label: "タロット" },
  { id: "candle", emoji: "🕯️", label: "キャンドル" },
  { id: "eye", emoji: "👁️", label: "目" },
  { id: "rainbow", emoji: "🌈", label: "虹" },
  { id: "clover", emoji: "🍀", label: "四つ葉" },
  { id: "butterfly", emoji: "🦋", label: "蝶" },
  { id: "dragon", emoji: "🐉", label: "龍" },
  
  // リアクション
  { id: "fire", emoji: "🔥", label: "燃える" },
  { id: "100", emoji: "💯", label: "100点" },
  { id: "party", emoji: "🎉", label: "お祝い" },
  { id: "gift", emoji: "🎁", label: "プレゼント" },
  { id: "crown", emoji: "👑", label: "王冠" },
  { id: "gem", emoji: "💎", label: "宝石" },
  { id: "rose", emoji: "🌹", label: "バラ" },
  { id: "cherry", emoji: "🌸", label: "桜" },
];

// カテゴリ分け
const categories = [
  { id: "basic", label: "基本", icon: Star, stamps: stamps.slice(0, 8) },
  { id: "emotion", label: "感情", icon: Heart, stamps: stamps.slice(8, 16) },
  { id: "fortune", label: "占い", icon: Moon, stamps: stamps.slice(16, 24) },
  { id: "reaction", label: "リアクション", icon: Sparkles, stamps: stamps.slice(24, 32) },
];

interface StampPickerProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function StampPicker({ onSelect, disabled }: StampPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("basic");

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  const activeStamps = categories.find(c => c.id === activeCategory)?.stamps || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          className="border-user-primary/30 text-user-primary hover:bg-user-primary/10 px-3 h-[60px] w-[48px]"
          title="スタンプ・絵文字"
        >
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-background/95 backdrop-blur-lg border-border/30"
        align="end"
        side="top"
        sideOffset={8}
      >
        {/* カテゴリタブ */}
        <div className="flex border-b border-border/20 p-1 gap-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs transition-colors ${
                  activeCategory === category.id
                    ? "bg-user-primary/20 text-user-primary"
                    : "text-muted-foreground hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* スタンプグリッド */}
        <div className="p-3">
          <div className="grid grid-cols-4 gap-2">
            {activeStamps.map((stamp) => (
              <button
                key={stamp.id}
                onClick={() => handleSelect(stamp.emoji)}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors group"
                title={stamp.label}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">
                  {stamp.emoji}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {stamp.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* よく使うスタンプ（履歴） */}
        <div className="border-t border-border/20 p-2">
          <div className="text-[10px] text-muted-foreground mb-2 px-1">よく使う</div>
          <div className="flex gap-1">
            {["✨", "❤️", "🔮", "🙏", "😊", "👍"].map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleSelect(emoji)}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <span className="text-lg">{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
