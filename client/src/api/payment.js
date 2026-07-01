import { api } from "./client";

export const getPaymentConfig = () => api.get("/payment/config");
export const createOrder = (currency) =>
  api.post("/payment/order", { currency });
export const verifyPayment = (payload) => api.post("/payment/verify", payload);
export const confirmDemo = (payload) =>
  api.post("/payment/confirm-demo", payload);
export const removeSavedCard = () => api.del("/payment/saved-card");
export const cancelSubscription = () => api.post("/payment/cancel");
