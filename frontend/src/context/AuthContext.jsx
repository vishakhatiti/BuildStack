import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

const USER_STORAGE_KEY = "buildstack_user";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const login = ({ token, user: userPayload }) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (userPayload) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userPayload));
      setUser(userPayload);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await API.get("/auth/me");
    setUser(data.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    return data.user;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        logout();
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser,
      refreshUser,
    }),
    [user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
