import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, Song } from "@/lib/api";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";

interface MusicPlayerContextType {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  shuffle: boolean;
  playAllActive: boolean;
  loading: boolean;
  playSong: (song: Song, list?: Song[]) => void;
  pauseSong: (song: Song) => void;
  playList: (list: Song[]) => void;
  togglePlayList: (list: Song[]) => void;
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
  const { isAuthenticated } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [playAllActive, setPlayAllActive] = useState(false);
  const [loading, setLoading] = useState(true);
  // The list the player advances through (a playlist or the full library).
  const [queue, setQueue] = useState<Song[]>([]);

  const loadSongs = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.getSongs();
      setSongs(data);
    } catch (error) {
      if (!(error as any)?.isRateLimit) toast.error("Failed to load songs");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load songs when authenticated state changes
  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  // The active playback list — the queue if one was set, else the full library.
  const activeList = () => (queue.length > 0 ? queue : songs);

  const playSong = (song: Song, list?: Song[]) => {
    // playing a single song should exit "Play All" mode
    setPlayAllActive(false);
    // scope subsequent next/previous to the list this song came from
    setQueue(list && list.length ? list : [song]);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const pauseSong = (song: Song) => {
    // keep the current song selected but mark as paused
    if (currentSong?.id === song.id) {
      setIsPlaying(false);
    }
  };

  // Start playing a whole list from the top (or a random track if shuffling).
  const playList = (list: Song[]) => {
    if (list.length === 0) return;
    setQueue(list);
    setPlayAllActive(true);
    const start = shuffle
      ? list[Math.floor(Math.random() * list.length)]
      : list[0];
    setCurrentSong(start);
    setIsPlaying(true);
  };

  // Play/pause a list: if a track from it is current, toggle; otherwise start it.
  const togglePlayList = (list: Song[]) => {
    if (list.length === 0) return;
    const currentInList =
      currentSong && list.some((s) => s.id === currentSong.id);
    if (currentInList) {
      setQueue(list);
      setIsPlaying(!isPlaying);
      setPlayAllActive(!isPlaying);
      return;
    }
    playList(list);
  };

  const next = () => {
    const list = activeList();
    if (!currentSong || list.length === 0) return;

    if (shuffle) {
      // pick a random different song
      if (list.length === 1) return;
      let idx = Math.floor(Math.random() * list.length);
      while (list[idx].id === currentSong.id) {
        idx = Math.floor(Math.random() * list.length);
      }
      setCurrentSong(list[idx]);
      setIsPlaying(true);
      return;
    }

    const currentIndex = list.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % list.length;
    setCurrentSong(list[nextIndex]);
    setIsPlaying(true);
  };

  const previous = () => {
    const list = activeList();
    if (!currentSong || list.length === 0) return;
    const currentIndex = list.findIndex((s) => s.id === currentSong.id);
    const prevIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
    setCurrentSong(list[prevIndex]);
    setIsPlaying(true);
  };

  // Convenience for the full library ("All Songs").
  const togglePlayAll = () => togglePlayList(songs);

  const handleSetShuffle = (newShuffle: boolean) => {
    setShuffle(newShuffle);
    toast(newShuffle ? t("shuffle_on") : t("shuffle_off"));
  };

  const clearPlayer = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    setPlayAllActive(false);
    setQueue([]);
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
        playList,
        togglePlayList,
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
