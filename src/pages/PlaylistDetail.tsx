import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Music2,
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  ListMusic,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import SongRow from "@/components/SongRow";
import { api, Playlist, Song } from "@/lib/api";

const PlaylistDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const playlistName = (location.state as { name?: string } | null)?.name;

  const {
    currentSong,
    isPlaying,
    shuffle,
    playSong,
    pauseSong,
    togglePlayList,
    setShuffle,
  } = useMusicPlayer();

  const queryClient = useQueryClient();

  // Playlist name comes from the shared playlists cache (the source of truth
  // that refreshes on rename), falling back to the nav state, then a label.
  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => api.getPlaylists(),
    staleTime: 5 * 60 * 1000,
  });
  const displayedName =
    playlists.find((p) => p.id === Number(id))?.playlist_name ||
    playlistName ||
    "Playlist";

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const openRename = () => {
    setRenameValue(displayedName === "Playlist" ? "" : displayedName);
    setRenameOpen(true);
  };

  const handleRename = async () => {
    const name = renameValue.trim();
    if (name.length < 3) {
      toast.error("Playlist name must be at least 3 characters");
      return;
    }
    if (!id) return;

    setActionLoading(true);
    try {
      await api.updatePlaylist(Number(id), name);
      toast.success("Playlist renamed");
      setRenameOpen(false);
      // Update the cached name immediately, then refresh from the server.
      queryClient.setQueryData<Playlist[]>(["playlists"], (old) =>
        old
          ? old.map((p) =>
              p.id === Number(id) ? { ...p, playlist_name: name } : p
            )
          : old
      );
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    } catch (err) {
      if (!(err as any)?.isRateLimit)
        toast.error(
          err instanceof Error ? err.message : "Failed to rename playlist"
        );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      await api.deletePlaylist(Number(id));
      toast.success("Playlist deleted");
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      navigate("/player");
    } catch (err) {
      if (!(err as any)?.isRateLimit)
        toast.error(
          err instanceof Error ? err.message : "Failed to delete playlist"
        );
      setActionLoading(false);
    }
  };

  const loadSongs = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlaylistSongs(Number(id));
      setSongs(data);
    } catch (err) {
      if (!(err as any)?.isRateLimit) {
        setError(
          err instanceof Error ? err.message : "Failed to load playlist"
        );
        toast.error("Failed to load playlist");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const handleRowClick = (song: Song) => {
    const isCurrent = currentSong?.id === song.id;
    if (isCurrent && isPlaying) {
      pauseSong(song);
    } else {
      playSong(song, songs);
    }
  };

  // Is a track from THIS playlist currently playing?
  const playlistPlaying =
    isPlaying && currentSong && songs.some((s) => s.id === currentSong.id);

  return (
    <div className="min-h-screen pattern-bg pb-32 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/player"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Music2 className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">
                MusiquePeulh
              </span>
            </Link>

            <Button
              variant="outline"
              onClick={() => navigate("/player")}
              className="border-primary/30 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1
            className={`${
              displayedName.length > 60
                ? "text-lg"
                : displayedName.length > 40
                ? "text-xl"
                : displayedName.length > 24
                ? "text-2xl"
                : "text-3xl"
            } font-bold mb-2 capitalize break-words`}
          >
            {displayedName}
          </h1>
          <p className="text-muted-foreground">Playlist</p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => togglePlayList(songs)}
            disabled={songs.length === 0}
            size="icon"
            className="w-12 h-12 rounded-full hero-gradient text-primary-foreground hover:scale-105 transition-transform border-0 shadow-lg"
            title={playlistPlaying ? "Pause" : "Play playlist"}
          >
            {playlistPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShuffle(!shuffle)}
            aria-pressed={shuffle}
            title={shuffle ? "Shuffle on" : "Shuffle off"}
            className={shuffle ? "text-primary" : "text-muted-foreground"}
          >
            <Shuffle className="w-5 h-5" />
          </Button>

          {/* Playlist options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Playlist options"
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={openRename}>
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading playlist...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 card-gradient rounded-xl border border-border">
            <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">Couldn't load playlist</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 card-gradient rounded-xl border border-border">
            <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No songs yet</p>
            <p className="text-muted-foreground">
              This playlist doesn't have any songs.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card/50 overflow-hidden w-full">
            {/* Song rows */}
            {songs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                isActive={currentSong?.id === song.id}
                isPlaying={isPlaying}
                onClick={() => handleRowClick(song)}
                playlistId={Number(id)}
                onRemoved={loadSongs}
              />
            ))}
          </div>
        )}
      </main>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[85dvh] overflow-y-auto top-24 translate-y-0 sm:top-1/2 sm:-translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="rename_playlist">Playlist name</Label>
            <Input
              id="rename_playlist"
              placeholder="Playlist name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
              autoFocus
              className="bg-background/50"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={actionLoading || renameValue.trim().length < 3}
              className="hero-gradient text-primary-foreground hover:opacity-90"
            >
              {actionLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{displayedName}". This action can't
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlaylistDetail;
