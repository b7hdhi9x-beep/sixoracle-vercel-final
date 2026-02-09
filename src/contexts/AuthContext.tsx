"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  phone: string;
  isPremium: boolean;
  isAdmin: boolean;
  nickname?: string;
  createdAt: number;
  premiumExpiry?: number; // Unix timestamp when premium expires
  premiumGrantedBy?: string; // "bank_transfer" | "admin" | "activation_code" | undefined
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, code: string) => boolean;
  logout: () => void;
  upgradeToPremium: () => void;
  grantPremium: (phone: string, durationDays: number) => void;
  revokePremium: (phone: string) => void;
  getAllUsers: () => User[];
  isPremiumActive: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => false,
  logout: () => {},
  upgradeToPremium: () => {},
  grantPremium: () => {},
  revokePremium: () => {},
  getAllUsers: () => [],
  isPremiumActive: false,
});

const DEMO_CODE = "1234";
const ADMIN_CODE = "9999";
const STORAGE_KEY = "sixoracle_user";
const ALL_USERS_KEY = "sixoracle_all_users";

// Admin phone numbers (can be extended)
const ADMIN_PHONES = ["090-0000-0000", "admin"];

// Helper: check if premium is still active
function checkPremiumActive(user: User | null): boolean {
  if (!user) return false;
  if (user.isAdmin) return true; // Admins always have access
  if (!user.isPremium) return false;
  if (user.premiumExpiry && Date.now() > user.premiumExpiry) return false; // Expired
  return true;
}

// Helper: save user to all_users registry
function saveToRegistry(user: User) {
  try {
    const stored = localStorage.getItem(ALL_USERS_KEY);
    const users: User[] = stored ? JSON.parse(stored) : [];
    const idx = users.findIndex(u => u.phone === user.phone);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

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
        // Check if premium has expired
        if (parsed.isPremium && parsed.premiumExpiry && Date.now() > parsed.premiumExpiry) {
          parsed.isPremium = false;
          parsed.premiumExpiry = undefined;
          parsed.premiumGrantedBy = undefined;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          saveToRegistry(parsed);
        }
        setUser(parsed);
      }
    } catch {}
    setLoading(false);
  }, []);

  const saveUser = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    saveToRegistry(u);
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
          newUser.premiumExpiry = existing.premiumExpiry;
          newUser.premiumGrantedBy = existing.premiumGrantedBy;
          // Check if expired
          if (newUser.premiumExpiry && Date.now() > newUser.premiumExpiry) {
            newUser.isPremium = isAdmin;
            newUser.premiumExpiry = undefined;
            newUser.premiumGrantedBy = undefined;
          }
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
      saveUser({
        ...user,
        isPremium: true,
        premiumGrantedBy: "bank_transfer",
      });
    }
  }, [user, saveUser]);

  // Admin: grant premium to a user for N days
  const grantPremium = useCallback((phone: string, durationDays: number) => {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      const users: User[] = stored ? JSON.parse(stored) : [];
      const idx = users.findIndex(u => u.phone === phone);
      if (idx >= 0) {
        users[idx].isPremium = true;
        users[idx].premiumExpiry = Date.now() + durationDays * 24 * 60 * 60 * 1000;
        users[idx].premiumGrantedBy = "admin";
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
        // If this is the current user, update state too
        if (user && user.phone === phone) {
          saveUser({
            ...user,
            isPremium: true,
            premiumExpiry: users[idx].premiumExpiry,
            premiumGrantedBy: "admin",
          });
        }
      }
    } catch {}
  }, [user, saveUser]);

  // Admin: revoke premium from a user
  const revokePremium = useCallback((phone: string) => {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      const users: User[] = stored ? JSON.parse(stored) : [];
      const idx = users.findIndex(u => u.phone === phone);
      if (idx >= 0) {
        users[idx].isPremium = false;
        users[idx].premiumExpiry = undefined;
        users[idx].premiumGrantedBy = undefined;
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
        // If this is the current user, update state too
        if (user && user.phone === phone) {
          saveUser({
            ...user,
            isPremium: false,
            premiumExpiry: undefined,
            premiumGrantedBy: undefined,
          });
        }
      }
    } catch {}
  }, [user, saveUser]);

  // Get all registered users
  const getAllUsers = useCallback((): User[] => {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const isPremiumActive = checkPremiumActive(user);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      upgradeToPremium,
      grantPremium,
      revokePremium,
      getAllUsers,
      isPremiumActive,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
