import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { userService, authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await userService.getUser();
      const userData = res.data;
      console.log("Auth initialized with user:", userData);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Auth init failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setLoading(false);
    window.location.href = "/login";
  };

  const updateUser = (updatedUser) => {
    console.log("Updating user in context:", updatedUser);
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};