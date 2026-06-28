import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { setAuthToken } from "../api/client";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore a session from the cookie on first load.
  useEffect(() => {
    const token = cookies.token;
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    authApi
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        removeCookie("token", { path: "/" });
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = (token, sessionUser) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    setCookie("token", token, { path: "/", expires, sameSite: "lax" });
    setAuthToken(token);
    setUser(sessionUser);
  };

  const login = async (identifier, password) => {
    const data = await authApi.login(identifier, password);
    persistSession(data.token, data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await authApi.register(payload);
    persistSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    removeCookie("token", { path: "/" });
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const data = await authApi.getMe();
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
