import { useFontSize, FontSize } from "@/contexts/FontSizeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Type } from "lucide-react";

interface FontSizeSelectorProps {
  className?: string;
}

const sizes: { value: FontSize; label: string; sampleSize: string }[] = [
  { value: "small", label: "小", sampleSize: "text-sm" },
  { value: "medium", label: "中", sampleSize: "text-base" },
  { value: "large", label: "大", sampleSize: "text-lg" },
];

export function FontSizeSelector({ className }: FontSizeSelectorProps) {
  const { fontSize, setFontSize } = useFontSize();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Type className="w-5 h-5 text-amber-400" />
      <div className="flex rounded-full bg-white/10 p-1">
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => setFontSize(size.value)}
            className={cn(
              "px-4 py-2 rounded-full transition-all duration-200 font-medium",
              size.sampleSize,
              fontSize === size.value
                ? "bg-amber-500 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            )}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact version for header
export function FontSizeSelectorCompact({ className }: FontSizeSelectorProps) {
  const { fontSize, setFontSize } = useFontSize();

  const cycleSize = () => {
    const order: FontSize[] = ["small", "medium", "large"];
    const currentIndex = order.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % order.length;
    setFontSize(order[nextIndex]);
  };

  const currentLabel = sizes.find(s => s.value === fontSize)?.label || "中";

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={cycleSize}
      className={cn("text-white hover:bg-white/10 text-xl p-6 flex items-center gap-2", className)}
    >
      <Type className="w-6 h-6" />
      <span className="text-amber-400 font-bold">{currentLabel}</span>
    </Button>
  );
}
