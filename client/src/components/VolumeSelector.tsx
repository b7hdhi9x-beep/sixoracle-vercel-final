import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVolume, volumeLabels, VolumeLevel } from "@/contexts/VolumeContext";
import { cn } from "@/lib/utils";

// Get the appropriate volume icon based on level
function getVolumeIcon(level: VolumeLevel) {
  switch (level) {
    case "low":
      return Volume;
    case "medium":
      return Volume1;
    case "high":
      return Volume2;
    default:
      return Volume1;
  }
}

// Compact volume selector for header
export function VolumeSelectorCompact() {
  const { volume, cycleVolume } = useVolume();
  const VolumeIcon = getVolumeIcon(volume);

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={cycleVolume}
      className="text-white hover:bg-white/10 text-xl p-4 flex items-center gap-2"
      title={`音量: ${volumeLabels[volume]}`}
    >
      <VolumeIcon className="w-7 h-7" />
      <span className="text-lg font-medium">{volumeLabels[volume]}</span>
    </Button>
  );
}

// Full volume selector with all options visible
export function VolumeSelector() {
  const { volume, setVolume } = useVolume();

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-gray-300">読み上げ音量</p>
      <div className="flex gap-4">
        {(["low", "medium", "high"] as VolumeLevel[]).map((level) => {
          const VolumeIcon = getVolumeIcon(level);
          return (
            <button
              key={level}
              onClick={() => setVolume(level)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200",
                "min-w-[80px]",
                volume === level
                  ? "bg-amber-500 text-white scale-105"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              )}
            >
              <VolumeIcon className="w-8 h-8" />
              <span className="text-lg font-medium">{volumeLabels[level]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Large volume buttons for accessibility
export function VolumeSelectorLarge() {
  const { volume, setVolume } = useVolume();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center text-amber-400">
        読み上げ音量
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {(["low", "medium", "high"] as VolumeLevel[]).map((level) => {
          const VolumeIcon = getVolumeIcon(level);
          return (
            <button
              key={level}
              onClick={() => setVolume(level)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-200",
                "border-4",
                volume === level
                  ? "bg-amber-500 text-white border-amber-400 scale-105"
                  : "bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:border-white/30"
              )}
            >
              <VolumeIcon className="w-12 h-12" />
              <span className="text-2xl font-bold">{volumeLabels[level]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
