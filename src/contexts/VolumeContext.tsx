import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type VolumeLevel = "low" | "medium" | "high";

interface VolumeContextType {
  volume: VolumeLevel;
  setVolume: (volume: VolumeLevel) => void;
  cycleVolume: () => void;
  getVolumeValue: () => number;
}

const VolumeContext = createContext<VolumeContextType | undefined>(undefined);

const VOLUME_STORAGE_KEY = "simple-mode-volume";

// Volume levels mapped to actual values (0-1)
const volumeValues: Record<VolumeLevel, number> = {
  low: 0.3,
  medium: 0.6,
  high: 1.0,
};

// Japanese labels for each volume level
export const volumeLabels: Record<VolumeLevel, string> = {
  low: "小",
  medium: "中",
  high: "大",
};

// Volume levels in order for cycling
const volumeLevels: VolumeLevel[] = ["low", "medium", "high"];

export function VolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState<VolumeLevel>("medium");

  // Load volume from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (saved && volumeLevels.includes(saved as VolumeLevel)) {
      setVolumeState(saved as VolumeLevel);
    }
  }, []);

  // Save volume to localStorage
  const setVolume = useCallback((newVolume: VolumeLevel) => {
    setVolumeState(newVolume);
    localStorage.setItem(VOLUME_STORAGE_KEY, newVolume);
  }, []);

  // Cycle through volume levels
  const cycleVolume = useCallback(() => {
    const currentIndex = volumeLevels.indexOf(volume);
    const nextIndex = (currentIndex + 1) % volumeLevels.length;
    setVolume(volumeLevels[nextIndex]);
  }, [volume, setVolume]);

  // Get the actual volume value (0-1)
  const getVolumeValue = useCallback(() => {
    return volumeValues[volume];
  }, [volume]);

  return (
    <VolumeContext.Provider value={{ volume, setVolume, cycleVolume, getVolumeValue }}>
      {children}
    </VolumeContext.Provider>
  );
}

export function useVolume() {
  const context = useContext(VolumeContext);
  if (context === undefined) {
    throw new Error("useVolume must be used within a VolumeProvider");
  }
  return context;
}
