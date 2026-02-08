import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type ContrastMode = "normal" | "high-dark" | "high-light";

interface ContrastContextType {
  contrast: ContrastMode;
  setContrast: (contrast: ContrastMode) => void;
  cycleContrast: () => void;
  isHighContrast: boolean;
}

const ContrastContext = createContext<ContrastContextType | undefined>(undefined);

const CONTRAST_STORAGE_KEY = "simple-mode-contrast";

// Japanese labels for each contrast mode
export const contrastLabels: Record<ContrastMode, string> = {
  normal: "通常",
  "high-dark": "黒地",
  "high-light": "白地",
};

// Contrast modes in order for cycling
const contrastModes: ContrastMode[] = ["normal", "high-dark", "high-light"];

export function ContrastProvider({ children }: { children: ReactNode }) {
  const [contrast, setContrastState] = useState<ContrastMode>("normal");

  // Load contrast from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CONTRAST_STORAGE_KEY);
    if (saved && contrastModes.includes(saved as ContrastMode)) {
      setContrastState(saved as ContrastMode);
    }
  }, []);

  // Save contrast to localStorage
  const setContrast = useCallback((newContrast: ContrastMode) => {
    setContrastState(newContrast);
    localStorage.setItem(CONTRAST_STORAGE_KEY, newContrast);
  }, []);

  // Cycle through contrast modes
  const cycleContrast = useCallback(() => {
    const currentIndex = contrastModes.indexOf(contrast);
    const nextIndex = (currentIndex + 1) % contrastModes.length;
    setContrast(contrastModes[nextIndex]);
  }, [contrast, setContrast]);

  const isHighContrast = contrast !== "normal";

  return (
    <ContrastContext.Provider value={{ contrast, setContrast, cycleContrast, isHighContrast }}>
      {children}
    </ContrastContext.Provider>
  );
}

export function useContrast() {
  const context = useContext(ContrastContext);
  if (context === undefined) {
    throw new Error("useContrast must be used within a ContrastProvider");
  }
  return context;
}

// CSS classes for high contrast modes
export function getContrastClasses(contrast: ContrastMode) {
  switch (contrast) {
    case "high-dark":
      return {
        background: "bg-black",
        text: "text-white",
        border: "border-white",
        button: "bg-white text-black hover:bg-gray-200",
        buttonOutline: "bg-transparent text-white border-2 border-white hover:bg-white hover:text-black",
        card: "bg-gray-900 border-white border-2",
        input: "bg-black text-white border-white border-2",
        accent: "text-yellow-300",
        muted: "text-gray-300",
      };
    case "high-light":
      return {
        background: "bg-white",
        text: "text-black",
        border: "border-black",
        button: "bg-black text-white hover:bg-gray-800",
        buttonOutline: "bg-transparent text-black border-2 border-black hover:bg-black hover:text-white",
        card: "bg-gray-100 border-black border-2",
        input: "bg-white text-black border-black border-2",
        accent: "text-blue-800",
        muted: "text-gray-700",
      };
    default:
      return {
        background: "",
        text: "",
        border: "",
        button: "",
        buttonOutline: "",
        card: "",
        input: "",
        accent: "",
        muted: "",
      };
  }
}
