"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  phone: string;
  isPremium: boolean;
  isAdmin: boolean;
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
const ADMIN_CODE = "9999";
const STORAGE_KEY = "sixoracle_user";

// Admin phone numbers (can be extended)
const ADMIN_PHONES = ["090-0000-0000", "admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure isAdmin field exists for backwards compatibility
        if (parsed.isAdmin === undefined) {
          parsed.isAdmin = ADMIN_PHONES.includes(parsed.phone);
        }
        setUser(parsed);
      }
    } catch {}
    setLoading(false);
  }, []);

  const saveUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const login = useCallback((phone: string, code: string): boolean => {
    // Admin login with special code
    if (code === ADMIN_CODE) {
      const adminUser: User = {
        phone,
        isPremium: true,
        isAdmin: true,
        createdAt: Date.now(),
      };
      saveUser(adminUser);
      return true;
    }

    if (code !== DEMO_CODE) return false;

    const isAdmin = ADMIN_PHONES.includes(phone);
    const newUser: User = {
      phone,
      isPremium: isAdmin,
      isAdmin,
      createdAt: Date.now(),
    };
    // Check if existing user
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const existing = JSON.parse(stored);
        if (existing.phone === phone) {
          newUser.isPremium = existing.isPremium || isAdmin;
          newUser.nickname = existing.nickname;
          newUser.createdAt = existing.createdAt;
          newUser.isAdmin = existing.isAdmin || isAdmin;
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
