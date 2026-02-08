import { Eye, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContrast, contrastLabels, ContrastMode } from "@/contexts/ContrastContext";
import { cn } from "@/lib/utils";

// Get the appropriate icon based on contrast mode
function getContrastIcon(mode: ContrastMode) {
  switch (mode) {
    case "normal":
      return Eye;
    case "high-dark":
      return Moon;
    case "high-light":
      return Sun;
    default:
      return Eye;
  }
}

// Compact contrast selector for header
export function ContrastSelectorCompact() {
  const { contrast, cycleContrast } = useContrast();
  const ContrastIcon = getContrastIcon(contrast);

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={cycleContrast}
      className={cn(
        "text-xl p-4 flex items-center gap-2",
        contrast === "high-light" 
          ? "text-black hover:bg-black/10" 
          : "text-white hover:bg-white/10"
      )}
      title={`配色: ${contrastLabels[contrast]}`}
    >
      <ContrastIcon className="w-7 h-7" />
      <span className="text-lg font-medium">{contrastLabels[contrast]}</span>
    </Button>
  );
}

// Full contrast selector with all options visible
export function ContrastSelector() {
  const { contrast, setContrast } = useContrast();

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-gray-300">画面の配色</p>
      <div className="flex gap-4">
        {(["normal", "high-dark", "high-light"] as ContrastMode[]).map((mode) => {
          const ContrastIcon = getContrastIcon(mode);
          return (
            <button
              key={mode}
              onClick={() => setContrast(mode)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200",
                "min-w-[80px]",
                contrast === mode
                  ? "bg-amber-500 text-white scale-105"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              )}
            >
              <ContrastIcon className="w-8 h-8" />
              <span className="text-lg font-medium">{contrastLabels[mode]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Large contrast buttons for accessibility
export function ContrastSelectorLarge() {
  const { contrast, setContrast } = useContrast();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center text-amber-400">
        画面の配色
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {(["normal", "high-dark", "high-light"] as ContrastMode[]).map((mode) => {
          const ContrastIcon = getContrastIcon(mode);
          return (
            <button
              key={mode}
              onClick={() => setContrast(mode)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-200",
                "border-4",
                contrast === mode
                  ? "bg-amber-500 text-white border-amber-400 scale-105"
                  : "bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:border-white/30"
              )}
            >
              <ContrastIcon className="w-12 h-12" />
              <span className="text-2xl font-bold">{contrastLabels[mode]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
