import { createContext, useCallback, useContext, useState } from "react";
import { Icon } from "@iconify/react";

const ToastContext = createContext(null);

const ICONS = {
  success: "mdi:check-circle",
  error: "mdi:alert-circle",
  info: "mdi:information",
};

const STYLES = {
  success: "border-brand/40 text-brand",
  error: "border-red-500/40 text-red-400",
  info: "border-accent/40 text-accent",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  const push = useCallback(
    (message, type) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 3800);
    },
    [remove]
  );

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 bg-ink-800/95 backdrop-blur border ${
              STYLES[t.type]
            } rounded-xl px-4 py-3 shadow-2xl animate-fade-in`}
          >
            <Icon icon={ICONS[t.type]} width={20} />
            <span className="text-sm text-white flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-ink-500 hover:text-white"
              aria-label="Dismiss notification"
            >
              <Icon icon="mdi:close" width={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};
