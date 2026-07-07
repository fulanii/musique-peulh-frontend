import { useNavigate, Link } from "react-router-dom";
import { Music2, ArrowLeft, Play, Pause, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import SongRow from "@/components/SongRow";
import { Song } from "@/lib/api";

const AllSongs = () => {
  const navigate = useNavigate();
  const {
    songs,
    loading,
    currentSong,
    isPlaying,
    shuffle,
    playSong,
    pauseSong,
    togglePlayAll,
    setShuffle,
  } = useMusicPlayer();

  const handleRowClick = (song: Song) => {
    const isCurrent = currentSong?.id === song.id;
    if (isCurrent && isPlaying) {
      pauseSong(song);
    } else {
      playSong(song, songs);
    }
  };

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
          <h1 className="text-3xl font-bold mb-2">All Songs</h1>
          <p className="text-muted-foreground">Browse the full library</p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={togglePlayAll}
            disabled={songs.length === 0}
            size="icon"
            className="w-12 h-12 rounded-full hero-gradient text-primary-foreground hover:scale-105 transition-transform border-0 shadow-lg"
            title={currentSong && isPlaying ? "Pause" : "Play all"}
          >
            {currentSong && isPlaying ? (
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
            <p className="text-muted-foreground">Loading songs...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 card-gradient rounded-xl border border-border">
            <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No songs yet</p>
            <p className="text-muted-foreground">
              Check back soon for new music!
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

export default AllSongs;
