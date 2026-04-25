import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "buildstack_user";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
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

  const login = ({ token: incomingToken, user: incomingUser }) => {
    if (incomingToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, incomingToken);
      setToken(incomingToken);
    }

    if (incomingUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(incomingUser));
      setUser(incomingUser);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      setUser(null);
      return null;
    }

    const { data } = await API.get("/auth/me");
    setUser(data.user || null);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user || null));
    return data.user || null;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!existingToken) {
        setIsAuthLoading(false);
        return;
      }

      setToken(existingToken);

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
      token,
      user,
      isAuthLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
      refreshUser,
    }),
    [token, user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
