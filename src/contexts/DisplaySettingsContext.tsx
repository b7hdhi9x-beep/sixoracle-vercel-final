import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSize = "small" | "medium" | "large";
export type ColorTheme = "dark" | "light";

interface DisplaySettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  toggleColorTheme: () => void;
  autoSaveFavorites: boolean;
  setAutoSaveFavorites: (enabled: boolean) => void;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

const FONT_SIZE_KEY = "six-oracle-font-size";
const COLOR_THEME_KEY = "six-oracle-color-theme";
const AUTO_SAVE_FAVORITES_KEY = "six-oracle-auto-save-favorites";

interface DisplaySettingsProviderProps {
  children: React.ReactNode;
}

export function DisplaySettingsProvider({ children }: DisplaySettingsProviderProps) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    return (stored as FontSize) || "medium";
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem(COLOR_THEME_KEY);
    return (stored as ColorTheme) || "dark";
  });

  const [autoSaveFavorites, setAutoSaveFavoritesState] = useState<boolean>(() => {
    const stored = localStorage.getItem(AUTO_SAVE_FAVORITES_KEY);
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
    
    // Apply font size class to document
    const root = document.documentElement;
    root.classList.remove("font-size-small", "font-size-medium", "font-size-large");
    root.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(COLOR_THEME_KEY, colorTheme);
    
    // Apply theme class to document
    const root = document.documentElement;
    if (colorTheme === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light-theme");
      root.classList.add("dark");
    }
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem(AUTO_SAVE_FAVORITES_KEY, autoSaveFavorites.toString());
  }, [autoSaveFavorites]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
  };

  const toggleColorTheme = () => {
    setColorThemeState(prev => prev === "dark" ? "light" : "dark");
  };

  const setAutoSaveFavorites = (enabled: boolean) => {
    setAutoSaveFavoritesState(enabled);
  };

  return (
    <DisplaySettingsContext.Provider value={{ 
      fontSize, 
      setFontSize, 
      colorTheme, 
      setColorTheme,
      toggleColorTheme,
      autoSaveFavorites,
      setAutoSaveFavorites,
    }}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    throw new Error("useDisplaySettings must be used within DisplaySettingsProvider");
  }
  return context;
}
