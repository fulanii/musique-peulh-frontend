import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, Song } from "@/lib/api";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

interface MusicPlayerContextType {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  shuffle: boolean;
  playAllActive: boolean;
  loading: boolean;
  playSong: (song: Song) => void;
  pauseSong: (song: Song) => void;
  next: () => void;
  previous: () => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlayAll: () => void;
  setShuffle: (shuffle: boolean) => void;
  loadSongs: () => Promise<void>;
  clearPlayer: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const MusicPlayerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [playAllActive, setPlayAllActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSongs = async () => {
    try {
      const data = await api.getSongs();
      setSongs(data);
    } catch (error) {
      toast.error(t("download_error") || "Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const playSong = (song: Song) => {
    // playing a single song should exit "Play All" mode
    setPlayAllActive(false);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const pauseSong = (song: Song) => {
    // keep the current song selected but mark as paused
    if (currentSong?.id === song.id) {
      setIsPlaying(false);
    }
  };

  const next = () => {
    if (!currentSong || songs.length === 0) return;

    if (shuffle) {
      // pick a random different song
      if (songs.length === 1) return;
      let idx = Math.floor(Math.random() * songs.length);
      while (songs[idx].id === currentSong.id) {
        idx = Math.floor(Math.random() * songs.length);
      }
      setCurrentSong(songs[idx]);
      setIsPlaying(true);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const previous = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlayAll = () => {
    if (songs.length === 0) return;
    
    // If there's a current song playing, toggle pause/play
    if (currentSong) {
      if (isPlaying) {
        // pause
        setIsPlaying(false);
        setPlayAllActive(false);
      } else {
        // resume/play
        setIsPlaying(true);
        setPlayAllActive(true);
      }
      return;
    }

    // No current song - start play-all
    setPlayAllActive(true);
    // pick first or random based on shuffle
    if (shuffle) {
      const idx = Math.floor(Math.random() * songs.length);
      setCurrentSong(songs[idx]);
    } else {
      setCurrentSong(songs[0]);
    }
    setIsPlaying(true);
  };

  const handleSetShuffle = (newShuffle: boolean) => {
    setShuffle(newShuffle);
    toast(newShuffle ? t("shuffle_on") : t("shuffle_off"));
  };

  const clearPlayer = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    setPlayAllActive(false);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        songs,
        currentSong,
        isPlaying,
        shuffle,
        playAllActive,
        loading,
        playSong,
        pauseSong,
        next,
        previous,
        setIsPlaying,
        togglePlayAll,
        setShuffle: handleSetShuffle,
        loadSongs,
        clearPlayer,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
};

