import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import { UIProvider } from "./context/UIContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import Spinner from "./components/shared/Spinner";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import MyMusic from "./pages/MyMusic";
import LikedSongs from "./pages/LikedSongs";
import UploadSong from "./pages/UploadSong";
import PlaylistView from "./pages/PlaylistView";
import Mood from "./pages/Mood";

function AppRoutes() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-ink-950">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public (redirect to /home when already signed in) */}
      <Route element={<PublicRoute />}>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Protected app shell with a persistent player */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/my-music" element={<MyMusic />} />
          <Route path="/liked" element={<LikedSongs />} />
          <Route path="/upload" element={<UploadSong />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/playlist/:playlistId" element={<PlaylistView />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/home" : "/welcome"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <ToastProvider>
          <LanguageProvider>
            <AuthProvider>
              <PlayerProvider>
                <UIProvider>
                  <AppRoutes />
                </UIProvider>
              </PlayerProvider>
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;
