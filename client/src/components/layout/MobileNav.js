import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useLanguage } from "../../context/LanguageContext";

// Bottom tab bar shown only on small screens (md:hidden).
const MobileNav = () => {
  const { t } = useLanguage();

  const tabs = [
    { to: "/home", icon: "mdi:home", label: t("home") },
    { to: "/search", icon: "mdi:magnify", label: t("search") },
    { to: "/library", icon: "mdi:library-shelves", label: t("yourLibrary") },
    { to: "/liked", icon: "mdi:heart", label: t("likedSongs") },
    { to: "/mood", icon: "mdi:emoticon-happy-outline", label: t("checkMood") },
  ];

  return (
    <nav className="md:hidden shrink-0 bg-ink-900 border-t border-ink-800 flex items-stretch">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold truncate ${
              isActive ? "text-white" : "text-ink-500"
            }`
          }
        >
          <Icon icon={tab.icon} width={22} />
          <span className="max-w-full truncate px-1">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
