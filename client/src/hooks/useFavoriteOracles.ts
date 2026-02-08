import { useState, useEffect, useCallback } from "react";

const FAVORITE_ORACLES_KEY = "simple-mode-favorite-oracles";
const MAX_FAVORITES = 3;

export function useFavoriteOracles() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem(FAVORITE_ORACLES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITE_ORACLES_KEY, JSON.stringify(newFavorites));
  }, []);

  // Check if an oracle is a favorite
  const isFavorite = useCallback((oracleId: string) => {
    return favorites.includes(oracleId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((oracleId: string) => {
    if (favorites.includes(oracleId)) {
      // Remove from favorites
      saveFavorites(favorites.filter(id => id !== oracleId));
    } else {
      // Add to favorites (max 3)
      if (favorites.length < MAX_FAVORITES) {
        saveFavorites([...favorites, oracleId]);
      } else {
        // Replace the oldest favorite
        saveFavorites([...favorites.slice(1), oracleId]);
      }
    }
  }, [favorites, saveFavorites]);

  // Add to favorites
  const addFavorite = useCallback((oracleId: string) => {
    if (!favorites.includes(oracleId)) {
      if (favorites.length < MAX_FAVORITES) {
        saveFavorites([...favorites, oracleId]);
      } else {
        // Replace the oldest favorite
        saveFavorites([...favorites.slice(1), oracleId]);
      }
    }
  }, [favorites, saveFavorites]);

  // Remove from favorites
  const removeFavorite = useCallback((oracleId: string) => {
    saveFavorites(favorites.filter(id => id !== oracleId));
  }, [favorites, saveFavorites]);

  // Get the most recent favorite
  const getMostRecentFavorite = useCallback(() => {
    return favorites.length > 0 ? favorites[favorites.length - 1] : null;
  }, [favorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    getMostRecentFavorite,
    hasFavorites: favorites.length > 0,
    maxFavorites: MAX_FAVORITES,
  };
}
