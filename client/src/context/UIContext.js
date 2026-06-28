import { createContext, useContext, useState } from "react";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import LanguageModal from "../modals/LanguageModal";

const UIContext = createContext(null);

// Owns the app-wide modals so any component can open them without prop drilling.
export function UIProvider({ children }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [addState, setAddState] = useState({ open: false, songId: null });

  const value = {
    openCreatePlaylist: () => setCreateOpen(true),
    openLanguage: () => setLanguageOpen(true),
    openAddToPlaylist: (songId) => setAddState({ open: true, songId }),
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      {createOpen && (
        <CreatePlaylistModal onClose={() => setCreateOpen(false)} />
      )}
      {languageOpen && <LanguageModal onClose={() => setLanguageOpen(false)} />}
      {addState.open && (
        <AddToPlaylistModal
          songId={addState.songId}
          onClose={() => setAddState({ open: false, songId: null })}
        />
      )}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within a UIProvider");
  return ctx;
};
