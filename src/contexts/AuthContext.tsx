"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  phone: string;
  isPremium: boolean;
  nickname?: string;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, code: string) => boolean;
  logout: () => void;
  upgradeToPremium: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => false,
  logout: () => {},
  upgradeToPremium: () => {},
});

const DEMO_CODE = "1234";
const STORAGE_KEY = "sixoracle_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
    setLoading(false);
  }, []);

  const saveUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const login = useCallback((phone: string, code: string): boolean => {
    if (code !== DEMO_CODE) return false;
    const newUser: User = {
      phone,
      isPremium: false,
      createdAt: Date.now(),
    };
    // Check if existing user
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const existing = JSON.parse(stored);
        if (existing.phone === phone) {
          newUser.isPremium = existing.isPremium;
          newUser.nickname = existing.nickname;
          newUser.createdAt = existing.createdAt;
        }
      }
    } catch {}
    saveUser(newUser);
    return true;
  }, [saveUser]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const upgradeToPremium = useCallback(() => {
    if (user) {
      saveUser({ ...user, isPremium: true });
    }
  }, [user, saveUser]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      upgradeToPremium,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
