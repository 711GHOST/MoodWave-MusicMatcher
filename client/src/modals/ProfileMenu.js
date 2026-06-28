import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

const ProfileMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stop } = usePlayer();

  const handleLogout = () => {
    stop();
    logout();
    onClose();
    navigate("/welcome");
  };

  const Item = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-ink-400 hover:text-white hover:bg-ink-700 rounded-md transition text-left"
    >
      <Icon icon={icon} width={18} /> {label}
    </button>
  );

  return (
    <div className="absolute right-0 top-12 w-56 bg-ink-800 border border-ink-700 rounded-xl shadow-2xl p-2 z-30 animate-scale-in">
      <div className="px-3 py-2 border-b border-ink-700 mb-1">
        <div className="text-white font-semibold text-sm truncate">
          {user?.firstName} {user?.lastName}
        </div>
        <div className="text-ink-500 text-xs truncate">{user?.email}</div>
      </div>
      <Item icon="mdi:account-outline" label="Profile" onClick={onClose} />
      <Item icon="mdi:cog-outline" label="Settings" onClick={onClose} />
      <Item icon="mdi:crown-outline" label="Upgrade to Premium" onClick={onClose} />
      <div className="border-t border-ink-700 my-1" />
      <Item icon="mdi:logout" label="Log out" onClick={handleLogout} />
    </div>
  );
};

export default ProfileMenu;
