import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import Brand from "../shared/Brand";
import { useUI } from "../../context/UIContext";
import { useLanguage } from "../../context/LanguageContext";

const NavRow = ({ icon, label, to, active, onClick }) => {
  const inner = (
    <div
      className={`flex items-center gap-4 px-3 py-2 rounded-md cursor-pointer transition ${
        active ? "text-white" : "text-ink-500 hover:text-white"
      }`}
    >
      <Icon icon={icon} width={24} />
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
  return to ? (
    <Link to={to} onClick={onClick}>
      {inner}
    </Link>
  ) : (
    <div onClick={onClick}>{inner}</div>
  );
};

// Shared nav markup used by both the desktop sidebar and the mobile drawer.
const SidebarContent = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const { openCreatePlaylist, openLanguage } = useUI();
  const { t, language } = useLanguage();
  const go = onNavigate || (() => {});

  return (
    <>
      <div className="bg-ink-850 rounded-xl p-4">
        <Link to="/home" onClick={go} className="flex items-center gap-2 px-1 pb-4">
          <Brand />
        </Link>
        <nav className="flex flex-col gap-1">
          <NavRow icon="mdi:home" label={t("home")} to="/home" active={pathname === "/home"} onClick={go} />
          <NavRow icon="mdi:magnify" label={t("search")} to="/search" active={pathname === "/search"} onClick={go} />
          <NavRow icon="mdi:library-shelves" label={t("yourLibrary")} to="/library" active={pathname === "/library"} onClick={go} />
          <NavRow icon="mdi:music-box-multiple" label={t("myMusic")} to="/my-music" active={pathname === "/my-music"} onClick={go} />
        </nav>
      </div>

      <div className="bg-ink-850 rounded-xl p-4 flex-1 flex flex-col gap-1 min-h-0">
        <NavRow icon="mdi:plus-box" label={t("createPlaylist")} onClick={() => { openCreatePlaylist(); go(); }} />
        <NavRow icon="mdi:heart" label={t("likedSongs")} to="/liked" active={pathname === "/liked"} onClick={go} />
        <NavRow icon="mdi:emoticon-happy-outline" label={t("checkMood")} to="/mood" active={pathname === "/mood"} onClick={go} />
        <NavRow icon="mdi:cloud-upload" label={t("uploadSong")} to="/upload" active={pathname === "/upload"} onClick={go} />
        <NavRow icon="mdi:account-circle" label={t("profile")} to="/profile" active={pathname === "/profile"} onClick={go} />
        <NavRow icon="mdi:crown" label={t("premium")} to="/premium" active={pathname === "/premium"} onClick={go} />
        <NavRow icon="mdi:cog" label={t("settings")} to="/settings" active={pathname === "/settings"} onClick={go} />

        <div className="mt-auto pt-4">
          <button
            onClick={() => { openLanguage(); go(); }}
            className="flex items-center gap-2 text-ink-500 hover:text-white border border-ink-700 hover:border-ink-500 rounded-full px-3 py-1.5 text-sm font-semibold transition"
          >
            <Icon icon="mdi:web" width={18} /> {language}
          </button>
        </div>
      </div>
    </>
  );
};

const Sidebar = ({ mobileOpen, onClose }) => (
  <>
    {/* Desktop sidebar */}
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-ink-950 p-2 gap-2">
      <SidebarContent />
    </aside>

    {/* Mobile slide-in drawer */}
    <div className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute left-0 top-0 h-full w-72 max-w-[85%] bg-ink-950 p-2 flex flex-col gap-2 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end px-2 pt-1">
          <button onClick={onClose} aria-label="Close menu" className="text-ink-400 hover:text-white">
            <Icon icon="mdi:close" width={24} />
          </button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  </>
);

export default Sidebar;
