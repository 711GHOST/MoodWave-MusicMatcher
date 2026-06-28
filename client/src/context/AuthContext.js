import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { setAuthToken } from "../api/client";
import * as authApi from "../api/auth";
import { clearRecentlyPlayed } from "../utils/recentlyPlayed";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // True only right after a fresh sign-up — drives the welcome modal.
  const [justRegistered, setJustRegistered] = useState(false);

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
    if (data.isNewUser) setJustRegistered(true);
    return data.user;
  };

  const logout = () => {
    removeCookie("token", { path: "/" });
    setAuthToken(null);
    setUser(null);
    setJustRegistered(false);
    // Don't leak listening history to the next account on a shared browser.
    clearRecentlyPlayed();
  };

  const refreshUser = async () => {
    const data = await authApi.getMe();
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (payload) => {
    const data = await authApi.updateProfile(payload);
    setUser(data.user);
    return data.user;
  };

  // Returns the server payload (includes a demo `devCode`).
  const sendOtp = (channel) => authApi.sendOtp(channel);

  const verifyOtp = async (channel, code) => {
    const data = await authApi.verifyOtp(channel, code);
    if (data.user) setUser(data.user);
    return data;
  };

  const goPremium = async () => {
    const data = await authApi.goPremium();
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        justRegistered,
        clearJustRegistered: () => setJustRegistered(false),
        login,
        signup,
        logout,
        refreshUser,
        updateProfile,
        sendOtp,
        verifyOtp,
        goPremium,
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
