import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Music2,
  LogOut,
  Settings,
  MessageSquare,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  ListMusic,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import MobileMenu from "@/components/MobileMenu";
import { api } from "@/lib/api";

type PlaylistView = "card" | "row";

const Player = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const queryClient = useQueryClient();
  const [view, setView] = useState<PlaylistView>(() => {
    const saved = localStorage.getItem("playlist_view");
    return saved === "row" || saved === "card" ? saved : "card";
  });

  // Remember the user's card/row layout preference
  useEffect(() => {
    localStorage.setItem("playlist_view", view);
  }, [view]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Cached across navigation — remounting the page reuses the data instead of
  // showing "Loading playlists" every time.
  const {
    data: playlists = [],
    isLoading: loadingPlaylists,
    isError,
    error: playlistsError,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => api.getPlaylists(),
    staleTime: 5 * 60 * 1000, // treat as fresh for 5 min (no refetch on remount)
    gcTime: 30 * 60 * 1000, // keep in cache for 30 min after leaving the page
  });

  useEffect(() => {
    if (isError && !(playlistsError as any)?.isRateLimit) {
      toast.error("Failed to load playlists");
    }
  }, [isError, playlistsError]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleCreatePlaylist = async () => {
    const name = newName.trim();
    if (name.length < 3) {
      toast.error("Playlist name must be at least 3 characters");
      return;
    }

    setCreating(true);
    try {
      await api.createPlaylist(name);
      toast.success("Playlist created");
      setNewName("");
      setCreateOpen(false);
      // Refresh the cached list so the new playlist shows up
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    } catch (error) {
      if (!(error as any)?.isRateLimit)
        toast.error(
          error instanceof Error ? error.message : "Failed to create playlist"
        );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen pattern-bg pb-32 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Music2 className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">
                MusiquePeulh
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Desktop buttons - hidden on small screens */}
              <div className="hidden sm:flex items-center gap-4">
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate("/settings")}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/chat")}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-destructive/30 hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>

              {/* Mobile hamburger - visible on small screens */}
              <div className="sm:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Title + view toggle + create */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Music Library</h1>

          <div className="flex items-center gap-2">
            {/* Card / Row view toggle */}
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setView("card")}
                aria-pressed={view === "card"}
                title="Card view"
                className={`p-2 transition-colors ${
                  view === "card"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("row")}
                aria-pressed={view === "row"}
                title="Row view"
                className={`p-2 transition-colors border-l border-border ${
                  view === "row"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create playlist */}
            <Button
              onClick={() => setCreateOpen(true)}
              className="hero-gradient text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Playlist</span>
            </Button>
          </div>
        </div>

        {view === "card" ? (
          /* Card view - All Songs first, then playlists, wrapping */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-3 sm:gap-4">
            {/* All Songs (a built-in playlist) */}
            <button
              onClick={() => navigate("/songs")}
              className="card-gradient border border-border rounded-xl p-4 text-left transition-colors hover:border-primary/40"
            >
              <div className="w-full aspect-square rounded-lg hero-gradient flex items-center justify-center mb-3">
                <Music2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <p className="font-semibold truncate">All Songs</p>
              <p className="text-xs text-muted-foreground">Full library</p>
            </button>

            {/* User playlists */}
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() =>
                  navigate(`/playlist/${playlist.id}`, {
                    state: { name: playlist.playlist_name },
                  })
                }
                className="card-gradient border border-border rounded-xl p-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="w-full aspect-square rounded-lg hero-gradient flex items-center justify-center mb-3">
                  <ListMusic className="w-10 h-10 text-primary-foreground" />
                </div>
                <p className="font-semibold truncate capitalize">
                  {playlist.playlist_name}
                </p>
                <p className="text-xs text-muted-foreground">Playlist</p>
              </button>
            ))}
          </div>
        ) : (
          /* Row view - All Songs first, then playlists */
          <div className="rounded-lg border border-border bg-card/50 overflow-hidden w-full">
            <button
              onClick={() => navigate("/songs")}
              className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-border/50 last:border-0 transition-colors hover:bg-muted/60"
            >
              <div className="w-10 h-10 rounded hero-gradient flex items-center justify-center flex-shrink-0">
                <Music2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-medium truncate">All Songs</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto flex-shrink-0" />
            </button>

            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() =>
                  navigate(`/playlist/${playlist.id}`, {
                    state: { name: playlist.playlist_name },
                  })
                }
                className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-border/50 last:border-0 transition-colors hover:bg-muted/60"
              >
                <div className="w-10 h-10 rounded hero-gradient flex items-center justify-center flex-shrink-0">
                  <ListMusic className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-medium truncate capitalize">
                  {playlist.playlist_name}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {loadingPlaylists && (
          <p className="text-muted-foreground text-sm mt-4">
            Loading playlists...
          </p>
        )}
      </main>

      {/* Create playlist dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[85dvh] overflow-y-auto top-24 translate-y-0 sm:top-1/2 sm:-translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Create Playlist</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="playlist_name">Playlist name</Label>
            <Input
              id="playlist_name"
              placeholder="My playlist"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreatePlaylist();
              }}
              autoFocus
              className="bg-background/50"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={creating || newName.trim().length < 3}
              className="hero-gradient text-primary-foreground hover:opacity-90"
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Player;
