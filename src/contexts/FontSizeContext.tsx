import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type FontSize = "small" | "medium" | "large";

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontSizeClass: string;
  fontSizeLabel: string;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const FONT_SIZE_STORAGE_KEY = "simple-mode-font-size";

// Font size configurations
const fontSizeConfig: Record<FontSize, { class: string; label: string }> = {
  small: {
    class: "text-base",
    label: "小",
  },
  medium: {
    class: "text-lg",
    label: "中",
  },
  large: {
    class: "text-xl",
    label: "大",
  },
};

// CSS custom properties for each font size
const fontSizeStyles: Record<FontSize, Record<string, string>> = {
  small: {
    "--simple-status-size": "1.25rem",    // text-xl
    "--simple-title-size": "1.5rem",      // text-2xl
    "--simple-oracle-name": "1.5rem",     // text-2xl
    "--simple-message-size": "1rem",      // text-base
    "--simple-button-size": "1rem",       // text-base
    "--simple-hint-size": "0.875rem",     // text-sm
  },
  medium: {
    "--simple-status-size": "1.5rem",     // text-2xl
    "--simple-title-size": "1.875rem",    // text-3xl
    "--simple-oracle-name": "1.875rem",   // text-3xl
    "--simple-message-size": "1.25rem",   // text-xl
    "--simple-button-size": "1.125rem",   // text-lg
    "--simple-hint-size": "1rem",         // text-base
  },
  large: {
    "--simple-status-size": "1.875rem",   // text-3xl
    "--simple-title-size": "2.25rem",     // text-4xl
    "--simple-oracle-name": "2.25rem",    // text-4xl
    "--simple-message-size": "1.5rem",    // text-2xl
    "--simple-button-size": "1.25rem",    // text-xl
    "--simple-hint-size": "1.125rem",     // text-lg
  },
};

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  // Load saved font size on mount
  useEffect(() => {
    const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (saved && (saved === "small" || saved === "medium" || saved === "large")) {
      setFontSizeState(saved as FontSize);
    }
  }, []);

  // Apply CSS custom properties when font size changes
  useEffect(() => {
    const styles = fontSizeStyles[fontSize];
    Object.entries(styles).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }, [fontSize]);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
  }, []);

  const value: FontSizeContextType = {
    fontSize,
    setFontSize,
    fontSizeClass: fontSizeConfig[fontSize].class,
    fontSizeLabel: fontSizeConfig[fontSize].label,
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
}

// Helper hook for getting size-specific classes
export function useFontSizeClasses() {
  const { fontSize } = useFontSize();
  
  return {
    status: fontSize === "small" ? "text-xl" : fontSize === "medium" ? "text-2xl" : "text-3xl",
    title: fontSize === "small" ? "text-2xl" : fontSize === "medium" ? "text-3xl" : "text-4xl",
    oracleName: fontSize === "small" ? "text-2xl" : fontSize === "medium" ? "text-3xl" : "text-4xl",
    message: fontSize === "small" ? "text-base" : fontSize === "medium" ? "text-xl" : "text-2xl",
    button: fontSize === "small" ? "text-base" : fontSize === "medium" ? "text-lg" : "text-xl",
    hint: fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg",
    label: fontSize === "small" ? "text-xs" : fontSize === "medium" ? "text-sm" : "text-base",
  };
}
