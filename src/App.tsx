import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MusicPlayerProvider, useMusicPlayer } from "@/contexts/MusicPlayerContext";
import MusicPlayer from "@/components/MusicPlayer";
import Landing from "./pages/Landing";
import ComingSoon from "./pages/ComingSoon";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import ResetRequest from "./pages/ResetRequest";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Player from "./pages/Player";
import AllSongs from "./pages/AllSongs";
import PlaylistDetail from "./pages/PlaylistDetail";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

// ─── Toggle coming soon mode ──────────────────────────────────────────────────
// Set to `true` to show the Coming Soon page for ALL routes.
// Set to `false` to restore normal site navigation.
const COMING_SOON = false;
// ─────────────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/player" replace />;
  }

  return <>{children}</>;
};

// Redirect already-authenticated users away from auth pages (login/register)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={"/player"} replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const { currentSong, isPlaying, setIsPlaying, next, previous, clearPlayer } = useMusicPlayer();

  // Clear player when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearPlayer();
    }
  }, [isAuthenticated, clearPlayer]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {COMING_SOON ? (
            // All routes redirect to the Coming Soon page
            <Route path="*" element={<ComingSoon />} />
          ) : (
            <>
              <Route path="/" element={<Landing />} />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route path="/reset-request" element={<ResetRequest />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/player"
                element={
                  <ProtectedRoute>
                    <Player />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/songs"
                element={
                  <ProtectedRoute>
                    <AllSongs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/playlist/:id"
                element={
                  <ProtectedRoute>
                    <PlaylistDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
      
      {/* Global Music Player - persists across all pages */}
      {currentSong && (
        <MusicPlayer
          song={currentSong}
          onNext={next}
          onPrevious={previous}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MusicPlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </MusicPlayerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
