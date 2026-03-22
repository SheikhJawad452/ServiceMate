import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || localStorage.getItem("servicemate_token") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("servicemate_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token") || localStorage.getItem("servicemate_token")));
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const hasBootstrapped = useRef(false);

  const setSession = (payload) => {
    if (payload?.token) {
      localStorage.setItem("token", payload.token);
      localStorage.setItem("servicemate_token", payload.token);
      setToken(payload.token);
      setUser(payload.user || null);
      setIsAuthenticated(true);
      localStorage.setItem("servicemate_user", JSON.stringify(payload.user || null));
      return;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("servicemate_token");
    localStorage.removeItem("servicemate_user");
    setToken("");
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateWithLoader = (navigate, to, options = {}) => {
    if (typeof navigate !== "function") return;
    setIsNavigating(true);
    navigate(to, options);
  };

  const signup = async (payload, navigate) => {
    const response = await api.post("/auth/signup", payload);
    if (response?.success && typeof navigate === "function") {
      navigateWithLoader(navigate, "/verify-otp", { replace: true, state: { email: payload?.email || "" } });
    }
    return response;
  };

  const verifyOtp = async (payload, navigate) => {
    const response = await api.post("/auth/verify-otp", payload);
    if (response?.token) {
      setSession({ token: response.token, user: response.user });
      if (typeof navigate === "function") {
        navigateWithLoader(navigate, "/dashboard", { replace: true });
      }
    }
    return response;
  };

  const login = async (payload, navigate) => {
    try {
      const response = await api.post("/auth/login", payload);
      if (response?.token) {
        setSession({ token: response.token, user: response.user });
        if (typeof navigate === "function") {
          navigateWithLoader(navigate, "/dashboard", { replace: true });
        }
      }
      return response;
    } catch (error) {
      const message = error?.message || "";
      if (message.toLowerCase().includes("verify otp") && typeof navigate === "function") {
        navigateWithLoader(navigate, `/verify-otp?email=${encodeURIComponent(payload.email)}`, { replace: true });
      }
      throw error;
    }
  };

  const loadUser = async () => {
    setLoading(true);
    const storedToken = localStorage.getItem("token") || localStorage.getItem("servicemate_token");
    if (!storedToken) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setToken(storedToken);
      setUser(response?.user || null);
      setIsAuthenticated(Boolean(response?.user));
      localStorage.setItem("servicemate_user", JSON.stringify(response?.user || null));
    } catch (error) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;
    loadUser();
  }, []);

  const logout = (navigate) => {
    setSession(null);
    if (typeof navigate === "function") {
      navigateWithLoader(navigate, "/login", { replace: true });
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isLoading: loading,
      isAuthenticated,
      signup,
      verifyOtp,
      login,
      loadUser,
      logout,
      isNavigating,
      setIsNavigating,
      navigateWithLoader,
    }),
    [token, user, loading, isAuthenticated, isNavigating],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
