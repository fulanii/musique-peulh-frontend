import { useNavigate, Link } from "react-router-dom";
import {
  Music2,
  LogOut,
  Settings,
  Menu,
  Play,
  Pause,
  Shuffle,
  MessageSquare,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import MobileMenu from "@/components/MobileMenu";
import SongCard from "@/components/SongCard";
import Footer from "@/components/Footer";
import { Song } from "@/lib/api";

const Player = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const {
    songs,
    loading,
    currentSong,
    isPlaying,
    shuffle,
    playAllActive,
    playSong,
    pauseSong,
    togglePlayAll,
    setShuffle,
  } = useMusicPlayer();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handlePlaySong = (song: Song) => {
    playSong(song);
  };

  const handlePause = (song: Song) => {
    pauseSong(song);
  };

  const handlePlayAllToggle = () => {
    togglePlayAll();
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
              <div className="hidden sm:flex items-center gap-2">
                {/* Play All button: shows Play or Pause depending on playback state */}
                <Button
                  variant="ghost"
                  onClick={handlePlayAllToggle}
                  className="flex items-center gap-2"
                  title={currentSong && isPlaying ? "Pause" : "Play All"}
                >
                  {currentSong && isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                {/* Shuffle toggle as an icon button */}
                <Button
                  variant="ghost"
                  onClick={() => setShuffle(!shuffle)}
                  className={`flex items-center gap-2 ${
                    shuffle ? "text-primary" : ""
                  }`}
                  aria-pressed={shuffle}
                  title={shuffle ? "Shuffle On" : "Shuffle Off"}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Music Library</h1>
          <p className="text-muted-foreground">
            {t("songs_available", {
              count: songs.length,
              plural:
                songs.length === 1 ? t("song_singular") : t("song_plural"),
            })}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Play All button (considers shuffle when starting) */}
              <Button
                variant="ghost"
                onClick={handlePlayAllToggle}
                className="flex items-center gap-2"
                aria-pressed={currentSong && isPlaying}
                title={currentSong && isPlaying ? "Pause" : "Play All"}
              >
                {currentSong && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* offline mode removed */}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShuffle(!shuffle)}
                title={shuffle ? "Shuffle On" : "Shuffle Off"}
                className={shuffle ? "text-primary" : ""}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
          // old css: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
          <div className="flex flex-row flex-wrap justify-center gap-6">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => handlePlaySong(song)}
                onPause={() => handlePause(song)}
                isPlaying={currentSong?.id === song.id && isPlaying}
                isActive={currentSong?.id === song.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* <Footer /> */}
    </div>
  );
};

export default Player;
