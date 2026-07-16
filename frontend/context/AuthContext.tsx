"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  address_detail?: string | null;
  province_code?: string | null;
  province_name?: string | null;
  ward_code?: string | null;
  ward_name?: string | null;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthReady: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Initialize from local storage on mount (simulating persisted session)
  useEffect(() => {
    const storedUser = localStorage.getItem("bloom_auth_user");
    const storedToken = localStorage.getItem("bloom_auth_token");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }

    setIsAuthReady(true);
  }, []);

  const login = (userData: User, authToken?: string) => {
    // Generate an avatar if not provided
    const userWithAvatar = {
      ...userData,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userData.name)}`
    };
    setUser(userWithAvatar);
    localStorage.setItem("bloom_auth_user", JSON.stringify(userWithAvatar));

    if (authToken) {
      setToken(authToken);
      localStorage.setItem("bloom_auth_token", authToken);
    }

    setIsAuthReady(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bloom_auth_user");
    localStorage.removeItem("bloom_auth_token");
    setIsAuthReady(true);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...data };
      localStorage.setItem("bloom_auth_user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthReady, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
