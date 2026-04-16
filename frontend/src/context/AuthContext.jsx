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
    localStorage.setItem("token", token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userPayload));
    setUser(userPayload);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const { data } = await API.get("/auth/me");
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
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
    }),
    [user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
