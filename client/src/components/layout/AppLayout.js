import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import PlayerBar from "../player/PlayerBar";
import NowPlayingPanel from "../player/NowPlayingPanel";
import MobileNowPlaying from "../player/MobileNowPlaying";
import WelcomeModal from "../../modals/WelcomeModal";
import { usePlayer } from "../../context/PlayerContext";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { useSettings } from "../../context/SettingsContext";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";

const AppLayout = () => {
  const { currentSong } = usePlayer();
  const { user, justRegistered, clearJustRegistered } = useAuth();
  const { nowPlayingOpen, openNowPlaying } = useUI();
  const { settings } = useSettings();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const prevSongId = useRef(null);

  // Global player keyboard shortcuts (space, arrows, m).
  useKeyboardShortcuts();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // "Show the now-playing panel on click of play" — open the panel when
  // playback starts (a fresh session: no song -> song) if the setting is on.
  useEffect(() => {
    const id = currentSong?._id || null;
    if (
      id &&
      prevSongId.current === null &&
      settings.showNowPlayingPanel
    ) {
      openNowPlaying();
    }
    prevSongId.current = id;
  }, [currentSong, settings.showNowPlayingPanel, openNowPlaying]);

  return (
    <div className="h-full w-full flex flex-col bg-ink-950">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col bg-gradient-to-b from-ink-850 to-ink-950 md:m-2 md:rounded-xl overflow-hidden">
          <Topbar onMenu={() => setMobileNavOpen(true)} />
          <main className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 pb-10">
            <Outlet />
          </main>
        </div>
        {currentSong && nowPlayingOpen && <NowPlayingPanel />}
      </div>
      {currentSong && <PlayerBar />}
      {/* Full-screen now-playing sheet — mobile only */}
      <MobileNowPlaying />
      {/* Bottom tab bar — mobile only */}
      <MobileNav />
      {/* First-time welcome */}
      {justRegistered && (
        <WelcomeModal name={user?.firstName} onClose={clearJustRegistered} />
      )}
    </div>
  );
};

export default AppLayout;
