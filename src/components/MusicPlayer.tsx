import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { api, Song } from "@/lib/api";
import { getDefaultCover } from "@/lib/defaultCover";

interface MusicPlayerProps {
  song: Song;
  onNext: () => void;
  onPrevious: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MusicPlayer = ({
  song,
  onNext,
  onPrevious,
  isPlaying,
  setIsPlaying,
}: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [audioSrc, setAudioSrc] = useState<string>("");
  const lastPrevClick = useRef<number | null>(null);
  const PREV_DOUBLE_CLICK_MS = 1200; // timeframe to go to previous track

  // Presigned-URL recovery: if the audio 403s (URL expired), refetch and resume.
  const recoveringRef = useRef(false);
  const resumePositionRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const MAX_STREAM_RETRIES = 2;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    // Reset time when a new song is selected
    setCurrentTime(0);
    // Fresh song → reset stream-retry budget and any pending resume position
    retryCountRef.current = 0;
    resumePositionRef.current = null;

    // Fetch a fresh short-lived pre-signed streaming URL for this song.
    // Guard against races if the user switches tracks before the request resolves.
    let cancelled = false;
    setAudioSrc("");
    (async () => {
      try {
        const { url } = await api.getStreamUrl(song.id);
        if (cancelled) return;
        setAudioSrc(url);
        if (audioRef.current) {
          audioRef.current.load();
        }
      } catch (error) {
        if (!cancelled && !(error as any)?.isRateLimit) {
          toast.error("Failed to load song");
        }
      }
    })();
    // Update Media Session metadata (for OS media controls)
    if ((navigator as any).mediaSession) {
      try {
        (navigator as any).mediaSession.metadata = new (
          window as any
        ).MediaMetadata({
          title: song.title,
          artist: song.artist_name,
          album: "",
          // Fall back to a branded default cover so OS media controls don't
          // show the site favicon when a song has no cover image.
          artwork: [
            {
              src: song.cover_image || getDefaultCover(),
              sizes: "512x512",
              type: "image/png",
            },
          ],
        });

        (navigator as any).mediaSession.setActionHandler("play", () =>
          setIsPlaying(true)
        );
        (navigator as any).mediaSession.setActionHandler("pause", () =>
          setIsPlaying(false)
        );
        (navigator as any).mediaSession.setActionHandler("previoustrack", () =>
          // map to our previous-click logic: restart first, then prev on quick second click
          handlePrevClick()
        );
        (navigator as any).mediaSession.setActionHandler("nexttrack", onNext);
      } catch (e) {
        // ignore if MediaSession not supported
      }
    }

    return () => {
      cancelled = true;
    };
  }, [song]);

  // sync audio element when parent playback state changes
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // ignore play promise errors (autoplay restrictions)
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    // notify parent to update playing state; parent effect will handle actual audio element
    setIsPlaying(!isPlaying);
  };

  const handlePrevClick = () => {
    const now = Date.now();
    const audioEl = audioRef.current;
    // First click: restart song
    if (
      !lastPrevClick.current ||
      now - lastPrevClick.current > PREV_DOUBLE_CLICK_MS
    ) {
      // restart
      if (audioEl) {
        try {
          audioEl.currentTime = 0;
          setCurrentTime(0);
        } catch {}
      }
      lastPrevClick.current = now;
      // set a timer to clear the click window
      setTimeout(() => {
        lastPrevClick.current = null;
      }, PREV_DOUBLE_CLICK_MS);
      return;
    }

    // second click in timeframe -> go to previous track
    if (
      lastPrevClick.current &&
      now - lastPrevClick.current <= PREV_DOUBLE_CLICK_MS
    ) {
      lastPrevClick.current = null;
      onPrevious();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      // Metadata loaded successfully → the URL works, reset the retry budget
      retryCountRef.current = 0;
      // Restore playback position after a URL refresh (403 recovery)
      if (resumePositionRef.current != null) {
        try {
          audioRef.current.currentTime = resumePositionRef.current;
        } catch {
          // ignore invalid seek
        }
        resumePositionRef.current = null;
      }
      // If the parent says we should be playing, start playback now that metadata is loaded
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // ignore play promise errors (autoplay restrictions)
        });
      }
    }
  };

  // Recover from an expired presigned URL (R2 returns 403) by fetching a fresh
  // one and resuming from the same position.
  const handleAudioError = async () => {
    if (!song || !audioSrc || recoveringRef.current) return;
    if (retryCountRef.current >= MAX_STREAM_RETRIES) return;

    recoveringRef.current = true;
    retryCountRef.current += 1;
    const position = audioRef.current?.currentTime ?? 0;
    const wasPlaying = audioRef.current ? !audioRef.current.paused : isPlaying;

    try {
      const { url } = await api.getStreamUrl(song.id);
      resumePositionRef.current = position;
      setAudioSrc(url);
      if (audioRef.current) audioRef.current.load();
      if (wasPlaying) setIsPlaying(true);
    } catch (error) {
      if (!(error as any)?.isRateLimit) {
        toast.error("Couldn't reload the track");
      }
    } finally {
      recoveringRef.current = false;
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // no object URL cleanup needed (no offline blob usage)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 pointer-events-none">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
        onError={handleAudioError}
      />

      <div className="pointer-events-auto mx-auto max-w-4xl bg-card/70 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg animate-slide-up overflow-hidden">
        {/* Progress bar */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span className="hidden sm:block text-[11px] text-muted-foreground tabular-nums w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="hidden sm:block text-[11px] text-muted-foreground tabular-nums w-9">
            {formatTime(duration)}
          </span>
        </div>

        {/* Main row */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-2">
          {/* Song info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {song.cover_image ? (
              <img
                src={song.cover_image}
                alt={song.title}
                className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{song.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {song.artist_name}
              </p>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevClick}
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="w-11 h-11 rounded-full hero-gradient text-primary-foreground hover:scale-105 transition-transform border-0 shadow"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume (desktop) */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end max-w-[150px]">
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(v) => setVolume(v[0])}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
