import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import { UIProvider } from "./context/UIContext";
import { SettingsProvider } from "./context/SettingsContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import Spinner from "./components/shared/Spinner";
import ErrorBoundary from "./components/shared/ErrorBoundary";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import MyMusic from "./pages/MyMusic";
import LikedSongs from "./pages/LikedSongs";
import UploadSong from "./pages/UploadSong";
import PlaylistView from "./pages/PlaylistView";
import Mood from "./pages/Mood";
import Profile from "./pages/Profile";
import Premium from "./pages/Premium";
import Checkout from "./pages/Checkout";
import Settings from "./pages/Settings";
import Artist from "./pages/Artist";
import Album from "./pages/Album";
import CreateAlbum from "./pages/CreateAlbum";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/playlist/:playlistId" element={<PlaylistView />} />
          <Route path="/artist/:name" element={<Artist />} />
          <Route path="/album/create" element={<CreateAlbum />} />
          <Route path="/album/:albumId" element={<Album />} />
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
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <LanguageProvider>
            <AuthProvider>
              <SettingsProvider>
                <PlayerProvider>
                  <UIProvider>
                    <AppRoutes />
                  </UIProvider>
                </PlayerProvider>
              </SettingsProvider>
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
