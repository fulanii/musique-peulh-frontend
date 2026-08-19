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

// Fisher-Yates. `first`, when given, is pinned to the head so turning shuffle on
// (or shuffling a list that's already playing) never cuts off the current track.
const shuffled = (list: Song[], first?: Song | null): Song[] => {
  const rest = first ? list.filter((s) => s.id !== first.id) : [...list];
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first && list.some((s) => s.id === first.id) ? [first, ...rest] : rest;
};

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
  // A permutation of the active list. Playback walks it in order, so each song
  // plays exactly once per cycle instead of being drawn at random every skip.
  const [shuffleOrder, setShuffleOrder] = useState<Song[]>([]);

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

  // The order playback follows. The stored permutation is rebuilt on the fly if
  // it has drifted from the active list (library finished loading, playlist
  // edited) so we never advance through a stale or partial cycle.
  const playbackOrder = (list: Song[], current: Song | null) => {
    if (!shuffle) return list;
    const matchesList =
      shuffleOrder.length === list.length &&
      shuffleOrder.every((s) => list.some((l) => l.id === s.id));
    const holdsCurrent =
      !current || shuffleOrder.some((s) => s.id === current.id);
    if (matchesList && holdsCurrent) return shuffleOrder;
    const rebuilt = shuffled(list, current);
    setShuffleOrder(rebuilt);
    return rebuilt;
  };

  const playSong = (song: Song, list?: Song[]) => {
    // playing a single song should exit "Play All" mode
    setPlayAllActive(false);
    // scope subsequent next/previous to the list this song came from
    const scope = list && list.length ? list : [song];
    setQueue(scope);
    setShuffleOrder(shuffle ? shuffled(scope, song) : []);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const pauseSong = (song: Song) => {
    // keep the current song selected but mark as paused
    if (currentSong?.id === song.id) {
      setIsPlaying(false);
    }
  };

  // Start playing a whole list from the top (or the top of a fresh shuffle).
  const playList = (list: Song[]) => {
    if (list.length === 0) return;
    setQueue(list);
    setPlayAllActive(true);
    const order = shuffle ? shuffled(list) : list;
    setShuffleOrder(shuffle ? order : []);
    setCurrentSong(order[0]);
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

    const order = playbackOrder(list, currentSong);
    const currentIndex = order.findIndex((s) => s.id === currentSong.id);

    if (currentIndex < order.length - 1) {
      setCurrentSong(order[currentIndex + 1]);
      setIsPlaying(true);
      return;
    }

    // End of the cycle — every song has now played once.
    if (shuffle) {
      // Reshuffle for the next pass, and don't open it with the track that just
      // finished, which would be an audible repeat across the seam.
      let reshuffled = shuffled(list);
      if (reshuffled.length > 1 && reshuffled[0].id === currentSong.id) {
        reshuffled = [...reshuffled.slice(1), reshuffled[0]];
      }
      setShuffleOrder(reshuffled);
      setCurrentSong(reshuffled[0]);
      setIsPlaying(true);
      return;
    }

    setCurrentSong(order[0]);
    setIsPlaying(true);
  };

  const previous = () => {
    const list = activeList();
    if (!currentSong || list.length === 0) return;
    const order = playbackOrder(list, currentSong);
    const currentIndex = order.findIndex((s) => s.id === currentSong.id);
    const prevIndex = currentIndex <= 0 ? order.length - 1 : currentIndex - 1;
    setCurrentSong(order[prevIndex]);
    setIsPlaying(true);
  };

  // Convenience for the full library ("All Songs").
  const togglePlayAll = () => togglePlayList(songs);

  const handleSetShuffle = (newShuffle: boolean) => {
    setShuffle(newShuffle);
    // Start a fresh cycle, keeping the current track at the head so flipping
    // shuffle on doesn't interrupt what's playing.
    setShuffleOrder(newShuffle ? shuffled(activeList(), currentSong) : []);
    toast(newShuffle ? t("shuffle_on") : t("shuffle_off"));
  };

  // Stable identity: consumers put this in effect deps, so recreating it each
  // render would re-trigger those effects endlessly.
  const clearPlayer = useCallback(() => {
    setCurrentSong(null);
    setIsPlaying(false);
    setPlayAllActive(false);
    // keep the same array when already empty so React can bail out of the update
    setQueue((q) => (q.length === 0 ? q : []));
    setShuffleOrder((o) => (o.length === 0 ? o : []));
  }, []);

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
