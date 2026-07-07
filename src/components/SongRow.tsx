import { Pause, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Song } from "@/lib/api";

interface SongRowProps {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
}

const SongRow = ({ song, isActive, isPlaying, onClick }: SongRowProps) => {
  const rowPlaying = isActive && isPlaying;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 cursor-pointer border-b border-border/50 last:border-0 transition-colors ${
        isActive ? "bg-primary/10" : "hover:bg-muted/60"
      }`}
    >
      {/* Title + artist stacked */}
      <div className="flex-1 min-w-0">
        <p
          className={`flex items-center gap-1.5 truncate text-sm font-medium ${
            isActive ? "text-primary" : "text-foreground"
          }`}
        >
          {rowPlaying && <Pause className="w-3.5 h-3.5 flex-shrink-0" />}
          <span className="truncate">{song.title}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {song.artist_name}
        </p>
      </div>

      {/* Duration - far right */}
      <span className="text-sm text-muted-foreground tabular-nums flex-shrink-0">
        {song.duration || "—"}
      </span>

      {/* Options menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="Song options"
            className="flex items-center justify-center w-8 h-8 -mr-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Disabled until the backend endpoints exist */}
          <DropdownMenuItem disabled>Add To Playlist</DropdownMenuItem>
          <DropdownMenuItem disabled>Remove From Playlist</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SongRow;
