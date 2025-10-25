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
import { Song } from "@/lib/api";

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
  const [audioSrc, setAudioSrc] = useState<string>(song.audio_file);
  const lastPrevClick = useRef<number | null>(null);
  const PREV_DOUBLE_CLICK_MS = 1200; // timeframe to go to previous track

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    // Reset time when a new song is selected
    setCurrentTime(0);
    // set audio src to the provided song URL
    setAudioSrc(song.audio_file);
    if (audioRef.current) {
      audioRef.current.load();
    }
    // Update Media Session metadata (for OS media controls)
    if ((navigator as any).mediaSession) {
      try {
        (navigator as any).mediaSession.metadata = new (
          window as any
        ).MediaMetadata({
          title: song.title,
          artist: song.artist_name,
          album: "",
          artwork: song.cover_image
            ? [{ src: song.cover_image, sizes: "512x512", type: "image/png" }]
            : [],
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
      // If the parent says we should be playing, start playback now that metadata is loaded
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // ignore play promise errors (autoplay restrictions)
        });
      }
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
    // fixed bottom-0
    <div className="fixed bottom-0  left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 animate-slide-up">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />

      <div className="container mx-auto px-2 py-2">
        <div className="flex items-center gap-4 max-[700px]:flex-col max-[700px]:w-full">
          {/* Song Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 max-w-fit">
            {song.cover_image ? (
              <img
                src={song.cover_image}
                alt={song.title}
                className="w-14 h-14 rounded object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate max-[700px]:whitespace-normal">
                {song.title}
              </p>
              <p className="text-sm text-muted-foreground truncate max-[700px]:whitespace-normal">
                {song.artist_name}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-[700px]:w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevClick}
                className="hover:bg-primary/10"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full hero-gradient text-primary-foreground hover:opacity-90"
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
                className="hover:bg-primary/10"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
