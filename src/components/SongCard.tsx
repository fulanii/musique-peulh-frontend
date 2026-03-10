import { Play, Pause, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/lib/api";
import { memo } from "react";

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  isActive?: boolean;
}

const SongCard = ({
  song,
  onPlay,
  onPause,
  isPlaying,
  isActive = false,
}: SongCardProps) => {
  return (
    <div
      className={`group flex items-center gap-4 w-full rounded-md px-3 py-2 pr-6 transition-colors ${
        isActive
          ? "bg-primary/10"
          : "hover:bg-muted/60"
      }`}
    >
      {/* Cover + play overlay */}
      <div className="relative flex-shrink-0 w-12 h-12">
        {song.cover_image ? (
          <img
            src={song.cover_image}
            alt={song.title}
            loading="lazy"
            decoding="async"
            className="object-cover w-12 h-12 rounded"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
            <Music2 className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
          <Button
            onClick={isPlaying ? onPause : onPlay}
            size="icon"
            className="rounded-full w-10 h-10 hero-gradient text-primary-foreground hover:scale-105 transition-transform border-0 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate text-sm ${
            isActive ? "text-primary" : "text-foreground"
          }`}
        >
          {song.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist_name}
        </p>
      </div>

      {/* Duration */}
      <span className="text-sm text-muted-foreground tabular-nums flex-shrink-0 min-w-[4rem] text-right">
        {song.duration || "—"}
      </span>
    </div>
  );
};

export default memo(SongCard);
