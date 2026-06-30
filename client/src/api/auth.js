import { api } from "./client";

export const login = (identifier, password) =>
  api.post("/auth/login", { identifier, password }, { auth: false });

export const register = (payload) =>
  api.post("/auth/register", payload, { auth: false });

export const getMe = () => api.get("/auth/me");

export const logout = () => api.post("/auth/logout", {}, { auth: false });

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email }, { auth: false });

export const resetPassword = (email, code, newPassword) =>
  api.post(
    "/auth/reset-password",
    { email, code, newPassword },
    { auth: false }
  );

export const updateProfile = (payload) => api.patch("/auth/me", payload);

export const sendOtp = (channel) => api.post("/auth/otp/send", { channel });

export const verifyOtp = (channel, code) =>
  api.post("/auth/otp/verify", { channel, code });

export const goPremium = () => api.post("/auth/premium");
