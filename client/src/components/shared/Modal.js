import { useEffect } from "react";
import { Icon } from "@iconify/react";

const Modal = ({
  title,
  subtitle,
  onClose,
  children,
  widthClass = "w-full max-w-md",
}) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-ink-850 border border-ink-700 rounded-2xl shadow-2xl ${widthClass} max-h-[88vh] overflow-hidden flex flex-col animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-500 hover:text-white p-1 rounded-full hover:bg-ink-700 transition"
          >
            <Icon icon="mdi:close" width={22} />
          </button>
        </div>
        <div className="px-6 pb-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
