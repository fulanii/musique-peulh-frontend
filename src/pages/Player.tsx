import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api, Song } from '@/lib/api';
import { toast } from 'sonner';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import Footer from '@/components/Footer';

const Player = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const data = await api.getSongs();
      setSongs(data);
    } catch (error) {
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
  };

  const handleNext = () => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[prevIndex]);
  };

  return (
    <div className="min-h-screen pattern-bg pb-32 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music2 className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">MusiquePeulh</span>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-destructive/30 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Music Library</h1>
          <p className="text-muted-foreground">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} available
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading songs...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 card-gradient rounded-xl border border-border">
            <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">No songs yet</p>
            <p className="text-muted-foreground">Check back soon for new music!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {songs.map((song) => (
              <SongCard 
                key={song.id} 
                song={song} 
                onPlay={() => handlePlaySong(song)}
                isPlaying={currentSong?.id === song.id}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Music Player */}
      {currentSong && (
        <MusicPlayer 
          song={currentSong}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
};

export default Player;
