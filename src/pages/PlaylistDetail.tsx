import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { Music2, ArrowLeft, Play, Pause, Shuffle, ListMusic } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import SongRow from "@/components/SongRow";
import { api, Song } from "@/lib/api";

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

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <h1 className="text-3xl font-bold mb-2 capitalize">
            {playlistName || "Playlist"}
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PlaylistDetail;
