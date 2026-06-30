import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";
import { clearRecentlyPlayed } from "../utils/recentlyPlayed";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // True only right after a fresh sign-up — drives the welcome modal.
  const [justRegistered, setJustRegistered] = useState(false);

  // Restore a session from the httpOnly cookie on first load. If the cookie is
  // missing/expired, /auth/me returns 401 and we stay logged out.
  useEffect(() => {
    authApi
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password) => {
    // The server sets the auth cookie; we just hold the user in memory.
    const data = await authApi.login(identifier, password);
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await authApi.register(payload);
    setUser(data.user);
    if (data.isNewUser) setJustRegistered(true);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {
      /* clear the client session regardless of the network result */
    }
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

  const forgotPassword = (email) => authApi.forgotPassword(email);

  // The server sets a fresh auth cookie on success, so we log straight in.
  const resetPassword = async (email, code, newPassword) => {
    const data = await authApi.resetPassword(email, code, newPassword);
    if (data.user) setUser(data.user);
    return data;
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
        forgotPassword,
        resetPassword,
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
