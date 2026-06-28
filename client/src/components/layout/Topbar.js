import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileMenu from "../../modals/ProfileMenu";

const Topbar = ({ onMenu }) => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = (
    user?.firstName?.[0] ||
    user?.userName?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 md:px-8 py-4 bg-ink-900/60 backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="md:hidden text-ink-300 hover:text-white"
        >
          <Icon icon="mdi:menu" width={26} />
        </button>
        <Link
          to="/mood"
          className="flex items-center gap-2 bg-brand hover:bg-brand-light text-black font-bold text-sm px-4 py-2 rounded-full transition"
        >
          <Icon icon="mdi:emoticon-happy" width={18} />
          <span className="hidden xs:inline">Check Mood</span>
          <span className="xs:hidden">Mood</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <Link
          to="/upload"
          className="hidden sm:block text-sm font-semibold text-ink-500 hover:text-white"
        >
          Upload
        </Link>
        <a
          href="#premium"
          className="hidden md:block text-sm font-semibold text-ink-500 hover:text-white"
        >
          Premium
        </a>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 rounded-full bg-accent text-white font-bold flex items-center justify-center hover:ring-2 ring-white/40 transition"
            aria-label="Account menu"
          >
            {initials}
          </button>
          {menuOpen && <ProfileMenu onClose={() => setMenuOpen(false)} />}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
